import { Controller, Get } from 'typenexus';
import { Authorized } from 'typenexus';

@Controller('/questions')
export class UserController {
  @Authorized()
  @Get()
  public async all(): Promise<any> {
    return {
      id: 1,
      title: 'Question #1',
    };
  }
  @Authorized()
  @Get('/info')
  public async info(): Promise<any> {
    return {
      id: 1,
      title: 'Question #2',
    };
  }
}
