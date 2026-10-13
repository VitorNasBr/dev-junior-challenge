import { Body, Controller, Get, Post } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CreateCheckinDto } from './dto/create-checkin.dto';

@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  // POST /checkins -> registers the patient in the queue
  @Post()
  create(@Body() dto: CreateCheckinDto) {
    return this.checkinsService.create(dto.cpf);
  }

  // GET /checkins -> today's queue, ordered by arrival time
  @Get()
  findTodayQueue() {
    return this.checkinsService.findTodayQueue();
  }
}
