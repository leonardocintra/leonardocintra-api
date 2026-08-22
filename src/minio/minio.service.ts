import { Injectable, Logger } from '@nestjs/common';
import { Client } from 'minio';
import { EnvService } from 'src/config/env.service';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: Client;
  private readonly bucket: string;

  constructor(private readonly env: EnvService) {
    const endPoint = this.env.MINIO_ENDPOINT;
    const port = Number(this.env.MINIO_PORT);
    const useSSL = this.env.MINIO_USE_SSL === 'true';
    const accessKey = this.env.MINIO_ACCESS_KEY;
    const secretKey = this.env.MINIO_SECRET_KEY;
    this.bucket = this.env.MINIO_BUCKET ?? '';

    this.client = new Client({
      endPoint: endPoint ?? '',
      port: Number.isFinite(port) ? port : 9000,
      useSSL,
      accessKey: accessKey ?? '',
      secretKey: secretKey ?? '',
    });
  }

  async recuperarImagem(objectKey: string): Promise<string> {
    this.logger.log(`Recuperando imagem do MinIO (bucket=${this.bucket}, objectKey=${objectKey})`);
    try {
      const stat = await this.client.statObject(this.bucket, objectKey);
      const mimetype = stat.metaData?.['content-type'] ?? 'image/jpeg';

      const stream = await this.client.getObject(this.bucket, objectKey);
      const buffer = await this.streamToBuffer(stream);
      const base64 = buffer.toString('base64');

      //return `data:${mimetype};base64,${base64}`;
      return base64;
    } catch (error) {
      this.logger.error(
        `Falha ao recuperar imagem do MinIO (bucket=${this.bucket}, objectKey=${objectKey})`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk: Buffer | string) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      });
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err: Error) => reject(err));
    });
  }
}
