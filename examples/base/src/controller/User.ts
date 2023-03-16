import { Controller, Get, Body, Param, Params, QueryParam, QueryParams, CookieParam, CookieParams, Post, Delete, Patch, Put, Res, Req, DSource, DataSource } from 'typenexus';
import { Response, Request }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  @Get()
  public async getAll(@Req() request: Request, @Res() response: Response, @DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
  @Post()
  public async create(@Body() body: any): Promise<{ name: string; id: number }> {
    return { id: 12, name: body.name }
  }
  @Get('/users/info')
  public async getInfo(@QueryParam('user') user: string, @QueryParams() queries: any): Promise<any> {
    return { id: 12, user, queries }
  }
  @Put('/info/:id')
  modify(@Param('id') id: number, @Params() params: any) {
    return { id, params }
  }
  @Get('/order/:id')
  public async getOne(@CookieParams() cookies: any, @CookieParam('token') token: string): Promise<any> {
    return { id: 12, token, cookies }
  }
  @Delete('/order/:id')
  public async deleteOrder(): Promise<any> {
    return { id: 12 }
  }
  @Patch('/order/:id')
  public async patchOrder(): Promise<any> {
    return { id: 12 }
  }
  @Get('/posts')
  getAllPosts(@Req() request: Request, @Res() response: Response) {
    // some response functions don't return the response object,
    // so it needs to be returned explicitly
    response.redirect('/users');
    return response
  }
}