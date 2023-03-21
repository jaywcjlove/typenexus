import { Controller, Get, HttpCode, Location, Header, Param } from 'typenexus';
import { Redirect } from 'typenexus';

@Controller()
export class UserController {
  @Get('/users')
  @Redirect("http://github.com/:owner/:repo")
  public async detail() { 
    return { owner: "jaywcjlove", repo: "typenexus" };
  }

  @Get("/redirect/github")
  @Redirect("http://github.com")
  public getUsers() {}

  @Get("/redirect/bing")
  @Redirect("http://github.com")
  public one() {
    return "https://bing.com";
  }

  @Get("/redirect/location")
  @HttpCode(201)
  @Location("https://bing.com")
  public location() {}

  @Get("/users/:id")
  @Header("Cache-Control", "none")
  public async getOne(@Param('id') id: string): Promise<any> {
    // ...
  }
}