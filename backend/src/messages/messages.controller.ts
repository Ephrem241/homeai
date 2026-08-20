import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { SendMessageDto } from './dto/send-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('threads')
  findThreads(@Query('userId') userId: string) {
    return this.messagesService.findThreads(userId);
  }

  @Get('threads/:threadId')
  findMessages(@Param('threadId') threadId: string) {
    return this.messagesService.findMessages(threadId);
  }

  @Post()
  sendMessage(@Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(dto);
  }
}
