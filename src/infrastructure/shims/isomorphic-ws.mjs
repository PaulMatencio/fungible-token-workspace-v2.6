// Browser shim: midnight-js imports the *named* `WebSocket` export, which
// isomorphic-ws's browser entry (default export only) does not provide.
const Impl = globalThis.WebSocket;
export { Impl as WebSocket };
export default Impl;
