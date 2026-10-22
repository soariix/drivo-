import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { CrlvModule } from './crlv/crlv.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VeiculosModule,
    CrlvModule,
  ],
})
  
export class AppModule {}
