import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VisitsService } from './visits.service';
import { RecordVisitDto } from './dto/record-visit.dto';

@Controller('visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  async recordVisit(@Body() dto: RecordVisitDto) {
    return this.visitsService.recordVisit(dto);
  }

  @Get()
  async getVisits(@Query('userId') userId: string, @Query('limit') limit?: string) {
    if (!userId) return [];
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.visitsService.getVisitsByUser(userId, parsedLimit);
  }
}
