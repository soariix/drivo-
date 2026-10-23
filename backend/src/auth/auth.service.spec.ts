import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
  const jwt = { sign: jest.fn().mockReturnValue('token-falso') };
  const dto = { name: 'Mariana Costa', email: 'a@a.com', password: 'senha12345' };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('cadastra usuário novo e devolve o token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: '1', email: dto.email });
    await expect(service.register(dto)).resolves.toEqual({
      accessToken: 'token-falso',
    });
  });

  it('não deixa cadastrar e-mail repetido', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    await expect(service.register(dto)).rejects.toThrow(ConflictException);
  });

  it('faz login com a senha certa', async () => {
    const password = await bcrypt.hash(dto.password, 4);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: dto.email, password });
    await expect(
      service.login({ email: dto.email, password: dto.password }),
    ).resolves.toEqual({ accessToken: 'token-falso' });
  });

  it('recusa senha errada', async () => {
    const password = await bcrypt.hash(dto.password, 4);
    prisma.user.findUnique.mockResolvedValue({ id: '1', email: dto.email, password });
    await expect(
      service.login({ email: dto.email, password: 'errada123' }),
    ).rejects.toThrow(UnauthorizedException);
  });
}); 