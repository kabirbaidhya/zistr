import { BaseController, Controller, Get, Post, Put, Delete, ReqBody, Query, Params, BaseDto } from '../../../index';

export class CreateOrderDto extends BaseDto {
  item!: string;
  quantity!: number;

  validate(): void {
    if (typeof this.item !== 'string' || this.item.trim() === '') {
      throw new Error('Item must be a non-empty string');
    }
    if (typeof this.quantity !== 'number' || !Number.isInteger(this.quantity) || this.quantity <= 0) {
      throw new Error('Quantity must be a positive integer');
    }
  }
}

export class UpdateOrderDto extends BaseDto {
  quantity!: number;
}

interface OrderQueryDto {
  search: string;
}

interface OrderParamsDto {
  id: string;
}

@Controller('/orders')
export class OrdersController extends BaseController {
  @Get()
  listOrders(@Query() query: OrderQueryDto) {
    return { query };
  }

  @Post('/')
  createOrder(@ReqBody() dto: CreateOrderDto) {
    return { created: true, data: dto };
  }

  @Get('/:id')
  getOrder(@Params() params: OrderParamsDto) {
    return { id: params.id };
  }

  @Put('/:id')
  updateOrder(@Params() params: OrderParamsDto, @ReqBody() dto: UpdateOrderDto) {
    return { id: params.id, updated: dto.quantity };
  }

  @Delete('/:id')
  deleteOrder(@Params() params: OrderParamsDto) {
    return { id: params.id, deleted: true };
  }
}
