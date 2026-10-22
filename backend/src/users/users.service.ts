import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto, UpdateProfileDto } from './users.dto';

const publicSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    createdAt: true,
} as const;

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async me(userId: string) {
    const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: publicSelect,
    });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
    }

    async update(userId: string, dto: UpdateProfileDto) {
    if (dto.email) {
        const other = await this.prisma.user.findUnique({
        where: { email: dto.email },
        });
        if (other && other.id !== userId) {
        throw new ConflictException('E-mail já está em uso');
        }
    }
    return this.prisma.user.update({
        where: { id: userId },
        data: dto,
        select: publicSelect,
    });
    }

    async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await bcrypt.compare(dto.currentPassword, user.password))) {
        throw new BadRequestException('Senha atual incorreta');
    }
    await this.prisma.user.update({
        where: { id: userId },
        data: { password: await bcrypt.hash(dto.newPassword, 10) },
    });
    return { message: 'Senha alterada com sucesso' };
    }
}