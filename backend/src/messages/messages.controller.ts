import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@UseGuards(JwtAuthGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  findThreads(@CurrentUser() user: { id: string }) {
    return this.messagesService.findThreads(user.id);
  }

  @Get('threads/:threadId')
  findMessages(@CurrentUser() user: { id: string }, @Param('threadId') threadId: string) {
    return this.messagesService.findMessages(threadId, user.id);
  }

  @Post()
  sendMessage(@CurrentUser() user: { id: string }, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(user.id, dto);
  }
}
