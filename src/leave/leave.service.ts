import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LeaveService {
  constructor(private prisma: PrismaService) {}

  async createLeaveType(name: string, description: string, maxDays: number) {
    return this.prisma.leaveType.create({
      data: { name, description: description || '', maxDays: Number(maxDays) },
    });
  }

  async getLeaveTypes() {
    return this.prisma.leaveType.findMany();
  }

  async allocateLeave(userId: number, leaveTypeId: number, allocatedDays: number) {
    const year = new Date().getFullYear();
    return this.prisma.leaveAllocation.upsert({
      where: { userId_leaveTypeId_year: { userId, leaveTypeId, year } },
      update: { allocatedDays },
      create: { userId, leaveTypeId, allocatedDays, year },
    });
  }

  async getAllAllocations() {
    return this.prisma.leaveAllocation.findMany({
      include: {
        user: { select: { id: true, name: true, role: true } },
        leaveType: { select: { id: true, name: true, maxDays: true } },
      },
      orderBy: { user: { name: 'asc' } },
    });
  }

  async getMyAllocations(userId: number) {
    return this.prisma.leaveAllocation.findMany({
      where: { userId },
      include: { leaveType: true },
    });
  }

  async applyLeave(userId: number, leaveTypeId: number, reason: string, startDate: string, endDate: string) {
    const year = new Date().getFullYear();
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const allocation = await this.prisma.leaveAllocation.findUnique({
      where: { userId_leaveTypeId_year: { userId, leaveTypeId: Number(leaveTypeId), year } },
    });

    if (!allocation) throw new BadRequestException('No leave allocation found. Contact admin.');
    if (allocation.usedDays + days > allocation.allocatedDays) {
      throw new BadRequestException(`Not enough balance. Available: ${allocation.allocatedDays - allocation.usedDays} days`);
    }

    return this.prisma.leave.create({
      data: {
        userId,
        leaveTypeId: Number(leaveTypeId),
        reason,
        startDate: start,
        endDate: end,
        status: 'PENDING_MANAGER',
      },
      include: { leaveType: true },
    });
  }

  async getMyLeaves(userId: number) {
    return this.prisma.leave.findMany({
      where: { userId },
      include: { leaveType: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllLeaves() {
    return this.prisma.leave.findMany({
      include: {
        user: { select: { name: true, email: true, role: true } },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getReporteesLeaves(managerId: number) {
    return this.prisma.leave.findMany({
      where: { user: { managerId } },
      include: {
        user: { select: { name: true, email: true, role: true } },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Single approve - works for both manager and admin
  async approveLeave(leaveId: number, approverId: number) {
    const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });
    if (!leave) throw new BadRequestException('Leave not found');

    const year = new Date(leave.startDate).getFullYear();
    const days = Math.ceil(
      (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    await this.prisma.leaveAllocation.updateMany({
      where: { userId: leave.userId, leaveTypeId: leave.leaveTypeId, year },
      data: { usedDays: { increment: days } },
    });

    return this.prisma.leave.update({
      where: { id: leaveId },
      data: { status: 'APPROVED', approvedBy: approverId },
    });
  }

  async rejectLeave(leaveId: number, rejectedReason: string) {
    return this.prisma.leave.update({
      where: { id: leaveId },
      data: { status: 'REJECTED', rejectedReason },
    });
  }

  async cancelLeave(leaveId: number, userId: number) {
    const leave = await this.prisma.leave.findUnique({ where: { id: leaveId } });
    if (!leave) throw new BadRequestException('Leave not found');
    if (leave.userId !== userId) throw new BadRequestException('Not authorized');
    if (leave.status === 'APPROVED') throw new BadRequestException('Cannot cancel approved leave');
    return this.prisma.leave.update({
      where: { id: leaveId },
      data: { status: 'CANCELLED' },
    });
  }

  async getPendingForApprover(approverId: number, role: string) {
    if (role === 'ADMIN') {
      return this.prisma.leave.findMany({
        where: { status: 'PENDING_MANAGER' },
        include: {
          user: { select: { name: true, email: true, role: true } },
          leaveType: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    }
    return this.prisma.leave.findMany({
      where: { status: 'PENDING_MANAGER', user: { managerId: approverId } },
      include: {
        user: { select: { name: true, email: true, role: true } },
        leaveType: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}