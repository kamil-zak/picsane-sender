import { Controller, Get, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  subscribe(
    @Query('item') item: string,
    @Query('email') email: string,
    @Query('agree') agr: string,
  ) {
    const agree = agr === '1';
    return this.subscriptionService.subscribe({ item, email, agree });
  }

  @Get('agree')
  getAgree() {
    return this.subscriptionService.getAgree();
  }

  @Get('all')
  getAll() {
    return this.subscriptionService.getAll();
  }
}
