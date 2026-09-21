// Local validation declarations copied from the documented AppDeploy SDK contract.
// These provide types only. AppDeploy injects the real SDK during deployment.
declare module '@appdeploy/client' {
  export const api: {
    get(url: string, data?: unknown): Promise<{ data: unknown }>;
    post(url: string, data?: unknown): Promise<{ data: unknown }>;
    put(url: string, data?: unknown): Promise<{ data: unknown }>;
    delete(url: string, data?: unknown): Promise<{ data: unknown }>;
  };
}
declare module '@appdeploy/sdk' {
  interface Response { statusCode: number; headers: Record<string, string>; body: string }
  interface Context { body: unknown; event: { requestContext?: { http?: { sourceIp?: string }; identity?: { sourceIp?: string } } } }
  export function json(value: unknown, status?: number): Response;
  export function error(message: string, status?: number): Response;
  export function router(routes: Record<string, Array<(context: Context) => Promise<Response>>>): (event: unknown) => Promise<Response>;
  export const ai: { generate(options: { system?: string; messages?: Array<{ role: 'user' | 'assistant' | 'system' | 'model'; content: string }>; schema?: Record<string, unknown>; thinkingMode?: 'NONE' | 'FAST' | 'DEEP'; temperature?: number; maxTokens?: number }): Promise<{ text: string }> };
  export const db: {
    list<T>(table: string, options?: { limit?: number; nextToken?: string }): Promise<{ items: Array<T & { id: string }>; nextToken?: string }>;
    add(table: string, records: Array<Record<string, unknown>>): Promise<Array<string | null>>;
    delete(table: string, ids: string[]): Promise<boolean[]>;
  };
}
declare module 'node:crypto' {
  export function createHash(algorithm: string): { update(value: string): { digest(encoding: 'hex'): string } };
}
