import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Length,
    Matches,
    Max,
    Min,
} from 'class-validator';

const clean = ({ value }: { value: unknown }) =>
    typeof value === 'string'
    ? value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    : value;

export class CriarVeiculoDto {
    @Transform(clean)
    @Matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, { message: 'Placa inválida' })
    plate: string;

    @Matches(/^\d{9,11}$/, { message: 'Renavam deve ter de 9 a 11 números' })
    renavam: string;

    @Transform(clean)
    @Length(17, 17, { message: 'Chassi deve ter 17 caracteres' })
    chassis: string;

    @IsString()
    @IsNotEmpty()
    brand: string;

    @IsString()
    @IsNotEmpty()
    model: string;

    @IsInt()
    @Min(1900)
    @Max(2100)
    manufactureYear: number;

    @IsInt()
    @Min(1900)
    @Max(2100)
    modelYear: number;

    @IsString()
    @IsNotEmpty()
    color: string;

    @IsString()
    @IsNotEmpty()
    fuel: string;

    @IsString()
    @IsNotEmpty()
    type: string;

    @IsOptional()
    @IsString()
    nickname?: string;
}

export class AtualizarVeiculoDto extends PartialType(CriarVeiculoDto) {}