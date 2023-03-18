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
  const app = new TypeNexus();
  await app.start();
  // Open in browser http://localhost:3000
})();
```

### ① Create API

`./src/controller/UserController.ts`

```typescript
import { TypeNexus, Controller, Param, Body, DataSource } from 'typenexus';
import { Get, Post, Put, Delete, Patch, Delete, Head } from 'typenexus';
import { User } from '../entities/user.entity';

@Controller('/api/users')
export class UserController {
  @Get()          // => GET /api/users
  public async getAll(@DSource() dataSource: DataSource): Promise<User[]> {
    return dataSource.manager.find(User);
  }
  @Get('/:id')    // => GET /api/users/:id
  public async getById(@Param('id') id: string, @DSource() dataSource: DataSource): Promise<User> {
    return dataSource.manager.findOne(User, id);
  }
  @Post('/:id')   // => POST /api/users/:id
  public async modify(@Body() body: { name: string; }): Promise<{ name: string; }> {
    return { name: body.name + '~~' }
  }
  @Put('/:id')    // => PUT /api/users/:id
  public async modify(@Param('id') id: string): Promise<{ uid: string; }> {
    return { uid: id }
  }
  @Delete('/:id') // => DELETE /api/users/:id
  public async modify(@Param('id') id: string): Promise<{ uid: string; }> {
    return { uid: id }
  }
  @Patch('/:id')  // => PATCH /api/users/:id
  public async patch(): Promise<any> {
    return { id: 12 }
  }
  @Head('/:id')   // => HEAD /api/users/:id
  public async patch(): Promise<{ id: number; }> {
    return { id: 12 }
  }
}
```

This class will register routes specified in method decorators in your server framework [Express.js](https://github.com/expressjs/express).

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
  const app = new TypeNexus();
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

Open in browser http://localhost:3000/users. You will see This action returns all users in your browser. If you open `http://localhost:3000/api/users/1` you will see This action returns user data.

```bash
└── src
    ├── controller
    │   └── User.ts
    ├── entity
    │   └── User.ts
    └── index.ts
```

## What is `DataSource`

Your interaction with the database is only possible once you setup a _DataSource_. [TypeORM](https://typeorm.io)'s _DataSource_ holds your database connection settings and establishes initial database connection or connection pool depending on the _RDBMS_ you use.

```typescript
import { TypeNexus } from 'typenexus';
import crypto from 'crypto';
import User from './entity/User.js'

const app = new TypeNexus(3000, { .... });
await app.connect();

// You can use the DataSource example here.
// 🚨 Please be sure to use it after `app.connect()`.
const repos = app.dataSource.getRepository(User);
// Check if there is an admin account.
const adminUser = await repos.findOneBy({ username: 'wcj' });
if (!adminUser) {
  const hashPassword = crypto.createHmac('sha256', '1234').digest('hex');
  // Create an admin account.
  const user = await repos.create({
    username: 'wcj',
    name: '管理员',
    password: hashPassword,
  });
  await repos.save(user);
}

app.controllers([UserController]);
await app.start();
```

Use **app.dataSource** to get the _DataSource_ instance.

### What is `DataSourceOptions`

`dataSourceOptions` is a data source configuration you pass when you create a new [`DataSource`](https://typeorm.io/data-source-options) instance. Different _RDBMS-es_ have their own specific options. 

```typescript
import { TypeNexus, TypeNexusOptions } from 'typenexus';
const options: TypeNexusOptions = {
  dataSourceOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-base',
    synchronize: true,
    logging: true,
    entities: ['dist/entity/*.js'],
    // entities: [User], 
  },
}

;(async () => {
  const app = new TypeNexus(3000, options);
  await app.connect();
  app.controllers([UserController]);
  app.express.disable('x-powered-by');
  await app.start();
})();
```

It can also be passed as a parameter inside **`the app.connect()`** method:

```typescript
await app.connect({ ... });
```

## What is `Entity`?

[`Entity`](https://typeorm.io/entities) is a class that maps to a database table (or collection when using `Postgres`). You can create an entity by defining a new class and mark it with `@Entity()`:

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typenexus"

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  isActive: boolean
}
```

This will create following database table:

```bash
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int(11)      | PRIMARY KEY AUTO_INCREMENT |
| firstName   | varchar(255) |                            |
| lastName    | varchar(255) |                            |
| isActive    | boolean      |                            |
+-------------+--------------+----------------------------+
```

## TypeNexus Options

```typescript
import { DataSourceOptions } from 'typeorm';
import { OptionsUrlencoded, OptionsJson, OptionsText, Options } from 'body-parser';

export interface TypeNexusOptions {
  port?: number;
  /** Global route prefix, for example '/api'. */
  routePrefix?: string;
  /** DataSourceOptions is an interface with settings and options for specific DataSource. */
  dataSourceOptions?: DataSourceOptions;
  /** Create a session middleware */
  session?: SessionResult | SessionCallback;
  /** Node.js body parsing middleware. */
  bodyParser?: {
    /**
     * Returns middleware that parses all bodies as a string and only looks at requests where the Content-Type header matches the type option.
     */
    text?: OptionsText;
    /**
     * Returns middleware that parses all bodies as a Buffer and only looks at requests where the Content-Type header matches the type option.
     */
    raw?: Options;
    /**
     * Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.
     */
    json?: false | OptionsJson;
    /**
     * Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option
     * Used for parsing request bodies in application/x-www-form-urlencoded format.
     * @default `{extended:false}`
     */
    urlencoded?: false | OptionsUrlencoded;
  }
}
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

### Prefix all controllers routes

If you want to prefix all your routes, e.g. `/api` you can use routePrefix option:

```ts
import { TypeNexus } from 'typenexus';
import { UserController } from './controller/User.js';

;(async () => {
  const app = new TypeNexus(3033);
  // 🚨 Be sure to put it in front of `app.controllers()`
  app.routePrefix = '/api'
  app.controllers([UserController]);
})();
```

You can also achieve the same effect by configuring **`routePrefix`** in the parameters when instantiating `TypeNexus`:

```typescript
const app = new TypeNexus(3033, {
  routePrefix: '/api'
});
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

### Inject session object

To inject a session value, use **`@SessionParam`** decorator:

```typescript
@Get("/login")
savePost(@SessionParam("user") user: User, @Body() post: Post) {}
```

If you want to inject the main session object, use **`@Session()`** without any parameters.

```typescript
@Get("/login")
savePost(@Session() session: any, @Body() post: Post) {}
```

Express uses [`express-session`](https://www.npmjs.com/package/express-session) to handle session, so firstly you have to install it manually to use **`@Session`** decorator. Here is an example of configuring *Session*, and you need to create a database table entity for *Session* as well:

```typescript
import { TypeNexus, DataSourceOptions } from 'typenexus';
import { TypeormStore } from '@wcj/connect-typeorm';
import { UserController } from './controller/User.js';
import { Session } from './entity/Session.js';

const options: TypeNexusOptions = {
  // ...
  dataSourceOptions: { ... },
  session: {
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    repositoryTarget: Session,
    typeormStore: {
      cleanupLimit: 2,
      // limitSubquery: false, // If using MariaDB.
      ttl: 86400,
    }
  }
}

;(async () => {
  const app = new TypeNexus(3001, options);
  await app.connect();
  // OR: 
  await app.connect(options.dataSourceOptions);

  app.controllers([UserController]);
  app.express.disable('x-powered-by');
  await app.start();

})();
```

Here is the database table entity for Session:

```typescript
// ./entity/Session.js
import { Column, Entity, Index, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { ISession } from '@wcj/connect-typeorm';

import 'express-session';

@Entity()
export class Session implements ISession {
  @Index()
  @Column('bigint', { transformer: { from: Number, to: Number } })
  public expiredAt = Date.now();

  @PrimaryColumn('varchar', { length: 255 })
  public id = '';

  @DeleteDateColumn()
  public destroyedAt?: Date;

  @Column('text')
  public json = '';
}
```


## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/typenexus/graphs/contributors">
  <img src="https://jaywcjlove.github.io/typenexus/CONTRIBUTORS.svg" />
</a>

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).


## License

This package is licensed under the MIT License.