import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
});

const BUCKET = process.env.R2_BUCKET_NAME ?? "stackfox-files";
const WORM_BUCKET = process.env.R2_WORM_BUCKET_NAME ?? "stackfox-worm";

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string,
  worm = false,
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: worm ? WORM_BUCKET : BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
  return key;
}

export async function getPresignedDownload(
  key: string,
  expiresIn = 3600,
): Promise<string> {
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: BUCKET, Key: key }),
    { expiresIn },
  );
}

export async function getPresignedUpload(
  key: string,
  contentType: string,
  expiresIn = 600,
): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
    { expiresIn },
  );
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export async function copyToWorm(key: string, body: Buffer): Promise<string> {
  const wormKey = `worm/${key}`;
  await uploadFile(wormKey, body, "application/pdf", true);
  return wormKey;
}
