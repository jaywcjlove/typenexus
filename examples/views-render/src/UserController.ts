import { Controller, Render, Req, Get, Middleware, ForbiddenError, ExpressErrorMiddlewareInterface } from 'typenexus';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(err: any, req: Request, res: Response, next: NextFunction): void {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
    res.render('error');
    next();
  }
}

@Controller()
export class UserController {
  @Get('/')
  @Render('index')
  blog() {
    return {
      title: 'My Blog',
      posts: [
        {
          title: 'Welcome to my blog',
          content: 'This is my new blog built with Express, TypeNexus and express-views',
        },
        {
          title: 'Hello World',
          content: 'Hello world from Express and TypeNexus',
        },
      ],
    };
  }

  @Get('/error-test')
  public async errorTest(@Req() req: Request): Promise<any> {
    throw new ForbiddenError('Nooooo this message will be lost');
  }
}
