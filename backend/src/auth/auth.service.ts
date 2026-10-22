import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (exists) throw new ConflictException('E-mail já cadastrado');

    const [firstName, ...rest] = dto.name.trim().split(/\s+/);
    const user = await this.prisma.user.create({
      data: {
        firstName,
        lastName: rest.join(' '),
        email: dto.email,
        password: await bcrypt.hash(dto.password, 10),
      },
    });
    return this.sign(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    const ok = user && (await bcrypt.compare(dto.password, user.password));
    if (!user || !ok) {
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }
    return this.sign(user.id, user.email);
  }

  private sign(userId: string, email: string) {
    return { accessToken: this.jwt.sign({ sub: userId, email }) };
  }
}