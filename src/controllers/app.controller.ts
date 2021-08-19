import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common'
import { IsNotEmpty, IsString } from 'class-validator'
import { AppService } from '~/services/app.service'

export class PostHelloDto {
  @IsString()
  @IsNotEmpty()
  name!: string
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('hello/:name')
  getHelloName(@Param('name') name: string): string {
    return this.appService.getHelloName(name)
  }

  @Post('hello')
  @HttpCode(200)
  postHelloName(@Body() postHelloDto: PostHelloDto): string {
    return this.appService.getHelloName(postHelloDto.name)
  }
}
