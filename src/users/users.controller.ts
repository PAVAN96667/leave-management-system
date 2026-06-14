import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  getProfile(@Request() req: any) {
    return this.usersService.getUserById(req.user.userId);
  }

  @Get()
  @Roles('ADMIN')
  getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('managers')
  @Roles('ADMIN')
  getManagers() {
    return this.usersService.getManagers();
  }

  @Get('all-for-dropdown')
  @Roles('ADMIN')
  getAllForDropdown() {
    return this.usersService.getAllForDropdown();
  }

  @Get('reportees')
  @Roles('MANAGER')
  getReportees(@Request() req: any) {
    return this.usersService.getReportees(req.user.userId);
  }

  @Post('create')
  @Roles('ADMIN')
  createUser(@Body() body: { name: string; email: string; password: string; role: string; managerId?: number }) {
    return this.usersService.createUser(body.name, body.email, body.password, body.role, body.managerId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(Number(id));
  }
}