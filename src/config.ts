// Single source of truth for the backend host.
// Android emulator reaches the host machine via 10.0.2.2.
// Change HOST for a physical device (your PC's LAN IP) or a deployed server.
const HOST = '10.0.2.2:7002';

export const BASE_URL = `http://${HOST}/v1`;
export const WS_URL = `ws://${HOST}/v1/ws`;
