import { createHash } from 'node:crypto';
import { router, json, db } from '@appdeploy/sdk';
import { askTwin, InvalidModelResponse } from './ask-twin';
import { validRequest } from '../shared/contracts';

interface RateRecord { createdAt: number }
class RateLimitError extends Error {}

// Basic durable per-source-IP throttling. No messages or memory are written to the DB.
// This SDK does not offer atomic counters: simultaneous requests may exceed the limit
// slightly. A platform/WAF atomic budget is required before high-traffic rollout.
async function reserveRequest(sourceIp: string): Promise<void> {
  const now = Date.now();
  const table = 'ask-rate-' + createHash('sha256').update('ask-construct-v1:' + sourceIp).digest('hex').slice(0, 32);
  const { items, nextToken } = await db.list<RateRecord>(table, { limit: 50 });
  const stale = items.filter(item => item.createdAt < now - 3600000);
  if (stale.length) await db.delete(table, stale.map(item => item.id));
  const active = items.filter(item => item.createdAt >= now - 3600000);
  if (nextToken || active.length >= 20 || active.filter(item => item.createdAt >= now - 60000).length >= 6) throw new RateLimitError();
  const [id] = await db.add(table, [{ createdAt: now }]);
  if (!id) throw new Error('rate_reservation_failed');
}

function response(status: number, message: string, code: string, retryAfter?: number) {
  const value = json({ error: message, code }, status);
  value.headers['Cache-Control'] = 'no-store';
  if (retryAfter) value.headers['Retry-After'] = String(retryAfter);
  return value;
}

export const handler = router({
  'POST /api/ask-twin': [async ({ body, event }) => {
    if (!validRequest(body)) return response(400, 'Please send a question of 1–2,000 characters with valid session context.', 'invalid_request');
    // Only use trusted gateway context, not client-supplied forwarded headers.
    const sourceIp = event?.requestContext?.http?.sourceIp || event?.requestContext?.identity?.sourceIp;
    if (typeof sourceIp !== 'string' || sourceIp.length > 100) return response(503, 'Ask Construct cannot verify its request limits right now. Please try again later.', 'request_context_unavailable');
    try {
      await reserveRequest(sourceIp);
      const result = await askTwin(body);
      const output = json(result);
      output.headers['Cache-Control'] = 'no-store';
      return output;
    } catch (caught) {
      if (caught instanceof RateLimitError) return response(429, 'You have reached this connection’s Ask Construct limit. Please try again later.', 'rate_limited', 60);
      if (caught instanceof InvalidModelResponse) {
        // A fixed reason code only: never log visitor data or rejected model text.
        console.error('ask_construct_response_rejected', caught.message);
        return response(502, 'Construct could not verify that answer. Please retry or rephrase your question.', 'answer_validation_failed_' + caught.message);
      }
      const details = caught as { statusCode?: number; responseText?: string };
      if (details?.statusCode === 429) {
        const database = /AppDatabaseQuotaExceeded/.test(details.responseText || '');
        return response(429, database ? 'AppDeploy returned AppDatabaseQuotaExceeded. Please try again later.' : 'The AI service is currently rate-limited. Please try again later.', database ? 'AppDatabaseQuotaExceeded' : 'provider_rate_limited', 60);
      }
      console.error('ask_construct_unavailable', caught instanceof Error ? caught.name : 'unknown_error');
      return response(503, 'Ask Construct is temporarily unavailable. Your question has not been completed. Please try again.', 'service_unavailable');
    }
  }],
  // Platform health route; intentionally excluded from user-facing workflows.
  'GET /api/_healthcheck': [async () => json({ status: 'ok', service: 'ask-construct-v1', streaming: false, enquiryDelivery: false })],
});
