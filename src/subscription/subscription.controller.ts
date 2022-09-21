import { Controller, Get, Query } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('subscription')
export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) {}

  @Get()
  subscribe(@Query('item') item: string, @Query('email') email: string) {
    return this.subscriptionService.subscribe({ item, email });
  }
}
