/* eslint-disable no-bitwise */
// RFC4122-ish v4 UUID. Used as client_id, which the backend adopts as the
// message's primary id — so optimistic and server messages share one id.
export function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
