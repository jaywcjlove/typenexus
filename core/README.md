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

Its important to set these options in `tsconfig.json` file of your project:

```typescript
{
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

Its important to set these options in `package.json` file of your project:

```typescript
{
  "type": "module",
}
```

## Quick start

```javascript
import { TypeNexus } from 'typenexus';

(async () => {
  const app = new TypeNexus(3000);
  await app.start();
})();
```

### ① Create API

`./src/controller/User.ts`

```typescript
import { TypeNexus, Controller, Get, Param, DataSource } from 'typenexus';
import { User } from '../entities/user.entity';

@Controller('/api/users')
export class UserController {
  @Get() // => GET /api/users
  public async getAll(@DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }

  @Get('/:id') // => GET /api/users/:id
  public async getById(@Param('id') id: number): Promise<User> {
    return await this.connection.manager.findOne(User, id);
  }
}
```

### ② Create Entity

Entity is a class that maps to a database table (or collection when using `Postgres`). You can create an entity by defining a new class and mark it with @Entity():

`./src/entities/user.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn } from 'typenexus';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ select: false })
  password: string;

  @CreateDateColumn()
  createAt: Date;
}
```

### ③ Create Server

`./src/entities/user.entity.ts`

```typescript
import { TypeNexus } from 'typenexus';
import { UserController } from './controller/User.js';

;(async () => {
  const app = new TypeNexus(3009);
  app.controllers([UserController])

  await app.connect({ 
    type: 'postgres',
    host: process.env.HOST || 'localhost',
    port: 5432,
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'wcjiang',
    database: process.env.DB_NAME || 'typenexus-base',
    synchronize: true,
    logging: true,
    entities: ['dist/entity/*.js'],
    // OR: 
    // entities: [User],      
  });

  await app.start();

})();
```

## More Examples

### Using Request and Response objects

**`@Req()`** decorator injects you a _Request_ object, and **`@Res()`** decorator injects you a _Response_ object. If you have installed typings, you can use their types:

```typescript
import { Controller, Req, Res, Get } from 'typeorm';
import { Response, Request }from 'express';

@Controller()
export class UserController {
  @Get('/users') // => GET /users
  getAllUsers(@Req() request: Request, @Res() response: Response) {
    return response.send('Hello response!');
  }

  @Get('/posts') // => GET /posts
  getAllPosts(@Req() request: Request, @Res() response: Response) {
    // some response functions don't return the response object,
    // so it needs to be returned explicitly
    response.redirect('/users');
    return response;
  }
}
```

You can use framework's request and response objects directly. If you want to handle the response by yourself, just make sure you return the response object itself from the action.

### Using DataSource objects

**`@DSource()`** decorator injects you a [DataSource](https://typeorm.io/data-source-api) object.

```typescript
import { Controller, Get, Res, Req, DSource, DataSource, Repository, } from 'typenexus';
import { Response, Request }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  @Get() // => GET /users
  public async getAll(@DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
}
```

### Inject request body

To inject request body, use @Body decorator:

```typescript
import { Controller, Post, Body } from 'typeorm';

@Controller()
export class UserController {
    @Post("/users")
    saveUser(@Body() user: User) {
    }
}
```

## License

This package is licensed under the MIT License.