import { Controller, CurrentUser, Get, Post } from 'typenexus';
import { User } from './User.js';

@Controller('/questions')
export class UserController {
  @Get()
  public async all(@CurrentUser() user?: User): Promise<any> {
    return {
      id: 1,
      title: 'Question by ' + user.firstName,
    };
  }
  @Post()
  public async detail(@CurrentUser({ required: true }) user?: User): Promise<any> {
    return {
      id: 1,
      title: 'Question by ' + user?.firstName,
    };
  }
}
