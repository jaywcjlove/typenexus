TypeNexus
===

[![CI](https://github.com/jaywcjlove/typenexus/actions/workflows/main.yml/badge.svg)](https://github.com/jaywcjlove/typenexus/actions/workflows/main.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/typenexus.svg?style=flat)](https://www.npmjs.com/package/typenexus)
[![typeorm@^0.3.12](https://shields.io/badge/typeorm-^0.3.12-green?style=flat&logo=node.js)](https://typeorm.io/)
[![express@^4.18.2](https://shields.io/badge/express-^4.18.2-green?style=flat&logo=express)](http://expressjs.com/)

TypeNexus is a good tool for API encapsulation and management. It provides a clean and lightweight way to package TypeORM functionality, helping you build applications faster while reducing template code redundancy and type conversion work.

## Installation

```shell
$ npm install typenexus
```

## Quick start

```javascript
import { TypeNexus } from 'typenexus';

(async () => {
  const app = new TypeNexus(3000);
  await app.start();
})();
```

## Create API

```typescript
import { TypeNexus, JsonController, Get, Post, Put, Delete, Param, Body } from 'typenexus';
import { Connection } from 'typeorm';
import { User } from '../entities/user.entity';

@JsonController('/users')
export class UserController {
  constructor(private readonly connection: Connection) {}

  @Get()
  public async getAll(): Promise<User[]> {
    return await this.connection.manager.find(User);
  }

  @Get('/:id')
  public async getById(@Param('id') id: number): Promise<User> {
    return await this.connection.manager.findOne(User, id);
  }

  @Post()
  public async create(@Body() user: User): Promise<User> {
    return await this.connection.manager.save(user);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() user: User): Promise<User> {
    const currentUser = await this.connection.manager.findOne(User, id);
    if (currentUser) {
      await this.connection.manager.update(User, id, user);
      user.id = id;
      return user;
    }
    return null;
  }

  @Delete('/:id')
  public async delete(@Param('id') id: number): Promise<boolean> {
    const currentUser = await this.connection.manager.findOne(User, id);
    if (currentUser) {
      await this.connection.manager.delete(User, id);
      return true;
    }
    return false;
  }
}
```