import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CriarVeiculoDto, AtualizarVeiculoDto } from './veiculos.dto';

@Injectable()
export class VeiculosService {
    constructor(private prisma: PrismaService) {}

    list(userId: string, search?: string) {
    const term = search?.trim();
    return this.prisma.vehicle.findMany({
        where: {
        userId,
        ...(term && {
            OR: [
            { plate: { contains: term.replace(/[^a-zA-Z0-9]/g, ''), mode: 'insensitive' } },
            { model: { contains: term, mode: 'insensitive' } },
            { brand: { contains: term, mode: 'insensitive' } },
            ],
        }),
        },
        orderBy: { createdAt: 'desc' },
    });
    }

    async findOne(userId: string, id: string) {
    const veiculo = await this.prisma.vehicle.findFirst({
        where: { id, userId },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado');
    return veiculo;
    }

    async create(userId: string, dto: CriarVeiculoDto) {
    try {
        return await this.prisma.vehicle.create({ data: { ...dto, userId } });
    } catch (e) {
        this.handleUnique(e);
        throw e;
    }
    }

    async update(userId: string, id: string, dto: AtualizarVeiculoDto) {
    await this.findOne(userId, id);
    try {
        return await this.prisma.vehicle.update({ where: { id }, data: dto });
    } catch (e) {
        this.handleUnique(e);
        throw e;
    }
    }

    async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.vehicle.delete({ where: { id } });
    }

    private handleUnique(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Você já cadastrou um veículo com essa placa');
    }
    }
}