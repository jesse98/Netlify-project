const messages: Record<string, string> = {
  rate_limited: 'You have reached this connection’s Ask Construct limit. Please try again later.',
  provider_rate_limited: 'The AI service is currently rate-limited. Please try again later.',
  CREDITS_USAGE_LIMIT_REACHED: 'AppDeploy has reached its credit limit. Ask Construct cannot answer until credits are available.',
  AppDatabaseQuotaExceeded: 'AppDeploy returned AppDatabaseQuotaExceeded. Please try again later.',
  answer_validation_failed: 'Construct could not verify that answer. Please retry or rephrase your question.',
  answer_validation_failed_invalid_json: 'Construct returned an incomplete answer. Please retry; your conversation is still here.',
  answer_validation_failed_invalid_contract: 'Construct could not prepare the answer and brief in the required format. Please retry.',
  answer_validation_failed_invalid_memory: 'Construct could not reconcile the session details in that reply. Please retry.',
  answer_validation_failed_invalid_provenance: 'Construct included session details it could not trace to this conversation. Please retry.',
  answer_validation_failed_unsafe_action_claim: 'Construct’s reply included an action or guarantee it could not verify, so it has not been shown. You can retry or ask about a possible workflow.',
  request_context_unavailable: 'Ask Construct cannot verify its request limits right now. Please try again later.',
  invalid_request: 'Please send a question of 1–2,000 characters. If this continues, start a new conversation.',
  service_unavailable: 'Ask Construct is temporarily unavailable. Your question is still here; you can retry.',
};

export function publicFailure(caught: unknown): string {
  const record = (value: unknown): Record<string, unknown> => value && typeof value === 'object' ? value as Record<string, unknown> : {};
  const failure = record(caught);
  const response = record(failure.response);
  let rpc = {};
  if (typeof failure.responseText === 'string' && failure.responseText.length < 10000) {
    try { rpc = record(JSON.parse(failure.responseText)); } catch { /* No raw provider errors are rendered. */ }
  }
  for (const candidate of [record(response.data), record(failure.data), record(rpc), failure]) {
    if (typeof candidate.code === 'string' && Object.prototype.hasOwnProperty.call(messages, candidate.code)) return messages[candidate.code];
  }
  const status = response.status || failure.statusCode || failure.status;
  if (status === 429) return 'Ask Construct is rate-limited right now. Please try again later.';
  return 'Construct could not complete that answer. You can retry; your conversation is still here.';
}
