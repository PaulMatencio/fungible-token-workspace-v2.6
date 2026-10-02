import type { Role } from './roles';

/** Snapshot of the public ledger of FungibleToken v2.6. */
export interface TokenState {
  contractAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  maxSupply: bigint;
  /** 64-hex account of the Contract Manager (ledger `owner`). */
  owner: string;
  contractSalt: string;
  paused: boolean;
  emergencyPauser: string;
  multisigThreshold: number;
  multisigSignerCount: number;
  multisigNonce: bigint;
  /** Signer commitments (64 hex) currently registered. */
  signerCommitments: string[];
}

export interface JubjubPointJson {
  x: string;
  y: string;
}

export interface TxReceipt {
  txId: string;
  txHash: string;
  blockHeight?: number;
}

export type CircuitName =
  | 'mint'
  | 'burn'
  | 'setEmergencyPauser'
  | 'adminReallocate'
  | 'rotateSigner'
  | 'pause'
  | 'unpause'
  | 'transfer'
  | 'approve'
  | 'transferFrom'
  | 'selfBurn'
  | 'emergencyWithdraw';

export type Authority = 'holder' | 'pauser' | 'owner' | 'multisig';

export interface CircuitSpec {
  name: CircuitName;
  authority: Authority;
  /** Roles whose UI exposes this circuit. */
  roles: Role[];
  /** i18n key for the label. */
  labelKey: string;
}

/**
 * Which role sees which circuit. On-chain rules still decide; this only
 * organises the UI (the contract enforces authority itself).
 * - holder circuits (`authenticate(caller)`) work for anyone with tokens;
 * - pause/unpause: owner or emergency pauser;
 * - emergencyWithdraw: owner only, while paused;
 * - multisig circuits: assembled by the manager/cosigners with threshold approvals.
 */
export const CIRCUITS: readonly CircuitSpec[] = [
  { name: 'transfer', authority: 'holder', roles: ['user', 'cosigner', 'manager'], labelKey: 'op.transfer' },
  { name: 'approve', authority: 'holder', roles: ['user', 'cosigner', 'manager'], labelKey: 'op.approve' },
  { name: 'transferFrom', authority: 'holder', roles: ['user', 'cosigner', 'manager'], labelKey: 'op.transferFrom' },
  { name: 'selfBurn', authority: 'holder', roles: ['user', 'cosigner', 'manager'], labelKey: 'op.selfBurn' },
  { name: 'pause', authority: 'pauser', roles: ['manager'], labelKey: 'op.pause' },
  { name: 'unpause', authority: 'pauser', roles: ['manager'], labelKey: 'op.unpause' },
  { name: 'emergencyWithdraw', authority: 'owner', roles: ['manager'], labelKey: 'op.emergencyWithdraw' },
  { name: 'mint', authority: 'multisig', roles: ['manager', 'cosigner'], labelKey: 'op.mint' },
  { name: 'burn', authority: 'multisig', roles: ['manager', 'cosigner'], labelKey: 'op.burn' },
  { name: 'setEmergencyPauser', authority: 'multisig', roles: ['manager', 'cosigner'], labelKey: 'op.setEmergencyPauser' },
  { name: 'adminReallocate', authority: 'multisig', roles: ['manager', 'cosigner'], labelKey: 'op.adminReallocate' },
  { name: 'rotateSigner', authority: 'multisig', roles: ['manager', 'cosigner'], labelKey: 'op.rotateSigner' }
];

export const circuitsForRole = (role: Role): CircuitSpec[] => CIRCUITS.filter((c) => c.roles.includes(role));
