import { Controller, Get, Req } from 'typenexus';
import { Middleware, ExpressMiddlewareInterface, ExpressErrorMiddlewareInterface, ForbiddenError } from 'typenexus';
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

@Controller('/questions')
export class UserController {
  @Get()
  public async all(@Req() req: Request): Promise<any> {
    return {
      id: 1,
      // @ts-ignore
      title: 'Question ' + req.test,
    };
  }
  @Get('/detail')
  public async detail(@Req() req: Request): Promise<any> {
    throw new ForbiddenError('Nooooo this message will be lost');
  }
}