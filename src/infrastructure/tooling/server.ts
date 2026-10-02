/**
 * Server-only tooling: drives the Compact CLI and vitest for the workspace.
 * Commands and paths come exclusively from midnight.config.json — never from
 * request input — so the HTTP surface cannot be used to run arbitrary code.
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { TestSummary, ToolingAction, ToolingResult, ToolingStatus } from '@/application/ports';
import { contractConfig } from '../config/network';
import { generateSdkSource, generateTestSource, type ContractInfo } from './typeMap';

const ROOT = process.cwd();
const abs = (p: string) => path.resolve(ROOT, p);

export function toolingEnabled(): boolean {
  return process.env.MIDNIGHT_TOOLING === '1' || process.env.NODE_ENV !== 'production';
}

let busy = false;

interface RunOut {
  code: number;
  out: string;
}

function run(cmd: string, args: string[], timeoutMs = 15 * 60_000): Promise<RunOut> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, env: { ...process.env, FORCE_COLOR: '0', CI: '1' } });
    let out = '';
    const cap = (d: Buffer) => {
      out += d.toString();
      if (out.length > 400_000) out = out.slice(-300_000);
    };
    child.stdout.on('data', cap);
    child.stderr.on('data', cap);
    const t = setTimeout(() => child.kill('SIGKILL'), timeoutMs);
    child.on('error', (e) => {
      clearTimeout(t);
      resolve({ code: 127, out: `${out}\n${e.message}` });
    });
    child.on('close', (code) => {
      clearTimeout(t);
      resolve({ code: code ?? 1, out });
    });
  });
}

async function readInfo(): Promise<ContractInfo | null> {
  try {
    return JSON.parse(await readFile(abs(`${contractConfig.managedDir}/compiler/contract-info.json`), 'utf8')) as ContractInfo;
  } catch {
    return null;
  }
}

export async function status(): Promise<ToolingStatus> {
  const info = await readInfo();
  const has = async (dir: string) => existsSync(abs(dir)) && (await readdir(abs(dir))).length > 0;
  return {
    compiled: !!info,
    compilerVersion: info?.['compiler-version'],
    circuits: info?.circuits.filter((c) => !c.pure).map((c) => c.name) ?? [],
    sdkGenerated: await has(contractConfig.sdkDir),
    testsGenerated: await has(contractConfig.testsDir),
    managedDir: contractConfig.managedDir,
    enabled: toolingEnabled()
  };
}

async function compile(): Promise<{ ok: boolean; log: string; files?: string[] }> {
  // scripts/compile.mjs pins the compiler from midnight.config.json (and handles older-toolchain compatibility).
  const r = await run('node', ['scripts/compile.mjs', 'contract']);
  const tools = r.code === 0 ? await run('node', ['scripts/compile.mjs', 'tools']) : null;
  const info = await readInfo();
  return {
    ok: r.code === 0 && (tools?.code ?? 0) === 0 && !!info,
    log: `${r.out}${tools ? `\n${tools.out}` : ''}`,
    files: info ? [contractConfig.managedDir, 'contract/managed/signer-tools'] : []
  };
}

async function generateSdk(): Promise<{ ok: boolean; log: string; files?: string[] }> {
  const info = await readInfo();
  if (!info) return { ok: false, log: 'Contract is not compiled yet. Run "Compile" first.' };
  const dir = abs(contractConfig.sdkDir);
  await mkdir(dir, { recursive: true });
  const rel = path.relative(dir, abs(contractConfig.managedDir)).split(path.sep).join('/');
  const files = generateSdkSource(info, contractConfig.name, rel);
  const written: string[] = [];
  for (const [name, content] of Object.entries(files)) {
    await writeFile(path.join(dir, name), content);
    written.push(`${contractConfig.sdkDir}/${name}`);
  }
  return { ok: true, log: `Generated ${written.length} SDK files from ${info.circuits.length} circuits.`, files: written };
}

async function generateTests(): Promise<{ ok: boolean; log: string; files?: string[] }> {
  const info = await readInfo();
  if (!info) return { ok: false, log: 'Contract is not compiled yet. Run "Compile" first.' };
  const dir = abs(contractConfig.testsDir);
  await mkdir(dir, { recursive: true });
  const rel = path.relative(dir, abs(contractConfig.managedDir)).split(path.sep).join('/');
  const file = path.join(dir, `${contractConfig.name}.generated.test.ts`);
  await writeFile(file, generateTestSource(info, contractConfig.name, rel));
  return { ok: true, log: `Generated ${path.relative(ROOT, file)}`, files: [path.relative(ROOT, file)] };
}

interface VitestJson {
  numTotalTests: number;
  numPassedTests: number;
  numFailedTests: number;
  testResults: { assertionResults: { fullName: string; status: string; failureMessages?: string[]; duration?: number }[] }[];
}

async function runTests(): Promise<{ ok: boolean; log: string; tests?: TestSummary }> {
  const r = await run('npx', ['vitest', 'run', '--reporter=json', '--outputFile.json=.tooling-test-result.json']);
  let tests: TestSummary | undefined;
  try {
    const j = JSON.parse(await readFile(abs('.tooling-test-result.json'), 'utf8')) as VitestJson;
    tests = {
      total: j.numTotalTests,
      passed: j.numPassedTests,
      failed: j.numFailedTests,
      cases: j.testResults.flatMap((f) =>
        f.assertionResults.map((a) => ({
          name: a.fullName,
          status: a.status === 'passed' ? ('passed' as const) : a.status === 'failed' ? ('failed' as const) : ('skipped' as const),
          message: a.failureMessages?.[0]?.split('\n')[0],
          durationMs: a.duration
        }))
      )
    };
  } catch {
    /* fall through with raw log */
  }
  return { ok: r.code === 0, log: r.out.slice(-20_000), tests };
}

export async function runTooling(action: ToolingAction): Promise<ToolingResult> {
  const start = Date.now();
  if (!toolingEnabled()) {
    return { ok: false, action, durationMs: 0, log: 'Tooling is disabled in production. Set MIDNIGHT_TOOLING=1 to enable it on a trusted host.' };
  }
  if (action === 'status') return { ok: true, action, durationMs: 0, log: '', status: await status() };
  if (busy) return { ok: false, action, durationMs: 0, log: 'Another tooling task is running. Wait for it to finish.' };
  busy = true;
  try {
    const r =
      action === 'compile'
        ? await compile()
        : action === 'generate-sdk'
          ? await generateSdk()
          : action === 'generate-tests'
            ? await generateTests()
            : await runTests();
    return { action, durationMs: Date.now() - start, status: await status(), ...r } as ToolingResult;
  } catch (e) {
    return { ok: false, action, durationMs: Date.now() - start, log: (e as Error).message };
  } finally {
    busy = false;
  }
}
