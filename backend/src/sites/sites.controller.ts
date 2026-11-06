import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SitesService } from './sites.service';
import { CreateSiteDto } from './dto/create-site.dto';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Get()
  async findAll() {
    return this.sitesService.findAll();
  }

  @Get(':address')
  async findOne(@Param('address') address: string) {
    return this.sitesService.findByAddress(address);
  }

  @Post()
  async create(@Body() dto: CreateSiteDto) {
    return this.sitesService.create(dto);
  }
}
