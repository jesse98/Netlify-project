export const SYSTEM_IDS = ['identity', 'communication', 'automation', 'sales', 'crm', 'privacy'] as const;
export const INTENTS = ['general', 'twin_identity', 'capability', 'business_problem', 'integration', 'technical', 'privacy_security', 'comparison', 'pricing_timeline', 'implementation', 'follow_up', 'correction', 'action_request', 'out_of_scope'] as const;
export type SystemId = (typeof SYSTEM_IDS)[number];
export type Intent = (typeof INTENTS)[number];
export type Action = 'none' | 'explore' | 'scope' | 'handoff';
export interface Turn { role: 'user' | 'assistant'; content: string }
export interface Fact {
  key: string;
  value: string;
  source: 'user_explicit' | 'inferred';
  confidence: 'confirmed' | 'tentative';
  turn: number;
}
export interface Memory {
  facts: Fact[];
  decisions: string[];
  assumptions: string[];
  unknowns: string[];
  threads: Array<{ name: string; summary: string; active: boolean }>;
}
export interface Brief {
  business: string;
  objectives: string[];
  software: string[];
  firstWorkflow: string;
  constraints: string[];
  verificationRequired: string[];
}
export interface TwinResponse {
  answer: string;
  intent: Intent;
  relevantCapabilities: Array<{ systemId: SystemId; featureId: string }>;
  suggestedQuestions: string[];
  action: Action;
  commercialIntent: 'none' | 'exploring' | 'ready';
  memory: Memory;
  implementationBrief: Brief;
}
export interface AskRequest { message: string; history: Turn[]; memory: Memory; turn: number }
export const emptyMemory = (): Memory => ({ facts: [], decisions: [], assumptions: [], unknowns: [], threads: [] });
export const emptyBrief = (): Brief => ({ business: '', objectives: [], software: [], firstWorkflow: '', constraints: [], verificationRequired: [] });
const object = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown, max: number): value is string => typeof value === 'string' && value.length <= max;
const texts = (value: unknown, count: number, max: number): value is string[] => Array.isArray(value) && value.length <= count && value.every(item => text(item, max));

export function validMemory(value: unknown): value is Memory {
  if (!object(value) || !Array.isArray(value.facts) || value.facts.length > 30 || !Array.isArray(value.threads) || value.threads.length > 6) return false;
  return value.facts.every(f => object(f) && text(f.key, 80) && text(f.value, 300) && ['user_explicit', 'inferred'].includes(String(f.source)) && ['confirmed', 'tentative'].includes(String(f.confidence)) && Number.isInteger(f.turn) && Number(f.turn) >= 1 && Number(f.turn) <= 1000 && (f.source !== 'inferred' || f.confidence === 'tentative'))
    && texts(value.decisions, 12, 300) && texts(value.assumptions, 12, 300) && texts(value.unknowns, 16, 300)
    && value.threads.every(t => object(t) && text(t.name, 100) && text(t.summary, 600) && typeof t.active === 'boolean');
}

export function validRequest(value: unknown): value is AskRequest {
  return object(value) && text(value.message, 2000) && value.message.trim().length > 0
    && Array.isArray(value.history) && value.history.length <= 24
    && value.history.every(t => object(t) && ['user', 'assistant'].includes(String(t.role)) && text(t.content, 7000))
    && Number.isInteger(value.turn) && Number(value.turn) >= 1 && Number(value.turn) <= 1000
    && validMemory(value.memory) && JSON.stringify(value).length <= 50000;
}

export function validResponse(value: unknown, capabilities: Map<string, Set<string>>): value is TwinResponse {
  if (!object(value) || !text(value.answer, 7000) || !value.answer.trim() || !INTENTS.includes(value.intent as Intent)
    || !['none', 'explore', 'scope', 'handoff'].includes(String(value.action))
    || !['none', 'exploring', 'ready'].includes(String(value.commercialIntent))
    || !texts(value.suggestedQuestions, 3, 180) || !validMemory(value.memory)
    || !Array.isArray(value.relevantCapabilities) || value.relevantCapabilities.length > 3
    || !value.relevantCapabilities.every(c => object(c) && capabilities.has(String(c.systemId)) && text(c.featureId, 80) && (!c.featureId || capabilities.get(String(c.systemId))!.has(c.featureId)))) return false;
  const b = value.implementationBrief;
  return object(b) && text(b.business, 300) && text(b.firstWorkflow, 800) && texts(b.objectives, 8, 300)
    && texts(b.software, 12, 120) && texts(b.constraints, 12, 300) && texts(b.verificationRequired, 12, 300);
}

// Best-effort credential redaction is a safeguard, not a promise to detect every secret.
export function redactSecrets(value: string): string {
  return value.replace(/\b(password|api[_ -]?key|access[_ -]?token|secret)\s*[:=]\s*[^\s,;]+/gi, '$1: [removed]')
    .replace(/\b(?:sk-|sk_live_|sk_test_|ghp_|github_pat_|xox[baprs]-)[A-Za-z0-9_-]{12,}\b/g, '[credential_removed]')
    .replace(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, '[private key removed]');
}

export function cleanRequest(request: AskRequest): AskRequest {
  const clean = scrubStrings(request) as AskRequest;
  // Provenance is checked against current turn; browser memory is never product evidence.
  clean.memory.facts = clean.memory.facts.filter(f => f.turn < request.turn);
  return clean;
}

export function scrubStrings(value: unknown): unknown {
  if (typeof value === 'string') return redactSecrets(value);
  if (Array.isArray(value)) return value.map(scrubStrings);
  if (object(value)) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, scrubStrings(item)]));
  return value;
}

export function unsafeClaim(answer: string): boolean {
  return /\b(?:I|we)(?:['’]ve| have)?\s+(?:successfully\s+|already\s+)?(?:sent|connected|booked|deployed|installed|processed|paid|deleted|submitted|emailed|accessed|updated)\b/i.test(answer)
    || /\b(?:email|enquiry|payment|invoice|booking)\s+(?:has been|was|is now)\s+(?:sent|submitted|paid|processed|booked)\b/i.test(answer)
    || /\b(?:integrate(?:s)? with (?:everything|any software)|guaranteed (?:ROI|savings)|zero retention|fully GDPR compliant)\b/i.test(answer);
}

export function briefText(brief: Brief): string {
  const list = (items: string[]) => items.length ? items.map(s => '- ' + s).join('\n') : 'Not specified';
  return ['Construct | Implementation enquiry draft', '', 'Business: ' + (brief.business || 'Not specified'), '', 'Objectives', list(brief.objectives), '', 'Current software (visitor supplied; connections not verified)', list(brief.software), '', 'Potential first workflow', brief.firstWorkflow || 'To be scoped', '', 'Constraints and decisions', list(brief.constraints), '', 'Integration checks and outstanding questions', list(brief.verificationRequired), '', 'Requested next step: discuss scope and feasibility.', '', 'Draft only. No enquiry has been submitted and no systems have been connected.'].join('\n');
}

// Explicit review requests should not depend on the model's sales classification.
export function requestsImplementationBrief(message: string): boolean {
  return message.toLowerCase().split(/[.!?;\n]/).some(sentence => {
    if (/\b(?:do not|don't|dont|no need to|avoid|skip|without)\s+(?:prepare|create|draft|write|show|review|preparing|creating|drafting|writing|reviewing)\b/.test(sentence)) return false;
    return /\b(?:prepare|create|draft|write|show|review|give me)\b[^.!?;\n]{0,100}\b(?:implementation\s+)?brief\b/.test(sentence);
  });
}

const stringSchema = { type: 'string' };
const stringArray = { type: 'array', items: stringSchema };
const obj = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
export const RESPONSE_SCHEMA = obj({
  answer: stringSchema,
  intent: { type: 'string', enum: [...INTENTS] },
  relevantCapabilities: { type: 'array', maxItems: 3, items: obj({ systemId: { type: 'string', enum: [...SYSTEM_IDS] }, featureId: stringSchema }) },
  suggestedQuestions: { ...stringArray, maxItems: 3 },
  action: { type: 'string', enum: ['none', 'explore', 'scope', 'handoff'] },
  commercialIntent: { type: 'string', enum: ['none', 'exploring', 'ready'] },
  memory: obj({
    facts: { type: 'array', maxItems: 30, items: obj({ key: stringSchema, value: stringSchema, source: { type: 'string', enum: ['user_explicit', 'inferred'] }, confidence: { type: 'string', enum: ['confirmed', 'tentative'] }, turn: { type: 'integer' } }) },
    decisions: { ...stringArray, maxItems: 12 }, assumptions: { ...stringArray, maxItems: 12 }, unknowns: { ...stringArray, maxItems: 16 },
    threads: { type: 'array', maxItems: 6, items: obj({ name: stringSchema, summary: stringSchema, active: { type: 'boolean' } }) }
  }),
  implementationBrief: obj({ business: stringSchema, objectives: stringArray, software: stringArray, firstWorkflow: stringSchema, constraints: stringArray, verificationRequired: stringArray })
});
