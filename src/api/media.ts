import { request } from './client';

export type Presigned = {
  upload_url: string;
  object_key: string;
  public_url: string;
};

// Ask the backend for a short-lived presigned PUT URL for the given mime type.
export function presign(mime: string): Promise<Presigned> {
  return request<Presigned>('/media/presign', { method: 'POST', body: { mime } });
}

// PUT the local file straight to R2 using the presigned URL (no auth header).
export async function uploadToR2(uploadUrl: string, uri: string, mime: string): Promise<void> {
  const file = await fetch(uri);
  const blob = await file.blob();
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mime },
    body: blob,
  });
  if (!res.ok) throw new Error(`upload failed: HTTP ${res.status}`);
}

// Full flow: presign -> upload -> return the public URL to store on the profile.
export async function uploadImage(uri: string, mime: string): Promise<string> {
  const p = await presign(mime);
  await uploadToR2(p.upload_url, uri, mime);
  return p.public_url;
}
