import { Controller, Get, Res, Req, DSource, DataSource, Repository, } from 'typenexus';
import { Response, Request }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  @Get()
  public async getAll(@Req() request: Request, @Res() response: Response, @DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
  @Get('/users/info')
  public async getInfo(@Req() request: Request, @Res() response: Response,): Promise<any> {
    return { id: 12 }
  }
  @Get('/order/:id')
  public async getOne(): Promise<any> {
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