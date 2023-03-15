import { Controller, Get, Res, DataSource, Repository } from 'typenexus';
import { Response }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  private reps: Repository<User>;
  constructor(private readonly dataSource: DataSource) {
    console.log('dataSource:1111:', dataSource)
    // this.reps = dataSource.getRepository(User);
  }
  @Get()
  public async getAll(@Res() res: Response): Promise<User[]> {
    console.log('>::::::getAll', res, this.dataSource)
    // return await this.dataSource.manager.find(User);
    return Promise.resolve({ a: ''}) as any
  }
  @Get('/users/:id')
  public async getOne(): Promise<User[]> {
    console.log('>::::::getOne')
    return await this.dataSource.manager.find(User);
  }
}