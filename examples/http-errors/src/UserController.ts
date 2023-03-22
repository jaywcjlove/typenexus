import { Controller, Get, ForbiddenError } from 'typenexus';

@Controller()
export class UserController {
  @Get('/blogs')
  getAll() {
    throw new ForbiddenError('Nooooo this message will be lost');
  }
}