import { Controller, ContentType, Get, Param, Post, Delete, Res, Req, DSource, DataSource } from 'typenexus';
import { Body, BodyParam, Authorized, SessionParam } from 'typenexus';

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
}