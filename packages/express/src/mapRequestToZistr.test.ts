import { mapRequestToZistr } from './mapRequestToZistr';
import { ZistrRequest, ParamsDictionary } from '@zistr/core';
import type { ParsedQs } from 'qs';

describe('mapRequestToZistr', () => {
  const mockExpressReq = {
    method: 'POST',
    url: '/users/123?active=true',
    path: '/users/123',
    protocol: 'https',
    originalUrl: '/users/123?active=true',
    httpVersion: '1.1',
    headers: { 'content-type': 'application/json' },
    ip: '127.0.0.1',
    body: { name: 'Alice' },
    query: { active: 'true', nested: { foo: 'bar' } } as ParsedQs,
    params: { id: '123' } as ParamsDictionary,
    cookies: { session: 'abc' },
    signedCookies: { signed: 'def' },
  } as any; // runtime-only mock of Express.Request

  it('should map all fields correctly', () => {
    const req = mapRequestToZistr(mockExpressReq);

    expect(req).toBeInstanceOf(ZistrRequest);
    expect(req.method).toBe('POST');
    expect(req.url).toBe('/users/123?active=true');
    expect(req.path).toBe('/users/123');
    expect(req.protocol).toBe('https');
    expect(req.originalUrl).toBe('/users/123?active=true');
    expect(req.httpVersion).toBe('1.1');
    expect(req.headers['content-type']).toBe('application/json');
    expect(req.ip).toBe('127.0.0.1');
    expect(req.body).toEqual({ name: 'Alice' });
    expect(req.query).toEqual({ active: 'true', nested: { foo: 'bar' } });
    expect(req.params).toEqual({ id: '123' });
    expect(req.cookies).toEqual({ session: 'abc' });
    expect(req.signedCookies).toEqual({ signed: 'def' });
    expect(req.context).toEqual({});
  });

  it('should correctly map context', () => {
    const context = { auth: { sub: '234' } };
    const req = mapRequestToZistr({
      ...mockExpressReq,
      context,
    });

    expect(req.context).toStrictEqual(context);
  });

  it('should default cookies and signedCookies to {} if missing', () => {
    const req = mapRequestToZistr({
      ...mockExpressReq,
      cookies: undefined,
      signedCookies: undefined,
    });

    expect(req.cookies).toEqual({});
    expect(req.signedCookies).toEqual({});
  });

  it('should handle empty query and params', () => {
    const req = mapRequestToZistr({
      ...mockExpressReq,
      query: {} as ParsedQs,
      params: {} as ParamsDictionary,
    });

    expect(req.query).toEqual({});
    expect(req.params).toEqual({});
  });

  it('should handle nested query objects', () => {
    const req = mapRequestToZistr({
      ...mockExpressReq,
      query: { filter: { active: 'true' } } as ParsedQs,
    });

    expect(req.query.filter).toEqual({ active: 'true' });
  });

  it('should support generic Body and Context', () => {
    type BodyType = { name: string };
    type ContextType = { userId: string };

    const req = mapRequestToZistr<BodyType, ContextType>(mockExpressReq);

    // TypeScript enforces body type
    const name: string = req.body.name;
    expect(name).toBe('Alice');

    // Context is empty by default
    expect(req.context).toEqual({});
  });
});
