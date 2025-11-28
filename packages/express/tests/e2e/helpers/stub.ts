import {
  BaseController,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  ReqBody,
  Query,
  Params,
  BaseDto,
  ControllerResult,
  ReqContext,
} from '@zistr/core';

export class DummyValidationError extends Error {}

/**
 * DTO with validation.
 */
export class CreateOrderDto extends BaseDto {
  item!: string;
  quantity!: number;

  validate(): void {
    if (typeof this.item !== 'string' || this.item.trim() === '') {
      throw new DummyValidationError('"item must be a non-empty string');
    }
    if (typeof this.quantity !== 'number' || !Number.isInteger(this.quantity) || this.quantity <= 0) {
      throw new DummyValidationError('"quantity" must be a positive integer');
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

@Controller('/test')
export class TestController extends BaseController {
  @Get('/orders')
  listOrders(@Query() query: OrderQueryParams): ControllerResult {
    return { data: { query }, status: 200 };
  }

  @Get('/orders/v2')
  async listOrdersV2(@Query() query: OrderQueryParams): Promise<ControllerResult> {
    return { data: { query, v2: true }, status: 200 };
  }

  @Post('/orders')
  createOrder(@ReqBody() dto: CreateOrderDto): ControllerResult {
    return { data: { created: true, data: dto }, status: 200 };
  }

  @Get('/orders/:id')
  getOrder(@Params() params: OrderParams): ControllerResult {
    return { data: { id: params.id }, status: 200 };
  }

  @Put('/orders/:id')
  updateOrder(@Params() params: OrderParams, @ReqBody() dto: UpdateOrderDto): ControllerResult {
    return { data: { id: params.id, updated: dto.quantity }, status: 200 };
  }

  @Delete('/with-context')
  deleteOrder(@Params() params: OrderParams, @ReqContext() context: Record<string, any>): ControllerResult {
    return { data: { id: params.id, userId: context?.auth?.sid, deleted: true, context }, status: 200 };
  }
}
