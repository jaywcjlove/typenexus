import { Controller, Get, Req } from 'typenexus';
import { Middleware, ExpressMiddlewareInterface, UseAfter, UseBefore, ExpressErrorMiddlewareInterface, ForbiddenError } from 'typenexus';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    // @ts-ignore
    request.test = 'wcj';
    next();
  }
}

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any,request: Request, response: Response, next: NextFunction): void {
    response.status(error.status || 500);
    next();
  }
}

class FetchLoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    console.log(request.method, request.path);
    // @ts-ignore
    request.xxx = 'fetch-logo';
    next();
  }
}

@Controller('/questions')
export class UserController {
  @Get()
  @UseBefore(FetchLoggingMiddleware)
  public async all(@Req() req: Request): Promise<any> {
    return {
      id: 1,
      // @ts-ignore
      title: 'Question ' + req.test + req.xxx,
    };
  }
  @Get('/detail')
  public async detail(@Req() req: Request): Promise<any> {
    throw new ForbiddenError('Nooooo this message will be lost');
  }
}