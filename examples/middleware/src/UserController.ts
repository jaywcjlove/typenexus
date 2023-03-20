import { Controller, ContentType, Get, Param, Post, Delete, Res, Req, DSource, DataSource } from 'typenexus';
import { Middleware, ExpressMiddlewareInterface } from 'typenexus';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    // @ts-ignore
    request.test = 'name';
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
}