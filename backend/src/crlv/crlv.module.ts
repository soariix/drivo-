import { Module } from '@nestjs/common';
import { CrlvController } from './crlv.controller';
import { CrlvService } from './crlv.service';

@Module({ controllers: [CrlvController], providers: [CrlvService] })
export class CrlvModule {}