import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { NextResponse, type NextRequest } from 'next/server';
import { contractConfig } from '@/infrastructure/config/network';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Only ZK artefacts the SDK's FetchZkConfigProvider requests: keys/*.{prover,verifier}, zkir/*.bzkir. */
const ALLOWED = /^(keys\/[A-Za-z0-9_]+\.(prover|verifier)|zkir\/[A-Za-z0-9_]+\.bzkir)$/;

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  // parts[0] is the contract name segment; the rest is the artefact path.
  if (parts[0] !== contractConfig.name) return new NextResponse('Not found', { status: 404 });
  const rel = parts.slice(1).join('/');
  if (!ALLOWED.test(rel)) return new NextResponse('Not found', { status: 404 });
  const file = path.resolve(process.cwd(), contractConfig.managedDir, rel);
  try {
    const st = statSync(file);
    const stream = Readable.toWeb(createReadStream(file)) as ReadableStream;
    return new NextResponse(stream, {
      headers: {
        'content-type': 'application/octet-stream',
        'content-length': String(st.size),
        'cache-control': 'public, max-age=3600',
        'access-control-allow-origin': '*'
      }
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
