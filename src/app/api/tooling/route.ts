import { NextResponse, type NextRequest } from 'next/server';
import type { ToolingAction } from '@/application/ports';
import { runTooling, toolingEnabled } from '@/infrastructure/tooling/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 900;

const ACTIONS: readonly ToolingAction[] = ['compile', 'generate-sdk', 'generate-tests', 'run-tests', 'status'];
const LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

/** Same-origin, loopback-only guard: this endpoint spawns local processes. */
function allowed(req: NextRequest): boolean {
  const host = req.headers.get('host') ?? '';
  const origin = req.headers.get('origin');
  if (process.env.MIDNIGHT_TOOLING_ANY_HOST !== '1' && !LOCAL.test(host)) return false;
  return origin === null || new URL(origin).host === host;
}

export async function POST(req: NextRequest) {
  if (!toolingEnabled()) return NextResponse.json({ error: 'Tooling disabled' }, { status: 403 });
  if (!allowed(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  const action = ACTIONS.find((a) => a === body?.action);
  if (!action) return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  return NextResponse.json(await runTooling(action));
}
