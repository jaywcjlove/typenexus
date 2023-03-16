TypeNexus
===

[![CI](https://github.com/jaywcjlove/typenexus/actions/workflows/main.yml/badge.svg)](https://github.com/jaywcjlove/typenexus/actions/workflows/main.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/typenexus.svg?style=flat)](https://www.npmjs.com/package/typenexus)
[![NPM version](https://img.shields.io/npm/v/typenexus.svg?style=flat&label=typenexus)](https://npmjs.org/package/typenexus)
[![typeorm@^0.3.12](https://shields.io/badge/typeorm-^0.3.12-green?style=flat&logo=node.js)](https://typeorm.io/)
[![express@^4.18.2](https://shields.io/badge/express-^4.18.2-green?style=flat&logo=express)](http://expressjs.com/)

TypeNexus is a great tool for API encapsulation and management. It offers a clean and lightweight way to bundle [TypeORM](https://github.com/typeorm/typeorm) + [Express.js](https://github.com/expressjs/express) functionality, helping you to build applications faster while reducing template code redundancy and type conversion work.

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
import { TypeNexus, Controller, Param, Body, DataSource } from 'typenexus';
import { Get, Post, Put, Delete, Patch, Delete } from 'typenexus';
import { User } from '../entities/user.entity';

@Controller('/api/users')
export class UserController {
  @Get() // => GET /api/users
  public async getAll(@DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
  @Get('/:id') // => GET /api/users/:id
  public async getById(@Param('id') id: string, @DSource() dataSource: DataSource): Promise<User> {
    return dataSource.manager.findOne(User, id);
  }
  @Post('/:id') // => POST /api/users/:id
  public async modify(@Body() body: { name: string; }): Promise<{ name: string; }> {
    return { name: body.name + '~~' }
  }
  @Put('/:id') // => PUT /api/users/:id
  public async modify(@Param('id') id: string): Promise<{ uid: string; }> {
    return { uid: id }
  }
  @Delete('/:id') // => DELETE /api/users/:id
  public async modify(@Param('id') id: string): Promise<{ uid: string; }> {
    return { uid: id }
  }
  @Patch('/:id') // => PATCH /api/users/:id
  public async patch(): Promise<any> {
    return { id: 12 }
  }
}
```

### ② Create Entity

Entity is a class that maps to a database table (or collection when using `Postgres`). You can create an entity by defining a new class and mark it with **`@Entity()`**:

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

```bash
├── src
    ├── controller
    │   └── User.ts
    ├── entity
    │   └── User.ts
    └── index.ts
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
import { Controller, Get, DSource, DataSource } from 'typenexus';
import { Response, Request }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  @Get() // => GET /users
  public async getUsers(@DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
}
```

### Inject request body

To inject request body, use **`@Body`** decorator:

```typescript
import { Controller, Post, Body } from 'typeorm';

type UserBody = { username: string; id: number; };

@Controller()
export class UserController {
  @Post("/users") // => POST /users
  saveUser(@Body() user: UserBody) {
    // ...
  }
}
```

### Inject request body parameters

To inject request body parameter, use **`@BodyParam`** decorator:

```typescript
import { Controller, Post, BodyParam } from 'typeorm';

type UserBody = { username: string; id: number; };

@Controller()
export class UserController {
  @Post("/users") // => POST /users
  saveUser(@BodyParam("name") userName: string) {
    // ...
  }
}
```

### Inject request header parameters

To inject request header parameter, use **`@HeaderParam`** decorator:

```typescript
import { Controller, Post, HeaderParam } from 'typeorm';

@Controller()
export class UserController {
  @Post("/users")
  saveUser(@HeaderParam("authorization") token: string) {
    // ...
  }
}
```

If you want to inject all header parameters use **`@HeaderParams()`** decorator.

### Inject query parameters

To inject query parameters, use **`@QueryParam`** decorator:

```typescript
import { Controller, Get, QueryParam } from 'typeorm';

type UserBody = { username: string; id: number; };

@Controller()
export class UserController {
  @Get("/users")
  public async getUsers(@QueryParam("limit") limit: number) {
    // ....
  }
}
```

If you want to inject all query parameters use **`@QueryParams()`** decorator. 

```typescript
import { Controller, Get, QueryParams } from 'typeorm';

@Controller()
export class UserController {
  @Get("/users")
  public async getUsers(@QueryParams() query: any) {
    // ....
  }
}
```

### Inject cookie parameters

To get a cookie parameter, use **`@CookieParam`** decorator:

```typescript
import { Controller, Get, CookieParam, CookieParams } from 'typeorm';

@Controller()
export class UserController {
  @Get("/users")
  public async getUsers(@CookieParam("token") token: string) {
    // ....
  }
}
```

If you want to inject all header parameters use **`@CookieParams()`** decorator.

### Inject routing parameters

You can use **`@Param`** decorator to inject parameters in your controller actions:

```ts
import { Controller, Get, Param } from 'typeorm';

@Controller()
export class UserController {
  @Get("/users/:id")
  getOne(@Param("id") id: string) {}
}
```

If you want to inject all parameters use **`@Params()`** decorator.

### Prefix all controllers routes

If you want to prefix all your routes, e.g. `/api` you can use routePrefix option:

```ts
import { TypeNexus } from 'typenexus';
import { UserController } from './controller/User.js';

;(async () => {
  const app = new TypeNexus(3033);
  app.routePrefix = '/api'
  // 🚨 Be sure to put it in front of `app.controllers()`
  app.controllers([UserController]);
})();
```

### Prefix controller with base route

You can prefix all specific controller's actions with base route:

```typescript
import { Controller, Get } from 'typeorm';

@Controller('/api')
export class UserController {
  @Get("/users/:id")  // => GET /api/users/12
  public async getOne() {}
  @Get("/users")      // => GET /api/users
  public async getUsers() {}
  // ...
}
```

## License

This package is licensed under the MIT License.