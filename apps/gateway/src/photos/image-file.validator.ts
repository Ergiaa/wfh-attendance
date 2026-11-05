import { FileValidator } from '@nestjs/common';

import { detectImageType } from './image-type';

export class ImageFileValidator extends FileValidator {
  constructor() {
    super({});
  }

  isValid(file?: Express.Multer.File): boolean {
    return !!file?.buffer && detectImageType(file.buffer) !== undefined;
  }

  buildErrorMessage(): string {
    return 'Photo must be a JPEG, PNG or WebP image';
  }
}
