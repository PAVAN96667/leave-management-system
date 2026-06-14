import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LeaveService } from './leave.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('leave')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class LeaveController {
  constructor(private leaveService: LeaveService) {}

  @Post('type')
  @Roles('ADMIN')
  createLeaveType(@Body() body: { name: string; description: string; maxDays: number }) {
    return this.leaveService.createLeaveType(body.name, body.description, body.maxDays);
  }

  @Get('types')
  getLeaveTypes() {
    return this.leaveService.getLeaveTypes();
  }

  @Post('allocate')
  @Roles('ADMIN')
  allocateLeave(@Body() body: { userId: number; leaveTypeId: number; allocatedDays: number }) {
    return this.leaveService.allocateLeave(Number(body.userId), Number(body.leaveTypeId), Number(body.allocatedDays));
  }

  @Get('allocations')
  @Roles('ADMIN')
  getAllAllocations() {
    return this.leaveService.getAllAllocations();
  }

  @Get('my-allocations')
  getMyAllocations(@Request() req: any) {
    return this.leaveService.getMyAllocations(req.user.userId);
  }

  @Post('apply')
  applyLeave(@Request() req: any, @Body() body: { leaveTypeId: number; reason: string; startDate: string; endDate: string }) {
    return this.leaveService.applyLeave(req.user.userId, body.leaveTypeId, body.reason, body.startDate, body.endDate);
  }

  @Get('my')
  getMyLeaves(@Request() req: any) {
    return this.leaveService.getMyLeaves(req.user.userId);
  }

  @Get('all')
  @Roles('ADMIN')
  getAllLeaves() {
    return this.leaveService.getAllLeaves();
  }

  @Get('reportees')
  @Roles('MANAGER')
  getReporteesLeaves(@Request() req: any) {
    return this.leaveService.getReporteesLeaves(req.user.userId);
  }

  @Get('pending')
  @Roles('ADMIN', 'MANAGER')
  getPending(@Request() req: any) {
    return this.leaveService.getPendingForApprover(req.user.userId, req.user.role);
  }

  @Patch(':id/approve')
  @Roles('ADMIN', 'MANAGER')
  approveLeave(@Param('id') id: string, @Request() req: any) {
    return this.leaveService.approveLeave(Number(id), req.user.userId);
  }

  @Patch(':id/reject')
  @Roles('ADMIN', 'MANAGER')
  rejectLeave(@Param('id') id: string, @Body() body: { rejectedReason: string }) {
    return this.leaveService.rejectLeave(Number(id), body.rejectedReason || '');
  }

  @Patch(':id/cancel')
  cancelLeave(@Param('id') id: string, @Request() req: any) {
    return this.leaveService.cancelLeave(Number(id), req.user.userId);
  }
}