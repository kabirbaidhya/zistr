/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import 'reflect-metadata';
import { ReqBody, Params, Query, Req } from './param';
import { BaseDto } from '../BaseDto';
import { getParams, ParamType } from './metadata';
import { ParamMetadata } from '../types';

class MyDto extends BaseDto<MyDto> {
  name!: string;
  getSchema() {
    return { parse: (d: any) => d } as any;
  }
}

describe('Decorators: Param', () => {
  it.each([
    [ReqBody, ParamType.BODY],
    [Params, ParamType.PARAMS],
    [Query, ParamType.QUERY],
  ])('should store parameter metadata for %p decorator with provided DTO class', (decorator, type) => {
    class TestController {
      myMethod(@decorator() _param: MyDto) {}
    }

    const params: ParamMetadata[] = getParams(TestController.prototype, 'myMethod');
    expect(params).toHaveLength(1);
    expect(params[0]).toEqual({ index: 0, type, dto: MyDto });
  });

  it.each([
    [ReqBody, ParamType.BODY],
    [Params, ParamType.PARAMS],
    [Query, ParamType.QUERY],
  ])('should store parameter metadata for %p decorator without DTO class for TS typed-objects', (decorator, type) => {
    interface Data {
      title: string;
      createdAt: Date;
    }

    class TestController {
      myMethodOne(@decorator() _param: MyDto) {}
      myMethodTwo(@decorator() _param: Data) {}
    }

    const paramsOne: ParamMetadata[] = getParams(TestController.prototype, 'myMethodOne');
    expect(paramsOne).toEqual([{ index: 0, type, dto: MyDto }]);

    const paramsTwo: ParamMetadata[] = getParams(TestController.prototype, 'myMethodTwo');
    expect(paramsTwo).toEqual([{ index: 0, type, dto: undefined }]);
  });

  it.each([
    [ReqBody, ParamType.BODY],
    [Params, ParamType.PARAMS],
    [Query, ParamType.QUERY],
  ])('should store parameter metadata for %p decorator without DTO', (decorator, type) => {
    class TestController {
      myMethod(@decorator() _param: any) {}
    }

    const params: ParamMetadata[] = getParams(TestController.prototype, 'myMethod');
    expect(params).toHaveLength(1);
    expect(params[0]).toEqual({ index: 0, type, dto: undefined });
  });

  it('should store parameter metadata for @Req decorator (no DTO)', () => {
    class TestController {
      myMethod(@Req() _req: any) {}
    }

    const params: ParamMetadata[] = getParams(TestController.prototype, 'myMethod');
    expect(params).toHaveLength(1);
    expect(params[0]).toEqual({ index: 0, type: ParamType.REQUEST, dto: undefined });
  });

  it('should support multiple parameter decorators on same method', () => {
    class TestController {
      myMethod(@ReqBody() _body: MyDto, @Query() _query: any, @Req() _req: any) {}
    }

    const params: ParamMetadata[] = getParams(TestController.prototype, 'myMethod');

    expect(params).toHaveLength(3);
    expect(params).toStrictEqual([
      { index: 0, type: ParamType.BODY, dto: MyDto },
      { index: 1, type: ParamType.QUERY, dto: undefined },
      { index: 2, type: ParamType.REQUEST, dto: undefined },
    ]);
  });

  it('should support injecting DTO class with ReqBody', () => {
    interface TestDTOPayload {
      foo: string;
    }

    class TestController {
      myMethodOne(@ReqBody() _body: MyDto) {}
      myMethodTwo(@ReqBody() _body: TestDTOPayload) {}
    }

    const params1: ParamMetadata[] = getParams(TestController.prototype, 'myMethodOne');
    expect(params1).toStrictEqual([{ index: 0, type: ParamType.BODY, dto: MyDto }]);

    const params2: ParamMetadata[] = getParams(TestController.prototype, 'myMethodTwo');
    expect(params2).toStrictEqual([{ index: 0, type: ParamType.BODY, dto: undefined }]);
  });

  it('should throw when used on non-method property', () => {
    const decorator = ReqBody();
    expect(() => decorator({}, undefined as any, 0)).toThrow('@body decorator can only be used on methods');
  });
});
