import ReactNativeBlobUtil from 'react-native-blob-util';
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
// We stream the file from disk via blob-util — plain fetch().blob() uploads a
// 0-byte body on Android, which silently stores an empty (broken) image.
export async function uploadToR2(uploadUrl: string, uri: string, mime: string): Promise<void> {
  const path = uri.replace(/^file:\/\//, '');
  const res = await ReactNativeBlobUtil.fetch(
    'PUT',
    uploadUrl,
    { 'Content-Type': mime },
    ReactNativeBlobUtil.wrap(path),
  );
  const status = res.info().status;
  if (status < 200 || status >= 300) {
    throw new Error(`upload failed: HTTP ${status}`);
  }
}

// Full flow: presign -> upload -> return the public URL to store on the profile.
export async function uploadImage(uri: string, mime: string): Promise<string> {
  const p = await presign(mime);
  await uploadToR2(p.upload_url, uri, mime);
  return p.public_url;
}
