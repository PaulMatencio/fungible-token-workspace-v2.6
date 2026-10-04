'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { actionTracker, activeSink, deployTracker, type DeployProgress } from '@/application/deployProgress';
import { MultisigService } from '@/application/multisigService';
import type { DeployParams, TokenGateway, TxLogEntry } from '@/application/ports';
import { TokenService } from '@/application/tokenService';
import { buildDeployParams, type DeployForm } from '@/application/validation';
import { AppError, friendlyMessage } from '@/domain/errors';
import { bytesToHex } from '@/domain/hex';
import { resolveRole, type RoleContext } from '@/domain/roles';
import type { JubjubPointJson, TokenState } from '@/domain/token';
import { deriveAccount, generateSecretKey } from '@/infrastructure/crypto/identity';
import { signerCrypto } from '@/infrastructure/crypto/signerCrypto';
import { derivePublicKey, pointToJson, randomScalar, selfTest, pointFromJson, type Point } from '@/infrastructure/crypto/signing';
import { networkConfig } from '@/infrastructure/config/network';
import type { ChainGateway as ChainGatewayType } from '@/infrastructure/gateway/chainGateway';
import { SimulatorGateway, type SimulatorSnapshot } from '@/infrastructure/gateway/simulatorGateway';
import { exportAuthorityKey, importAuthorityKey } from '@/infrastructure/storage/authorityKey';
import { decryptKeyBackup, encryptKeyBackup, type BackupPayload, type KeyBackupFile } from '@/infrastructure/crypto/keyBackup';
import { DraftStore } from '@/infrastructure/storage/draftStore';
import { IdentityStore } from '@/infrastructure/storage/identityStore';
import { LocalStorageStore } from '@/infrastructure/storage/kv';
import { TxLog } from '@/infrastructure/storage/txLog';
import { HttpToolingClient } from '@/infrastructure/tooling/httpToolingClient';
import { WalletConnector, detectWallets, waitForWallets, type ConnectorState, type DetectedWallet } from '@/infrastructure/wallet/connector';
import type { AppProviders } from '@/infrastructure/wallet/providers';

/** Chain-side modules pull in midnight-js + effect; load them lazily, only in Wallet Mode. */
const loadChain = async () => {
  const [{ ChainGateway }, { createWalletProviders }] = await Promise.all([
    import('@/infrastructure/gateway/chainGateway'),
    import('@/infrastructure/wallet/providers')
  ]);
  return { ChainGateway, createWalletProviders };
};
export type { ChainGatewayType };

export type Mode = 'test' | 'wallet';

/** Mock identities used in Test Mode. Secret material is test-only and stored locally. */
export interface MockIdentity {
  id: string;
  label: string;
  kind: 'holder' | 'cosigner';
  /** 32-byte token key (hex): every mock identity can hold tokens. */
  secretKeyHex: string;
  /** Cosigners only: Jubjub signing scalar (decimal). */
  signerScalar?: string;
}

const MOCK_LAYOUT: Pick<MockIdentity, 'id' | 'label' | 'kind'>[] = [
  { id: 'manager', label: 'Manager (deployer)', kind: 'holder' },
  { id: 'alice', label: 'Alice', kind: 'holder' },
  { id: 'bob', label: 'Bob', kind: 'holder' },
  { id: 'cosigner1', label: 'Cosigner 1', kind: 'cosigner' },
  { id: 'cosigner2', label: 'Cosigner 2', kind: 'cosigner' },
  { id: 'cosigner3', label: 'Cosigner 3', kind: 'cosigner' }
];

export interface MockSigner {
  id: string;
  label: string;
  sk: bigint;
  pk: Point;
  pubkey: JubjubPointJson;
}

interface AppContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  ready: boolean;
  busy: boolean;
  error: string | null;
  clearError: () => void;
  notice: string | null;
  // wallet
  wallets: DetectedWallet[];
  connector: ConnectorState;
  connectWallet: (key: string) => Promise<void>;
  disconnectWallet: () => void;
  rescanWallets: () => Promise<void>;
  // contract
  gateway: TokenGateway | null;
  state: TokenState | null;
  role: RoleContext | null;
  account: string | null;
  tokenService: TokenService | null;
  multisig: MultisigService | null;
  txs: TxLogEntry[];
  refresh: () => Promise<void>;
  clearHistory: () => Promise<void>;
  // deployment
  deployProgress: DeployProgress | null;
  dismissDeployProgress: () => void;
  /** Progress of the latest contract action (transfer, mint, …). */
  actionProgress: DeployProgress | null;
  dismissActionProgress: () => void;
  /** Wallet Mode: circuits not yet registered on-chain (staged deploy). Empty when complete. */
  missingCircuits: string[];
  registerRemainingCircuits: () => Promise<void>;
  deploy: (form: DeployForm) => Promise<void>;
  attach: (address: string) => Promise<void>;
  forget: () => Promise<void>;
  // identity
  actors: MockIdentity[];
  actorId: string;
  setActorId: (id: string) => void;
  mockSigners: MockSigner[];
  /** Test Mode: actor id → derived 64-hex token account for the current contract. */
  mockAccounts: Record<string, string>;
  identity: IdentityStore;
  drafts: DraftStore;
  exportSecretKey: () => Promise<string>;
  /** Wallet Mode: the deploy-time maintenance authority key of the open contract (null if this browser doesn't hold it). */
  exportAuthorityKey: () => Promise<string | null>;
  importAuthorityKey: (key: string) => Promise<void>;
  importSecretKey: (hex: string) => Promise<void>;
  /** Passphrase-protected backup (scrypt + AES-256-GCM) of the identity key and, in Wallet Mode, the open contract's authority key. */
  createEncryptedBackup: (passphrase: string) => Promise<KeyBackupFile>;
  /** Restores an encrypted backup file (identity key, and the authority key if the file holds one). */
  restoreEncryptedBackup: (fileText: string, passphrase: string) => Promise<{ authorityRestored: boolean }>;
  signerPubkey: JubjubPointJson | null;
  setSignerPubkey: (p: JubjubPointJson | null) => Promise<void>;
  tooling: HttpToolingClient;
  /** Runs an action with busy/error handling; resolves true on success. */
  guard: <T>(fn: () => Promise<T>, okMessage?: string) => Promise<T | undefined>;
}

const Ctx = createContext<AppContextValue | null>(null);
export const useApp = (): AppContextValue => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useApp must be used inside <AppProvider>');
  return c;
};

const store = new LocalStorageStore('ft');
const txLog = new TxLog(store);
const identityStore = new IdentityStore(store);
const draftStore = new DraftStore(store);
const tooling = new HttpToolingClient();

async function loadMocks(): Promise<{ actors: MockIdentity[]; signers: MockSigner[] }> {
  const raw = await store.get('mock:identities');
  let actors: MockIdentity[] | null = raw ? (JSON.parse(raw) as MockIdentity[]) : null;
  if (!actors || actors.length !== MOCK_LAYOUT.length || actors.some((a) => a.kind === 'cosigner' && !a.signerScalar)) {
    actors = MOCK_LAYOUT.map((m) => ({
      ...m,
      secretKeyHex: bytesToHex(generateSecretKey()),
      signerScalar: m.kind === 'cosigner' ? randomScalar().toString() : undefined
    }));
    await store.set('mock:identities', JSON.stringify(actors));
  }
  const signers = actors
    .filter((a) => a.kind === 'cosigner')
    .map((a) => {
      const sk = BigInt(a.signerScalar!);
      const pk = derivePublicKey(sk);
      return { id: a.id, label: a.label, sk, pk, pubkey: pointToJson(pk) };
    });
  return { actors, signers };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>('test');
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [wallets, setWallets] = useState<DetectedWallet[]>([]);
  const [connector, setConnector] = useState<ConnectorState>({ status: 'idle' });
  const connectorRef = useRef(new WalletConnector(networkConfig.networkId));
  const providersRef = useRef<AppProviders | null>(null);

  const [gateway, setGateway] = useState<TokenGateway | null>(null);
  const [state, setState] = useState<TokenState | null>(null);
  const [txs, setTxs] = useState<TxLogEntry[]>([]);
  const [missingCircuits, setMissingCircuits] = useState<string[]>([]);
  const [actors, setActors] = useState<MockIdentity[]>([]);
  const [mockSigners, setMockSigners] = useState<MockSigner[]>([]);
  const [actorId, setActorId] = useState('manager');
  const [signerPubkey, setSignerPubkeyState] = useState<JubjubPointJson | null>(null);
  const [walletSk, setWalletSk] = useState<Uint8Array | null>(null);

  const [deployProgress, setDeployProgress] = useState<DeployProgress | null>(deployTracker.snapshot);
  useEffect(() => deployTracker.subscribe(setDeployProgress), []);
  const [actionProgress, setActionProgress] = useState<DeployProgress | null>(actionTracker.snapshot);
  useEffect(() => actionTracker.subscribe(setActionProgress), []);

  // Leaving mid-deploy would orphan a wallet/proof request; warn the user.
  useEffect(() => {
    if (deployProgress?.status !== 'running' && actionProgress?.status !== 'running') return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [deployProgress?.status, actionProgress?.status]);

  const lastErrorRef = useRef<string | null>(null);
  const gatewayRef = useRef<TokenGateway | null>(null);
  gatewayRef.current = gateway;

  const guard = useCallback(async <T,>(fn: () => Promise<T>, okMessage?: string) => {
    setBusy(true);
    setError(null);
    try {
      const r = await fn();
      if (okMessage) setNotice(okMessage);
      return r;
    } catch (e) {
      lastErrorRef.current = friendlyMessage(e);
      setError(lastErrorRef.current);
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);

  // ---- account resolution -------------------------------------------------
  const actor = actors.find((a) => a.id === actorId);
  const resolveMockSk = useCallback(
    (account: string): Uint8Array => {
      const salt = state?.contractSalt;
      if (!salt) throw new Error('Contract salt unknown');
      for (const a of actors) {
        const sk = Uint8Array.from(a.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16)));
        if (deriveAccount(sk, salt) === account) return sk;
      }
      throw new Error('No mock identity matches this account');
    },
    [actors, state?.contractSalt]
  );

  const account = useMemo(() => {
    if (!state) return null;
    try {
      if (mode === 'test') {
        if (!actor) return null;
        const sk = Uint8Array.from(actor.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16)));
        return deriveAccount(sk, state.contractSalt);
      }
      return walletSk ? deriveAccount(walletSk, state.contractSalt) : null;
    } catch {
      return null;
    }
  }, [state, mode, actor, walletSk]);

  const role = useMemo<RoleContext | null>(() => {
    if (!state || !account) return null;
    let pk: JubjubPointJson | null = null;
    if (mode === 'test') pk = actor?.kind === 'cosigner' ? (mockSigners.find((s) => s.id === actor.id)?.pubkey ?? null) : null;
    else pk = signerPubkey;
    return resolveRole({
      account,
      owner: state.owner,
      signerCommitment: pk ? signerCrypto.commitmentFor(pk, state.contractSalt) : undefined,
      registeredCommitments: state.signerCommitments
    });
  }, [state, account, mode, actor, mockSigners, signerPubkey]);

  const mockAccounts = useMemo(() => {
    const out: Record<string, string> = {};
    if (!state) return out;
    for (const a of actors) out[a.id] = deriveAccount(Uint8Array.from(a.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16))), state.contractSalt);
    return out;
  }, [actors, state]);

  const tokenService = useMemo(
    () => (gateway && state && account ? new TokenService(gateway, txLog, account, state.decimals) : null),
    [gateway, state, account]
  );
  const multisig = useMemo(
    () => (gateway && state ? new MultisigService(gateway, signerCrypto, networkConfig.networkId, state.decimals) : null),
    [gateway, state]
  );

  const refresh = useCallback(async () => {
    const gw = gatewayRef.current;
    if (!gw) return;
    setState(await gw.getState());
    setTxs(await txLog.list(gw.contractAddress));
    setMissingCircuits((await gw.missingCircuits?.()) ?? []);
  }, []);

  const persistSim = useCallback(async (gw: SimulatorGateway) => {
    await store.set('sim:snapshot', JSON.stringify(gw.snapshot()));
  }, []);

  // ---- bootstrap ----------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        selfTest();
        const mocks = await loadMocks();
        if (cancelled) return;
        setActors(mocks.actors);
        setMockSigners(mocks.signers);
        setSignerPubkeyState(await identityStore.getSignerPubkey());
        const savedMode = (await store.get('mode')) as Mode | null;
        if (savedMode === 'wallet' || savedMode === 'test') setModeState(savedMode);
        setWallets(detectWallets());
        void waitForWallets().then((w) => !cancelled && setWallets(w));
      } catch (e) {
        setError(friendlyMessage(e));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    const unsub = connectorRef.current.subscribe(setConnector);
    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  // ---- (re)load the contract whenever the mode / wallet session changes ---
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      setGateway(null);
      setState(null);
      setError(null);
      try {
        if (mode === 'test') {
          const raw = await store.get('sim:snapshot');
          if (!raw) return;
          const mocks = await loadMocks();
          const snap = JSON.parse(raw) as SimulatorSnapshot;
          if (snap.version !== 1) {
            await store.remove('sim:snapshot'); // snapshot from another contract version
            return;
          }
          const gw = await SimulatorGateway.restore(snap, (acct) => {
            for (const a of mocks.actors) {
              const sk = Uint8Array.from(a.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16)));
              if (deriveAccount(sk, snap.params.salt) === acct) return sk;
            }
            throw new Error('No mock identity matches this account');
          });
          if (cancelled) return;
          setGateway(gw);
          setState(await gw.getState());
          setTxs(await txLog.list(gw.contractAddress));
        } else if (connector.status === 'connected') {
          const sk = await identityStore.getOrCreateSecretKey();
          setWalletSk(sk);
          const { ChainGateway, createWalletProviders } = await loadChain();
          providersRef.current = await createWalletProviders(connector.session, store, activeSink);
          const dep = await identityStore.getDeployment();
          if (dep && dep.networkId === networkConfig.networkId) {
            const gw = await ChainGateway.connect(providersRef.current, dep.contractAddress, () => sk);
            if (cancelled) return;
            setGateway(gw);
            setState(await gw.getState());
            setTxs(await txLog.list(gw.contractAddress));
            setMissingCircuits((await gw.missingCircuits?.()) ?? []);
          }
        }
      } catch (e) {
        // A saved address that belongs to the other contract version would fail on every connect: forget the pointer
        // (the contract itself is untouched) and say why.
        if (e instanceof AppError && e.code === 'CONTRACT_VERSION') await identityStore.setDeployment(null);
        if (!cancelled) setError(friendlyMessage(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, mode, connector.status === 'connected' ? connector.session : null]); // eslint-disable-line react-hooks/exhaustive-deps

  // Live state for wallet mode: poll the indexer.
  useEffect(() => {
    if (!gateway || gateway.mode !== 'wallet') return;
    const id = setInterval(() => void refresh().catch(() => {}), 15_000);
    return () => clearInterval(id);
  }, [gateway, refresh]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice]);

  // ---- actions ------------------------------------------------------------
  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    void store.set('mode', m);
  }, []);

  const connectWallet = useCallback(
    async (key: string) => {
      await guard(async () => {
        await connectorRef.current.connect(key);
      });
    },
    [guard]
  );
  const disconnectWallet = useCallback(() => {
    connectorRef.current.disconnect();
    providersRef.current = null;
    setWalletSk(null);
    if (gatewayRef.current?.mode === 'wallet') {
      setGateway(null);
      setState(null);
    }
  }, []);
  const rescanWallets = useCallback(async () => setWallets(await waitForWallets(1200)), []);

  /** Registers every missing circuit, one maintenance transaction each, reporting each as a progress step. */
  const runRegistration = useCallback(async (gw: TokenGateway) => {
    if (!gw.missingCircuits || !gw.registerCircuit) return;
    const missing = await gw.missingCircuits();
    deployTracker.extend(
      missing.map((c, i) => ({ id: `reg:${c}`, labelKey: 'deploy.step.register', label: `Register circuit “${c}” (${i + 1}/${missing.length})`, hintKey: 'deploy.step.register.hint' }))
    );
    for (const c of missing) {
      deployTracker.begin(`reg:${c}`);
      try {
        const r = await gw.registerCircuit(c);
        await txLog.add({ id: `${r.txHash}:register:${c}`, contractAddress: gw.contractAddress, circuit: `register:${c}`, txHash: r.txHash, txId: r.txId, blockHeight: r.blockHeight, status: 'finalized', at: Date.now(), mode: 'wallet' });
      } catch (e) {
        throw new Error(`Contract ${gw.contractAddress} is deployed, but registering circuit “${c}” failed: ${friendlyMessage(e)} — use “Register remaining circuits” to continue.`, { cause: e });
      }
      deployTracker.done(`reg:${c}`);
    }
    setMissingCircuits((await gw.missingCircuits()) ?? []);
  }, []);

  const registerRemainingCircuits = useCallback(async () => {
    const gw = gatewayRef.current;
    if (!gw || deployTracker.running) return;
    deployTracker.start('wallet', [{ id: 'save', labelKey: 'deploy.step.save' }]);
    const ok = await guard(async () => {
      await runRegistration(gw);
      deployTracker.begin('save');
      await refresh();
      deployTracker.succeed({ contractAddress: gw.contractAddress });
      return true;
    }, 'Circuits registered');
    if (!ok && deployTracker.running) deployTracker.fail(lastErrorRef.current ?? 'Registration failed');
  }, [guard, refresh, runRegistration]);

  const deploy = useCallback(
    async (form: DeployForm) => {
      if (deployTracker.running) return; // one deploy at a time
      deployTracker.start(mode);
      deployTracker.begin('validate');
      const ok = await guard(async () => {
        const salt = signerCrypto.randomSaltHex();
        const params: DeployParams = buildDeployParams(form, signerCrypto.commitmentFor, salt);
        deployTracker.done('validate');
        deployTracker.begin('build');
        if (mode === 'test') {
          const mocks = await loadMocks();
          const mgr = mocks.actors.find((a) => a.id === 'manager')!;
          const mgrSk = Uint8Array.from(mgr.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16)));
          const owner = deriveAccount(mgrSk, salt);
          const gw = await SimulatorGateway.deploy(params, owner, (acct) => {
            for (const a of mocks.actors) {
              const sk = Uint8Array.from(a.secretKeyHex.match(/../g)!.map((h) => parseInt(h, 16)));
              if (deriveAccount(sk, salt) === acct) return sk;
            }
            throw new Error('No mock identity matches this account');
          });
          deployTracker.done('build');
          deployTracker.begin('save');
          await persistSim(gw);
          setGateway(gw);
          setState(await gw.getState());
          setActorId('manager');
          setTxs([]);
          deployTracker.succeed({ contractAddress: gw.contractAddress });
        } else {
          if (!providersRef.current) throw new Error('Connect a wallet first');
          const { ChainGateway } = await loadChain();
          const sk = await identityStore.getOrCreateSecretKey();
          const owner = deriveAccount(sk, salt);
          const { gateway: gw, receipt } = await ChainGateway.deploy(providersRef.current, { ...params, salt }, owner, () => sk);
          deployTracker.done('confirm');
          // Persist immediately: from here on the contract exists even if a later registration step fails.
          await identityStore.setDeployment({
            contractAddress: gw.contractAddress,
            txHash: receipt.txHash,
            deployedAt: Date.now(),
            networkId: networkConfig.networkId
          });
          await txLog.add({
            id: `${receipt.txHash}:deploy`,
            contractAddress: gw.contractAddress,
            circuit: 'deploy',
            txHash: receipt.txHash,
            txId: receipt.txId,
            blockHeight: receipt.blockHeight,
            status: 'finalized',
            at: Date.now(),
            mode: 'wallet'
          });
          setWalletSk(sk);
          setGateway(gw);
          gatewayRef.current = gw;
          try {
            await runRegistration(gw);
          } finally {
            deployTracker.begin('save');
            setState(await gw.getState());
            setTxs(await txLog.list(gw.contractAddress));
            setMissingCircuits((await gw.missingCircuits?.()) ?? []);
          }
          deployTracker.succeed({ contractAddress: gw.contractAddress, txHash: receipt.txHash });
        }
        return true;
      }, 'Contract deployed');
      if (!ok && deployTracker.running) deployTracker.fail(lastErrorRef.current ?? 'Deployment failed');
    },
    [guard, mode, persistSim, runRegistration]
  );

  const attach = useCallback(
    async (address: string) => {
      await guard(async () => {
        if (mode !== 'wallet') throw new Error('Attaching to an on-chain contract needs Wallet Mode');
        if (!providersRef.current) throw new Error('Connect a wallet first');
        const { ChainGateway } = await loadChain();
        const a = address.trim().replace(/^0x/, '');
        if (!/^[0-9a-fA-F]{64}$/.test(a)) throw new Error('Contract address must be 64 hex characters');
        const sk = await identityStore.getOrCreateSecretKey();
        const gw = await ChainGateway.connect(providersRef.current, a, () => sk);
        const st = await gw.getState();
        await identityStore.setDeployment({ contractAddress: a, deployedAt: Date.now(), networkId: networkConfig.networkId });
        setWalletSk(sk);
        setGateway(gw);
        setState(st);
        setTxs(await txLog.list(gw.contractAddress));
        setMissingCircuits((await gw.missingCircuits?.()) ?? []);
      }, 'Attached to contract');
    },
    [guard, mode]
  );

  const forget = useCallback(async () => {
    if (mode === 'test') await store.remove('sim:snapshot');
    else await identityStore.setDeployment(null);
    setGateway(null);
    setState(null);
    setTxs([]);
  }, [mode]);

  // Persist simulator progress after every state-changing operation.
  useEffect(() => {
    if (gateway instanceof SimulatorGateway && state) void persistSim(gateway);
  }, [gateway, state, persistSim]);

  const value: AppContextValue = {
    mode,
    setMode,
    ready,
    busy,
    error,
    clearError: () => setError(null),
    notice,
    wallets,
    connector,
    connectWallet,
    disconnectWallet,
    rescanWallets,
    gateway,
    state,
    role,
    account,
    tokenService,
    multisig,
    txs,
    refresh,
    clearHistory: async () => {
      await txLog.clear();
      setTxs([]);
    },
    deployProgress,
    dismissDeployProgress: () => deployTracker.dismiss(),
    actionProgress,
    dismissActionProgress: () => actionTracker.dismiss(),
    missingCircuits,
    registerRemainingCircuits,
    deploy,
    attach,
    forget,
    actors,
    actorId,
    setActorId,
    mockSigners,
    mockAccounts,
    identity: identityStore,
    drafts: draftStore,
    exportSecretKey: () => identityStore.exportSecretKey(),
    exportAuthorityKey: async () => {
      if (!gateway || gateway.mode !== 'wallet') throw new Error('Open a deployed contract in Wallet Mode first');
      return exportAuthorityKey(store, gateway.contractAddress);
    },
    importAuthorityKey: async (key) => {
      if (!gateway || gateway.mode !== 'wallet') throw new Error('Open a deployed contract in Wallet Mode first');
      await importAuthorityKey(store, gateway.contractAddress, key);
    },
    importSecretKey: async (hex) => {
      const v = hex.trim().replace(/^0x/, '').toLowerCase();
      // A pasted *account* is not a secret key. Importing one silently replaces your real key and locks you out of
      // your role (it happened: the owner account was pasted here).
      const accounts = [state?.owner, state?.emergencyPauser, account, ...(state?.signerCommitments ?? [])].filter(Boolean).map((a) => a!.toLowerCase());
      if (accounts.includes(v)) {
        throw new Error('That value is an account (public) identifier, not a secret key. Importing it would replace your real key and lock you out. Paste the 64-hex secret key you backed up.');
      }
      const sk = await identityStore.importSecretKey(v);
      setWalletSk(sk);
    },
    createEncryptedBackup: async (passphrase) => {
      const payload: BackupPayload = { identitySecretKey: await identityStore.exportSecretKey() };
      if (gateway?.mode === 'wallet') {
        const key = await exportAuthorityKey(store, gateway.contractAddress);
        if (key) payload.authority = { contractAddress: gateway.contractAddress, key };
      }
      return encryptKeyBackup(payload, passphrase, account ?? undefined);
    },
    restoreEncryptedBackup: async (fileText, passphrase) => {
      const { payload } = await decryptKeyBackup(fileText, passphrase);
      const sk = await identityStore.importSecretKey(payload.identitySecretKey); // keeps the replaced key under a backup entry
      setWalletSk(sk);
      if (payload.authority) await importAuthorityKey(store, payload.authority.contractAddress, payload.authority.key);
      return { authorityRestored: !!payload.authority };
    },
    signerPubkey,
    setSignerPubkey: async (p) => {
      await identityStore.setSignerPubkey(p);
      setSignerPubkeyState(p);
    },
    tooling,
    guard
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { pointFromJson };
