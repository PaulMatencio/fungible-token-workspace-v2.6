import type { SignerCrypto } from '@/application/ports';
import { bytesToHex } from '@/domain/hex';
import { computeDigest, pointFromJson, randomBytes, signerCommitment, verifyApprovalFile } from './signing';

export const signerCrypto: SignerCrypto = {
  computeDigest,
  verifyApproval: verifyApprovalFile,
  commitmentFor: (pk, salt) => signerCommitment(pointFromJson(pk), salt),
  randomSaltHex: () => bytesToHex(randomBytes(32))
};
