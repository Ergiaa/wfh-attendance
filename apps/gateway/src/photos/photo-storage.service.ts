import { Injectable, Logger, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve, sep } from 'node:path';

import type { Env } from '../config/env';
import { detectImageType } from './image-type';

@Injectable()
export class PhotoStorage {
  private readonly logger = new Logger(PhotoStorage.name);
  private readonly root: string;

  constructor(config: ConfigService<Env, true>) {
    this.root = resolve(config.get('UPLOAD_DIR', { infer: true }));
  }

  async save(buffer: Buffer): Promise<string> {
    const type = detectImageType(buffer);
    if (!type) {
      throw new UnprocessableEntityException('Photo must be a JPEG, PNG or WebP image');
    }

    const now = new Date();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const key = `attendance/${now.getUTCFullYear()}/${month}/${randomUUID()}.${type.extension}`;
    const path = this.pathFor(key);

    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, buffer, { flag: 'wx' });
    return key;
  }

  async remove(key: string): Promise<void> {
    try {
      await rm(this.pathFor(key), { force: true });
    } catch (error) {
      this.logger.warn(`Failed to remove orphaned photo ${key}: ${String(error)}`);
    }
  }

  pathFor(key: string): string {
    const path = resolve(this.root, key);
    if (!path.startsWith(this.root + sep)) {
      throw new UnprocessableEntityException('Invalid photo key');
    }
    return path;
  }
}
