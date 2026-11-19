import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { s3 } from '../config/s3.js';
import sharp from 'sharp';
import { AppError } from '../utils/AppError.js';
import { randomUUID } from 'node:crypto';

const POST_WIDTHS = [480, 1080, 1440];
const MIN_RATIO = 4 / 5;
const MAX_RATIO = 1.91;

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

function getCropBox(width: number, height: number) {
  const ratio = width / height;

  if (ratio < MIN_RATIO) {
    const newHeight = Math.round(width / MIN_RATIO);
    return { left: 0, top: Math.round((height - newHeight) / 2), width, height: newHeight };
  }

  if (ratio > MAX_RATIO) {
    const newWidth = Math.round(height * MAX_RATIO);
    return { left: Math.round((width - newWidth) / 2), top: 0, width: newWidth, height };
  }

  return { left: 0, top: 0, width, height };
}

function toHex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export async function uploadPostImage(buffer: Buffer) {
  let box: ReturnType<typeof getCropBox>;
  let variants: Buffer[];

  try {
    const { autoOrient } = await sharp(buffer).metadata();
    box = getCropBox(autoOrient.width, autoOrient.height);

    variants = await Promise.all(
      POST_WIDTHS.map((width) =>
        sharp(buffer)
          .autoOrient()
          .extract(box)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer(),
      ),
    );
  } catch {
    throw new AppError(400, 'INVALID_IMAGE', 'File is not a valid image');
  }

  const { dominant } = await sharp(variants[0]).stats();

  const dominantColor = toHex(dominant.r, dominant.g, dominant.b);

  const key = `posts/${randomUUID()}`;

  await Promise.all(
    variants.map((body, index) =>
      s3.send(
        new PutObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: `${key}/${POST_WIDTHS[index]}.webp`,
          Body: body,
          ContentType: 'image/webp',
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      ),
    ),
  );

  return { key, width: box.width, height: box.height, dominantColor };
}

export async function deletePostImage(key: string) {
  await Promise.all(POST_WIDTHS.map((width) => deleteObject(`${key}/${width}.webp`)));
}

export function getPostImageUrls(key: string) {
  return {
    small: getPublicUrl(`${key}/480.webp`),
    medium: getPublicUrl(`${key}/1080.webp`),
    large: getPublicUrl(`${key}/1440.webp`),
  };
}
