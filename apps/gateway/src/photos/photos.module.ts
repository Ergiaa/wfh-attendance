import { Module } from '@nestjs/common';

import { PhotoStorage } from './photo-storage.service';

@Module({
  providers: [PhotoStorage],
  exports: [PhotoStorage],
})
export class PhotosModule {}
