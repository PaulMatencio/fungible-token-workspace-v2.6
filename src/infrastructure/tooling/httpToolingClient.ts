import type { ToolingAction, ToolingPort, ToolingResult } from '@/application/ports';

/** Browser-side adapter for the /api/tooling route. */
export class HttpToolingClient implements ToolingPort {
  async run(action: ToolingAction): Promise<ToolingResult> {
    const res = await fetch('/api/tooling', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const body = (await res.json().catch(() => null)) as ToolingResult | { error: string } | null;
    if (!body || 'error' in body) {
      return { ok: false, action, durationMs: 0, log: body && 'error' in body ? body.error : `HTTP ${res.status}` };
    }
    return body;
  }
}
