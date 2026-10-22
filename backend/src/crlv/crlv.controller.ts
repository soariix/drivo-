import {
    BadRequestException,
    Controller,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CrlvService } from './crlv.service';

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png'];

@ApiTags('crlv')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('crlv')
export class CrlvController {
    constructor(private crlv: CrlvService) {}

    @Post('scan')
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    schema: {
        type: 'object',
        properties: { file: { type: 'string', format: 'binary' } },
    },
    })
    @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }),
    )
    scan(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('Envie um arquivo no campo "file"');
    if (!ALLOWED.includes(file.mimetype)) {
        throw new BadRequestException('Formato inválido. Use PDF, JPG ou PNG.');
    }
    return this.crlv.scan(file);
    }
}