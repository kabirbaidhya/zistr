import { BaseController, Controller, Get, Post, Put, Delete, ReqBody, Query, Params } from '@zistr/core';

@Controller('/test/orders')
export class OrdersController extends BaseController {
  @Get()
  listOrders(@Query() query: any) {
    return { query };
  }

  @Post('/')
  createOrder(@ReqBody() dto: any) {
    return { created: true, data: dto };
  }

  @Get('/:id')
  getOrder(@Params() params: any) {
    return { id: params.id };
  }

  @Put('/:id')
  updateOrder(@Params() params: any, @ReqBody() dto: any) {
    return { id: params.id, updated: dto.quantity };
  }

  @Delete('/:id')
  deleteOrder(@Params() params: any) {
    return { id: params.id, deleted: true };
  }
}

@Controller('/test/simple')
export class SimpleController extends BaseController {
  @Get('/hello')
  sayHello() {}
}
