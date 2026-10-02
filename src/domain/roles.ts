export type Role = 'manager' | 'cosigner' | 'user';

export interface RoleContext {
  role: Role;
  /** 64-hex token account derived from the local secret key + contract salt. */
  account: string;
  /** Present when the connected user holds a registered multisig signer key. */
  signerCommitment?: string;
  /** A manager may also be a cosigner; both capabilities are kept. */
  isManager: boolean;
  isCosigner: boolean;
}

/**
 * Role resolution rules (plan §roles):
 *  - Contract Manager: the account equal to the ledger `owner`.
 *  - Cosigner: holds a signer public key whose commitment is registered.
 *  - Standard user: everyone else.
 * Manager wins when both apply for the primary role.
 */
export function resolveRole(args: {
  account: string;
  owner: string;
  signerCommitment?: string;
  registeredCommitments: readonly string[];
}): RoleContext {
  const isManager = args.account.toLowerCase() === args.owner.toLowerCase();
  const isCosigner =
    !!args.signerCommitment &&
    args.registeredCommitments.some((c) => c.toLowerCase() === args.signerCommitment!.toLowerCase());
  return {
    role: isManager ? 'manager' : isCosigner ? 'cosigner' : 'user',
    account: args.account,
    signerCommitment: isCosigner ? args.signerCommitment : undefined,
    isManager,
    isCosigner
  };
}
