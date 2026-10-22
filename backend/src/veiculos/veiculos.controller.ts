import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import * as currentUserDecorator from '../auth/current-user.decorator';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { CriarVeiculoDto, AtualizarVeiculoDto } from './veiculos.dto';
import { VeiculosService } from './veiculos.service';

@ApiTags('veiculos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('veiculos')
export class VeiculosController {
    constructor(private veiculos: VeiculosService) {}

    @Get()
    @ApiQuery({ name: 'search', required: false })
    list(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Query('search') search?: string) {
    return this.veiculos.list(user.userId, search);
    }

    @Get(':id')
    findOne(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.veiculos.findOne(user.userId, id);
    }

    @Post()
    create(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Body() dto: CriarVeiculoDto) {
        return this.veiculos.create(user.userId, dto);
    }

    @Patch(':id')
    update(
    @currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AtualizarVeiculoDto,
  ) {
    return this.veiculos.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.veiculos.remove(user.userId, id);
  }
}