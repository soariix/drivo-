import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import * as currentUserDecorator from '../auth/current-user.decorator';
import { JwtAuthGuard } from './../auth/jwt-auth.guard';
import { ChangePasswordDto, UpdateProfileDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
    constructor(private users: UsersService) {}

    @Get('me')
    me(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser) {
    return this.users.me(user.userId);
    }

    @Patch('me')
    update(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.update(user.userId, dto);
    }

    @Patch('me/password')
    changePassword(@currentUserDecorator.CurrentUser() user: currentUserDecorator.AuthUser, @Body() dto: ChangePasswordDto) {
    return this.users.changePassword(user.userId, dto);
    }
}