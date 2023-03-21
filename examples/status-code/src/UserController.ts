import { Controller, Get, Param, OnUndefined, OnNull, HttpError } from 'typenexus';

export class UserNotFoundError extends HttpError {
  constructor() {
    super(404, 'User not found!');
  }
}

@Controller()
export class UserController {
  @Get('/questions')
  @OnUndefined(204)
  public async all() {}
  @Get('/questions/:id')
  @OnNull(404)
  public async detail(@Param('id') id: string): Promise<string> {
    return new Promise((ok, fail) => {
      if (id === '1') {
        ok('Post');
      } else if (id === '2') {
        ok('');
      } else if (id === '3') {
        ok(null);
      } else {
        ok(undefined);
      }
    });
  }
  @Get("/users/:id")
  @OnUndefined(UserNotFoundError)
  saveUser(@Param("id") id: number): null {
    return undefined;
  }
}