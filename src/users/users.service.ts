import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true, name: true, email: true, role: true, createdAt: true,
        manager: { select: { id: true, name: true } },
      },
    });
  }

  async getAllForDropdown() {
    return this.prisma.user.findMany({
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    });
  }

  async getManagers() {
    return this.prisma.user.findMany({
      where: { role: 'MANAGER' },
      select: { id: true, name: true, email: true },
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
  }

  async createUser(name: string, email: string, password: string, role: string, managerId?: number) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already exists');
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { name, email, password: hashed, role: role as any, managerId: managerId || null },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'ADMIN') throw new ConflictException('Cannot delete admin user');
    await this.prisma.leaveAllocation.deleteMany({ where: { userId: id } });
    await this.prisma.leave.deleteMany({ where: { userId: id } });
    return this.prisma.user.delete({ where: { id } });
  }

  async getReportees(managerId: number) {
    return this.prisma.user.findMany({
      where: { managerId },
      select: { id: true, name: true, email: true, role: true },
    });
  }
}