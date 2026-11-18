import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { s3 } from '../config/s3.js';
import sharp from 'sharp';
import { AppError } from '../utils/AppError.js';
import { randomUUID } from 'node:crypto';

export function getPublicUrl(key: string) {
  return `${env.S3_PUBLIC_URL}/${key}`;
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}

export async function uploadAvatar(buffer: Buffer, userId: string) {
  let image: Buffer;
  try {
    image = await sharp(buffer)
      .rotate()
      .resize(320, 320, { fit: 'cover' })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new AppError(400, 'INVALID_IMAGE', 'File is not a valid image');
  }

  const key = `avatars/${userId}/${randomUUID()}.webp`;

  await s3.send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: key,
      Body: image,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  return key;
}
