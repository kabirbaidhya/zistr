import { BaseController, Controller, Get, Post, Put, Delete, ReqBody, Query, Params, BaseDto } from '@zistr/core';

/**
 * DTO with validation.
 */
export class CreateOrderDto extends BaseDto {
  item!: string;
  quantity!: number;

  validate(): void {
    if (typeof this.item !== 'string' || this.item.trim() === '') {
      throw new Error('"item must be a non-empty string');
    }
    if (typeof this.quantity !== 'number' || !Number.isInteger(this.quantity) || this.quantity <= 0) {
      throw new Error('"quantity" must be a positive integer');
    }
  }
}

/**
 * Plain DTO without validation.
 */
export class UpdateOrderDto extends BaseDto {
  quantity!: number;
}

interface OrderQueryParams {
  search: string;
}

interface OrderParams {
  id: string;
}

@Controller('/orders')
export class OrdersController extends BaseController {
  @Get()
  listOrders(@Query() query: OrderQueryParams) {
    return { query };
  }

  @Post('/')
  createOrder(@ReqBody() dto: CreateOrderDto) {
    return { created: true, data: dto };
  }

  @Get('/:id')
  getOrder(@Params() params: OrderParams) {
    return { id: params.id };
  }

  @Put('/:id')
  updateOrder(@Params() params: OrderParams, @ReqBody() dto: UpdateOrderDto) {
    return { id: params.id, updated: dto.quantity };
  }

  @Delete('/:id')
  deleteOrder(@Params() params: OrderParams) {
    return { id: params.id, deleted: true };
  }
}
