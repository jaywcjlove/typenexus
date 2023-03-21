import { Controller, Get, Param, OnUndefined, OnNull } from 'typenexus';

@Controller('/questions')
export class UserController {
  @Get()
  @OnUndefined(204)
  public async all() {}
  @Get('/:id')
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
}