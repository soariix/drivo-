import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VeiculosService } from './veiculos.service';

describe('VeiculosService', () => {
  let service: VeiculosService;
  const prisma = {
    vehicle: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  const dto = {
    plate: 'RTX4B21',
    renavam: '01234567890',
    chassis: '9BR53ZEC1P4123456',
    brand: 'Toyota',
    model: 'Corolla',
    manufactureYear: 2022,
    modelYear: 2023,
    color: 'Prata',
    fuel: 'Flex',
    type: 'Automóvel',
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [VeiculosService, { provide: PrismaService, useValue: prisma }],
    }).compile();
    service = module.get(VeiculosService);
  });

  it('lista só os veículos do usuário logado', async () => {
    prisma.vehicle.findMany.mockResolvedValue([]);
    await service.list('user-1');
    expect(prisma.vehicle.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('devolve 404 quando o veículo não é do usuário', async () => {
    prisma.vehicle.findFirst.mockResolvedValue(null);
    await expect(service.findOne('user-1', 'id-x')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('cria o veículo ligado ao usuário', async () => {
    prisma.vehicle.create.mockResolvedValue({ id: '1', ...dto });
    await service.create('user-1', dto);
    expect(prisma.vehicle.create).toHaveBeenCalledWith({
      data: { ...dto, userId: 'user-1' },
    });
  });

  it('avisa quando a placa já existe (conflito)', async () => {
    prisma.vehicle.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicado', {
        code: 'P2002',
        clientVersion: '6',
      }),
    );
    await expect(service.create('user-1', dto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('exclui o veículo do usuário', async () => {
    prisma.vehicle.findFirst.mockResolvedValue({ id: '1' });
    prisma.vehicle.delete.mockResolvedValue({});
    await service.remove('user-1', '1');
    expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });
});