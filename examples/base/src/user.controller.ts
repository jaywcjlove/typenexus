import {
  Controller,
  ContentType,
  Get,
  Param,
  Params,
  QueryParam,
  QueryParams,
  CookieParam,
  CookieParams,
  Post,
  Delete,
  Patch,
  Put,
  Head,
  Res,
  Req,
  DSource,
  DataSource,
} from 'typenexus';
import { HeaderParam, HeaderParams, Body, BodyParam, Session, SessionParam } from 'typenexus';
import { Response, Request } from 'express';
import { User } from './user.entity.js';

@Controller('/users')
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @Get()
  public async getAll(@Req() request: Request, @Res() response: Response): Promise<User[]> {
    return this.dataSource.manager.find(User);
  }
  @Post()
  public async create(
    @Body() body: any,
    @BodyParam('name') name: string,
  ): Promise<{ name: string; id: number; username: string }> {
    return { id: 12, name: body.name, username: name };
  }
  @Get('/users/info')
  public async getInfo(@QueryParam('user') user: string, @QueryParams() queries: any): Promise<any> {
    return { id: 12, user, queries };
  }
  @Put('/info/:id')
  modify(@Param('id') id: number, @Params() params: any) {
    return { id, params };
  }
  @Get('/order/:id')
  public async getOne(@CookieParams() cookies: any, @CookieParam('token') token: string): Promise<any> {
    return { id: 12, token, cookies };
  }
  @Delete('/order/:id')
  public async deleteOrder(@HeaderParams() headers: any, @HeaderParam('accept') accept: string): Promise<any> {
    return { id: 12, accept, keys: Object.keys(headers) };
  }
  @Patch('/order/:id')
  public async patchOrder(): Promise<any> {
    return { id: 12 };
  }
  @Post('/session')
  public async getSession(@Session() session: any, @SessionParam('cookie') cookie: any): Promise<any> {
    return { id: 12, session: Object.keys(session), cookie: Object.keys(cookie) };
  }
  @Head('/order')
  public async head(@Res() response: Response): Promise<any> {
    return response.json({ id: 12 });
  }
  @Get('/posts')
  getAllPosts(@Req() request: Request, @Res() response: Response) {
    // some response functions don't return the response object,
    // so it needs to be returned explicitly
    response.redirect('/users');
    return response;
  }

  @Get('/text-html')
  @ContentType('text/html')
  returnHtml(): string {
    return '<html>Test</html>';
  }
}
