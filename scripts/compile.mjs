#!/usr/bin/env node
/**
 * Compiles the token contract or the signer-tools module with the compiler
 * pinned in midnight.config.json (`contract.compilerVersion`).
 *
 * midnight-js 4.1.1 / compact-js 2.5.1 only run contracts built for
 * compact-runtime 0.16.0, i.e. compiler 0.31.x. The v2.6 source differs from
 * what 0.31.x accepts in exactly one way: explicit `as JubjubScalar` casts
 * (that type only exists from toolchain 0.34, where the cast is a no-op on an
 * already-reduced scalar). For older compilers those casts are stripped into a
 * temporary copy; the source file itself is never modified.
 *
 *   node scripts/compile.mjs contract|tools [--skip-zk]
 *   (contract = the v2.6 token from midnight.config.json)
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const cfg = JSON.parse(readFileSync(path.join(root, 'midnight.config.json'), 'utf8'));
const c = { source: 'contract/fungible_token_v2.6.compact', managedDir: 'contract/managed/fungible-token-v2.6', compilerVersion: '0.31.1', ...(cfg.contract ?? {}) };

const target = process.argv[2];
const skipZk = process.argv.includes('--skip-zk');
const job =
  target === 'tools'
    ? { source: 'contract/tools/signer-tools.compact', out: 'contract/managed/signer-tools', skipZk: true }
    : target === 'contract'
      ? { source: c.source, out: c.managedDir, skipZk }
      : null;
if (!job) {
  console.error('usage: node scripts/compile.mjs contract|tools [--skip-zk]');
  process.exit(2);
}

const [maj, min] = c.compilerVersion.split('.').map(Number);
const needsCompat = maj === 0 && min < 34;
let source = job.source;
if (needsCompat) {
  const dir = path.join(root, 'contract', '.compat');
  mkdirSync(dir, { recursive: true });
  source = path.join('contract', '.compat', path.basename(job.source));
  writeFileSync(path.join(root, source), readFileSync(path.join(root, job.source), 'utf8').replaceAll(' as JubjubScalar', ''));
  console.log(`[compile] compiler ${c.compilerVersion} < 0.34: stripped "as JubjubScalar" casts into ${source}`);
}

const args = ['compile', `+${c.compilerVersion}`, ...(job.skipZk ? ['--skip-zk'] : []), source, job.out];
console.log(`$ compact ${args.join(' ')}`);
const r = spawnSync('compact', args, { cwd: root, stdio: 'inherit' });
process.exit(r.status ?? 1);
