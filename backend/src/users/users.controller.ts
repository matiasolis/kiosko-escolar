import { Body, Controller, Get, Param, Patch, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { toFrontendUser } from '../auth/auth.service';

@Controller(['users', 'clients'])
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll() {
    const users = await this.usersService.findAll();
    const mapped = users.map(toFrontendUser);
    return { users: mapped, clients: mapped };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    const mapped = user ? toFrontendUser(user) : null;
    return { user: mapped, client: mapped };
  }

  @Put(':id/block')
  @Patch(':id/block')
  async toggleBlock(@Param('id') id: string, @Body('isBlocked') isBlocked: boolean) {
    const updated = await this.usersService.setBlocked(id, isBlocked);
    const mapped = updated ? toFrontendUser(updated) : null;
    return { user: mapped, client: mapped };
  }
}
