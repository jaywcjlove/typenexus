TypeNexus
===

[![Build & Test](https://github.com/jaywcjlove/typenexus/actions/workflows/CI.yml/badge.svg)](https://github.com/jaywcjlove/typenexus/actions/workflows/CI.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/typenexus.svg?style=flat)](https://www.npmjs.com/package/typenexus)
[![NPM version](https://img.shields.io/npm/v/typenexus.svg?style=flat&label=typenexus)](https://npmjs.org/package/typenexus)
[![typeorm@^0.3.12](https://shields.io/badge/typeorm-^0.3.12-green?style=flat&logo=node.js)](https://www.npmjs.com/package/typeorm)
[![express@^4.18.2](https://shields.io/badge/express-^4.18.2-green?style=flat&logo=express)](https://www.npmjs.com/package/express)

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

### ❶ Create Entity

Entity is a class that maps to a database table (or collection when using `Postgres`). You can create an entity by defining a new class and mark it with **`@Entity()`**:

`./src/user.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn } from 'typenexus';
// OR: 
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn, CreateDateColumn } from 'typeorm';

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

### ❷ Create API

`./src/user.controller.ts`

```typescript
import { TypeNexus, Controller, Param, Body, DataSource } from 'typenexus';
import { Get, Post, Put, Delete, Patch, Delete, Head } from 'typenexus';
import { User } from '../user.entity.js';

@Controller('/api/users')
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @Get()          // => GET /api/users
  public async getAll(): Promise<User[]> {
    return this.dataSource.manager.find(User);
  }
  @Get('/:id')    // => GET /api/users/:id
  public async getById(@Param('id') id: string): Promise<User> {
    return this.dataSource.manager.findOne(User, id);
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
  public async head(): Promise<{ id: number; }> {
    return { id: 12 }
  }
}
```

This class will register routes specified in method decorators in your server framework [Express.js](https://github.com/expressjs/express).

### ❸ Create Server

`./src/index.ts`

```typescript
import { TypeNexus } from 'typenexus';
import { UserController } from './user.controller.js';

;(async () => {
  const app = new TypeNexus();
  // ❶ Performs connection to the database.
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
  // ❷ 🚨 Please be sure to use it after `app.connect()`.
  app.controllers([UserController]);
  // ❸ Listen for connections.
  await app.start();

})();
```

Open in browser http://localhost:3000/users. You will see This action returns all users in your browser. If you open `http://localhost:3000/api/users/1` you will see This action returns user data.

```bash
└── src
    ├── user.controller.ts
    ├── user.entity.ts
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

// 🚨 Please be sure to use it after `app.connect()`.
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
import { SessionOptions } from "express-session";

export interface TypeNexusOptions {
  port?: number;
  /** Global route prefix, for example '/api'. */
  routePrefix?: string;
  /** DataSourceOptions is an interface with settings and options for specific DataSource. */
  dataSourceOptions?: DataSourceOptions;
  /** Create a session middleware */
  session?: SessionResult | SessionCallback;
  /**
   * Indicates if default TypeNexus's error handler is enabled or not.
   * Enabled by default.
   */
  defaultErrorHandler?: boolean;
  /**
   * Indicates if TypeNexus should operate in development mode.
   */
  developmentMode?: boolean;
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
  };
  /**
   * Indicates if cors are enabled.
   * This requires installation of additional module (cors for express).
   */
  cors?: boolean | CorsOptions;
  /** Node.js compression middleware. The following compression codings are supported: deflate | gzip */
  compression?: false | CompressionOptions;
  /** Default settings */
  defaults?: {
    /**
     * If set, all null responses will return specified status code by default
     */
    nullResultCode?: number;
    /**
     * If set, all undefined responses will return specified status code by default
     */
    undefinedResultCode?: number;
  };
  /**
   * Special function used to check user authorization roles per request.
   * Must return true or promise with boolean true resolved for authorization to succeed.
   */
  authorizationChecker?: (action: Action, roles: any[]) => Promise<boolean> | boolean;
  /**
   * Special function used to get currently authorized user.
   */
  currentUserChecker?: (action: Action) => Promise<any> | any;
}
```

Example of parameter configuration:

```typescript
new TypeNexus(3000, { routePrefix: 'api' });
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

Support constructor **`@DSource()`** decorator

```typescript
import { Controller, Get, DSource, DataSource } from 'typenexus';
import { Response, Request }from 'express';
import { User } from '../entity/User.js';

@Controller('/users')
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @ContentType('application/json')
  @Get() // => GET /users
  public async getUsers(): Promise<User[]> {
    return this.dataSource.manager.find(User);
  }
}
```

Support parameter **`@DSource()`** decorator

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
  // ❶ Performs connection to the database.
  await app.connect();
  // OR: 
  // await app.connect(options.dataSourceOptions);

  // ❷ 🚨 Please be sure to use it after `app.connect()`.
  app.controllers([UserController]);
  // ❸ Listen for connections.
  await app.start();

})();
```

Here is the database table entity for Session:

```typescript
// ./entity/Session.js
import { Column, Entity, Index, PrimaryColumn, DeleteDateColumn } from 'typeorm';
import { ISession } from 'connect-typeorm';

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

### Inject uploaded file

To inject uploaded file, use **`@UploadedFile`** decorator:

```ts
@Post("/file")
saveFile(@UploadedFile("fileName") file: Express.Multer.File) {}
```

To inject uploaded multiple files, use the **`@UploadedFiles`** decorator:

```ts
@Post("/files")
saveFiles(@UploadedFiles("fileName") file: Express.Multer.File[]) {}
```

You can also specify uploading options to [**`multer`**](https://github.com/expressjs/multer) this way:

```ts
import type { Options } from 'multer';
// to keep code clean better to extract this function into separate file
const fileUploadOptions: () => Options = () => ({
  storage: multerFn.diskStorage({
    destination: (req, file, cb) => {
      //...
    },
    filename: (req, file, cb) => {
      //...
    }
  }),
  fileFilter: (req, file, cb) => {
    //...
  },
  limits: {
    fieldNameSize: 255,
    fileSize: 1024 * 1024 * 2
  }
});

// use options this way:
@Post("/file")
saveFiles(@UploadedFile("fileName", fileUploadOptions) file: Express.Multer.File) {}
```

To inject all uploaded files use **`@UploadedFiles`** decorator instead. _typenexus_ uses [**`multer`**](https://github.com/expressjs/multer) to handle file uploads. 

### Set Location

You can set a **`Location`** header for any action:

```typescript
import { Controller, Get, Location } from 'typenexus';

@Controller()
export class UserController {
  @Get('/users')
  @Location("https://bing.com")
  public async detail() {}
}
```

Sets the response Location HTTP header to the specified path parameter.

### Set Redirect

You can set a **`Redirect`** header for any action:

```typescript
import { Controller, Get, Redirect } from 'typenexus';

@Controller()
export class UserController {
  @Get('/users')
  @Redirect("http://github.com")
  public async detail() {}
}
```

You can override the **`Redirect`** header by returning a string value:

```typescript
import { Controller, Get, Redirect } from 'typenexus';

@Controller()
export class UserController {
  @Get('/users')
  @Redirect("http://github.com")
  public async detail() {
    return "https://bing.com";
  }
}
```

You can use template to generate the **`Redirect`** header:

```typescript
import { Controller, Get, Redirect } from 'typenexus';

@Controller()
export class UserController {
  @Get('/users')
  @Redirect("http://github.com/:owner/:repo")
  public async detail() { 
    return { owner: "jaywcjlove", repo: "typenexus" };
  }
}
```

### Set custom HTTP code

You can explicitly set a returned HTTP code for any action:

```typescript
import { Controller, Post, HttpCode } from 'typenexus';

@Controller()
export class UserController {
  @Post('/users')
  @HttpCode(201)
  public async saveUser() {}
}
```

### Controlling empty responses

If your controller returns `void` or `Promise<void>` or undefined it will throw you _404_ error. To prevent this if you need to specify what status code you want to return using **`@OnUndefined`** decorator.

```typescript
import { Controller, Param, Delete, OnUndefined, DSource, DataSource } from 'typeorm';
import { User } from '../entity/User.js';

@Controller()
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @Delete("/users/:id")
  @OnUndefined(204)
  async remove(@Param("id") id: string): Promise<void> {
    return this.dataSource.manager.findOneBy(User, { id });
  }
}
```

**`@OnUndefined`** is also useful when you return some object which can or cannot be **undefined**. In this example **`findOneBy`** returns **undefined** in the case if user with given id was not found. This action will return `404` in the case if user was not found, and regular `200` in the case if it was found.

```typescript
import { Controller, Param, Delete, OnUndefined, DSource, DataSource } from 'typeorm';
import { User } from '../entity/User.js';

@Controller()
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @Delete("/users/:id")
  @OnUndefined(404)
  async remove(@Param("id") id: string): Promise<void> {
    return this.dataSource.manager.findOneBy(User, { id });
  }
}
```

You can also specify error class you want to use if it returned `undefined`:

```typescript
import { HttpError } from 'typeorm';

export class UserNotFoundError extends HttpError {
  constructor() {
    super(404, 'User not found!');
  }
}
```

```typescript
import { Controller, Param, Delete, OnUndefined, DSource, DataSource } from 'typeorm';
import { User } from '../entity/User.js';

@Controller()
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @Get("/users/:id")
  @OnUndefined(UserNotFoundError)
  async remove(@Param("id") id: string): Promise<void> {
    return this.dataSource.manager.findOneBy(User, { id });
  }
}
```

If controller action returns `null` you can use **`@OnNull`** decorator instead.

```typescript
import { Controller, Get, OnNull, Param } from 'typeorm';

@Controller()
export class UserController {
  @Get('/questions/:id')
  @OnNull(404)
  public async detail(@Param('id') id: string): Promise<string> {
    return new Promise((ok, fail) => {
      ok(null);
    });
  }
}
```

### Set custom headers

You can set any custom header in a response:

```typescript
import { Controller, Get, Header, Param } from 'typeorm';

@Controller()
export class UserController {
  @Get("/users/:id")
  @Header("Cache-Control", "none")
  public async getOne(@Param('id') id: string): Promise<string> {
    // ...
  }
}
```

### Render templates

If you are using server-side rendering you can **`render`** any template:

```typescript
import { Controller, Get, Render } from 'typenexus';

@Controller('/')
export class UserController {
  @Get()
  @Render("index")
  getOne() {
    return {
      title: "these params are used"
    };
  }
}

```

To use rendering ability make sure to configure `express` properly. To use rendering ability with `express` you will need to use a rendering 3rd party such as [ejs](https://ejs.co/), [pug](https://pugjs.org/) is the only render middleware that has been tested.

```bash
$ npm install ejs
```

The directory where the template files are located. Eg: `app.set('views', './views')`. This defaults to the **views** directory in the application root directory.

```typescript
app.express.set('views', path.join(__dirname, 'views'));
```

The template engine to use. For example, to use the `ejs` template engine: `app.set('view engine', 'ejs')`.

```typescript
app.express.set('view engine', 'ejs');
```

Create a `ejs` template file named **`index.ejs`** in the views directory, with the following content:

```ejs
<!DOCTYPE html>
<html>
  <head>
    <title><%= title %></title>
  </head>
  <body>
    <h1><%= title %></h1>
    <p>Welcome to <%= title %></p>
  </body>
</html>
```

Complete entry example: 

```typescript
import { TypeNexus } from 'typenexus';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UserController, CustomErrorHandler } from './UserController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

;(async () => {
  const app = new TypeNexus(3002, {
    defaultErrorHandler: false,
  });
  app.express.set('views', path.join(__dirname, 'views'));
  app.express.set('view engine', 'ejs');
  app.controllers([UserController], [CustomErrorHandler]);
  await app.start();
})();
```

### Throw HTTP errors

If you want to return errors with specific error codes, there is an easy way:

```typescript
import { Controller, Get, Header, Param } from 'typeorm';

@Controller()
export class UserController {
  @Get("/users/:id")
  public async getOne(@Param('id') id: string): Promise<string> {
    const user = await dataSource.manager.findOneBy(User, { id });
    if (!user) {
      throw new NotFoundError(`User was not found.`); // message is optional
    }
    return user;
  }
}
```

Now, when user won't be found with requested id, response will be with http status code **404** and following content:

```typescript
{
  "name": "NotFoundError",
  "message": "User was not found."
}
```

There are set of prepared errors you can use:

- `HttpError`
- `BadRequestError`
- `ForbiddenError`
- `InternalServerError`
- `MethodNotAllowedError`
- `NotAcceptableError`
- `NotFoundError`
- `UnauthorizedError`

You can also create and use your own errors by extending **`HttpError`** class. To define the data returned to the client, you could define a toJSON method in your error.

```typescript
class DbError extends HttpError {
  public operationName: string;
  public args: any[];

  constructor(operationName: string, args: any[] = []) {
    super(500);
    Object.setPrototypeOf(this, DbError.prototype);
    this.operationName = operationName;
    this.args = args; // can be used for internal logging
  }

  toJSON() {
    return {
      status: this.httpCode,
      failedOperation: this.operationName,
    };
  }
}
```

### Enable CORS

Since CORS is a feature that is used almost in any web-api application, you can enable it in **typenexus** options.

```typescript
import { TypeNexus, Action } from 'typenexus';
import { UserController } from './UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    cors: true,
  });

  app.controllers([UserController]);
  await app.start();

})();
```

You can also configure [**cors**](https://github.com/expressjs/cors): 

```typescript
import { TypeNexus, Action } from 'typenexus';
import { UserController } from './UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    cors: {
      // options from cors documentation
    },
  });

  app.controllers([UserController]);
  await app.start();

})();
```

## Using `authorization` features

`TypeNexus` comes with two decorators helping you to organize authorization in your application.

### `@Authorized` decorator

To make **`@Authorized`** decorator to work you need to setup special `TypeNexus` options:

```ts
const app = new TypeNexus(3002, { ... });
await app.connect();

app.authorizationChecker = async (action: Action, roles: string[]) => {
  // here you can use request/response objects from action
  // also if decorator defines roles it needs to access the action
  // you can use them to provide granular access check
  // checker must return either boolean (true or false)
  // either promise that resolves a boolean value
  // demo code:
  const token = action.request.query.token || action.request.body.token || (action.request.headers.authorization || '').replace(/^token\s/, '');
  if (action.request.session.token !== token) return false;
  const dataSource = action.dataSource;
  const user = await dataSource.manager.findOne(User, {
    where: { username },
    select: ['username', 'id', 'roles'],
  });
  if (user && roles.find(role => user.roles.indexOf(role) !== -1)) return true;
  // @ts-ignore
  if (action.request.session.token === token) return true;
  return false;
}

app.controllers([UserController]);
await app.start();
```

You can use **`@Authorized`** on controller actions:

```typescript
import { Controller, Authorized, Req, Res, Get } from 'typeorm';
import { Response, Request }from 'express';

@Controller()
export class UserController {
  @Authorized('POST_MODERATOR') // you can specify roles or array of roles
  @Post('/posts') // => POST /posts
  create(@Body() post: Post, @Req() request: Request, @Res() response: Response) {
    // ...
  }
}
```

### `@CurrentUser` decorator

To make **`@CurrentUser`** decorator to work you need to setup special `TypeNexus` options:

```typescript
import { TypeNexus, Action } from 'typenexus';
import { UserController } from './UserController.js';
import { User } from './User.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  });

  app.currentUserChecker = async (action: Action) => {
    return new User(1, 'Johny', 'Cage');
  }

  app.controllers([UserController]);
  await app.start();
})();
```

You can use **`@CurrentUser`** on controller actions:

```typescript
import { Controller, CurrentUser, Get } from 'typenexus';
import { User } from './User.js';

@Controller('/questions')
export class UserController {
  @Get()
  public async all(@CurrentUser() user?: User): Promise<any> {
    return {
      id: 1,
      title: 'Question by ' + user.firstName,
    };
  }
}
```

If you mark **`@CurrentUser`** as **required** and `currentUserChecker` logic will return empty result, then `TypeNexus` will throw authorization required error.

## Using middlewares

You can use any existing _express_ middleware, or create your own. To create your middlewares there is a **`@Middleware`** decorator, and to use already exist middlewares there are **`@UseBefore`** and **`@UseAfter`** decorators.

### Use existing middleware

There are multiple ways to use middleware. For example, lets try to use [compression](https://github.com/expressjs/compression) middleware:

1. Install compression middleware: 

```bash
$ npm install compression
```

2. To use middleware per-action:

```ts
import { Controller, Get, UseBefore } from "typeorm";
import compression from 'compression';

@Controller()
export class UserController {
  @Get('/users/:id')
  @UseBefore(compression())
  async getOne(@Param("id") id: string): Promise<any> {
      // ...
  }
}
```

This way compression middleware will be applied only for `getOne` controller action, and will be executed before action execution. To execute middleware after action use **`@UseAfter`** decorator instead.

3. To use middleware per-controller:

```typescript
import { Controller, UseBefore } from "typeorm";
import compression from 'compression';

@Controller()
@UseBefore(compression())
export class UserController { }
```

This way compression middleware will be applied for all actions of the `UserController` controller, and will be executed before its action execution. Same way you can use **`@UseAfter`** decorator here.

4. If you want to use compression module globally for all controllers you can simply register it during bootstrap:

```typescript
import { TypeNexus, Action } from 'typenexus';
import { UserController } from './UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  });
  app.controllers([UserController]);
  app.express.use(compression());
  await app.start();
})();
```

Alternatively, you can create a custom [global middleware](#global-middlewares) and simply delegate its execution to the compression module.

### Creating your own express middleware

Here is example of creating middleware for express.js:

1. There are two ways of creating middleware:

First, you can create a simple middleware function:

```typescript
import { Request, Response, NextFunction } from 'express';

export function loggingMiddleware(request: Request, response: Response, next?: NextFunction): any {
  console.log('do something...');
  next();
}
```

Second you can create a class:

```typescript
import { ExpressMiddlewareInterface } from 'typenexus';

export class MyMiddleware implements ExpressMiddlewareInterface {
  // interface implementation is optional
  use(request: Request, response: Response, next?: NextFunction): any {
    console.log('do something...');
    next();
  }
}
```

2. Then you can use them this way:

```typescript
import { Controller, UseBefore, UseAfter } from 'typeorm';
import { MyMiddleware, MyMiddleware2 } from './MyMiddleware';
import { loggingMiddleware } from './loggingMiddleware';

@Controller()
@UseBefore(MyMiddleware, MyMiddleware2)
@UseAfter(loggingMiddleware)
export class UserController {}
```

3. or per-action:

```typescript
import { Controller, UseBefore, UseAfter, Get } from 'typeorm';
import { MyMiddleware } from './MyMiddleware';
import { loggingMiddleware } from './loggingMiddleware';

@Controller()
export class UserController {
  @Get("/users/:id")
  @UseBefore(MyMiddleware)
  @UseAfter(loggingMiddleware)
  getOne(@Param("id") id: string) {
    // ...
  }
}
```

**`@UseBefore`** executes middleware before controller action. **`@UseAfter`** executes middleware after each controller action.

### Global middlewares

Global middlewares run before each request, always. To make your middleware global mark it with **`@Middleware`** decorator and specify if it runs after or before controllers actions.

```typescript
import { ExpressMiddlewareInterface } from 'typenexus';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'before' })
export class LoggingMiddleware implements ExpressMiddlewareInterface {
  use(request: Request, response: Response, next: NextFunction): void {
    console.log('do something...');
    // @ts-ignore
    request.test = 'wcj';
    next();
  }
}
```

To enable this middleware, specify it during `typenexus` initialization:

```typescript
import { TypeNexus } from 'typenexus';
import './LoggingMiddleware.js';

const app = new TypeNexus(3002, {
  routePrefix: '/api',
  developmentMode: false,
});
```

Or register with `app.controllers()`.

```typescript
import { TypeNexus } from 'typenexus';
import { LoggingMiddleware } from './LoggingMiddleware.js';
import { UserController } from './UserController.js';

const app = new TypeNexus(3002, {
  routePrefix: '/api',
  developmentMode: false,
});
app.controllers([UserController], [LoggingMiddleware]);
```

### Error handlers

Error handlers are specific only to express. Error handlers work same way as middlewares, but implement `ExpressErrorMiddlewareInterface`:

Create a class that implements the `ErrorMiddlewareInterface` interface:

```typescript
import { Middleware, ExpressErrorMiddlewareInterface } from 'typenexus';
import { Request, Response, NextFunction } from 'express';

@Middleware({ type: 'after' })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: Request, response: Response, next: NextFunction): void {
    response.status(error.status || 500);
    next();
  }
}
```

Custom error handlers are invoked after the default error handler, so you won't be able to change response code or headers. To prevent this, you have to disable default error handler by specifying **defaultErrorHandler** option in `TypeNexusOptions`:

```typescript
import { TypeNexus } from 'typenexus';

const app = new TypeNexus(3002, {
  routePrefix: '/api',
  developmentMode: false,
  defaultErrorHandler: false, // disable default error handler, only if you have your own error handler
});
```

## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/typenexus/graphs/contributors">
  <img src="https://jaywcjlove.github.io/typenexus/CONTRIBUTORS.svg" />
</a>

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).


## License

This package is licensed under the MIT License.