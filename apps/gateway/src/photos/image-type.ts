export interface ImageType {
  extension: 'jpg' | 'png' | 'webp';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

export function detectImageType(buffer: Buffer): ImageType | undefined {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return { extension: 'jpg', mimeType: 'image/jpeg' };
  }
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: 'png', mimeType: 'image/png' };
  }
  if (
    startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { extension: 'webp', mimeType: 'image/webp' };
  }
  return undefined;
}

const MIME_BY_EXTENSION: Record<ImageType['extension'], ImageType['mimeType']> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export function mimeTypeForKey(key: string): ImageType['mimeType'] | undefined {
  const extension = key.slice(key.lastIndexOf('.') + 1) as ImageType['extension'];
  return MIME_BY_EXTENSION[extension];
}
