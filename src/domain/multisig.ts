import type { JubjubPointJson } from './token';

/** Request/approval file formats are byte-compatible with signer-tools (v1). */
export type MultisigOp =
  | { type: 'mint'; to: string; value: string }
  | { type: 'burn'; account: string; value: string }
  | { type: 'setEmergencyPauser'; newPauser: string }
  | { type: 'adminReallocate'; trappedAccount: string; targetSpendableAccount: string; amount: string }
  | { type: 'rotateSigner'; oldSignerCommitment: string; newSignerPubkey: JubjubPointJson };

export interface SigningRequest {
  version: 1;
  network?: string;
  contractAddress: string;
  contractSalt?: string;
  nonce: string;
  op: MultisigOp;
}

export interface ApprovalFile {
  version: 1;
  kind: 'approval' | 'pop';
  operation: string;
  contractAddress: string;
  nonce: string;
  digest: string;
  publicKey: JubjubPointJson;
  signature: { announcement: JubjubPointJson; response: string };
}

const isPoint = (p: unknown): p is JubjubPointJson =>
  !!p &&
  typeof p === 'object' &&
  /^\d+$/.test((p as JubjubPointJson).x ?? '') &&
  /^\d+$/.test((p as JubjubPointJson).y ?? '');

/** Structural validation for uploaded approval files (untrusted input). */
export function parseApprovalFile(text: string): ApprovalFile {
  let j: unknown;
  try {
    j = JSON.parse(text);
  } catch {
    throw new Error('Approval file is not valid JSON');
  }
  const a = j as Partial<ApprovalFile>;
  if (
    !a ||
    a.version !== 1 ||
    (a.kind !== 'approval' && a.kind !== 'pop') ||
    typeof a.digest !== 'string' ||
    !/^[0-9a-f]{64}$/i.test(a.digest) ||
    !isPoint(a.publicKey) ||
    !a.signature ||
    !isPoint(a.signature.announcement) ||
    !/^\d+$/.test(a.signature.response ?? '')
  ) {
    throw new Error('Not a valid signer-tool approval file');
  }
  return a as ApprovalFile;
}

export const MULTISIG_SLOTS = 3;

/** An in-progress multisig operation, persisted per contract so a reload doesn't lose collected approvals. */
export interface MultisigDraft {
  version: 1;
  /** Operation type tab that was selected. */
  type: string;
  /** Raw form values. */
  values: Record<string, string>;
  request: SigningRequest | null;
  approvals: ApprovalFile[];
  pop: ApprovalFile | null;
  savedAt: number;
}
