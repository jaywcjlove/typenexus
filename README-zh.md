TypeNexus
===

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://jaywcjlove.github.io/#/sponsor)
[![Build & Test](https://github.com/jaywcjlove/typenexus/actions/workflows/CI.yml/badge.svg)](https://github.com/jaywcjlove/typenexus/actions/workflows/CI.yml)
[![NPM Downloads](https://img.shields.io/npm/dm/typenexus.svg?style=flat)](https://www.npmjs.com/package/typenexus)
[![NPM version](https://img.shields.io/npm/v/typenexus.svg?style=flat&label=typenexus)](https://npmjs.org/package/typenexus)
[![typeorm@^0.3.12](https://shields.io/badge/typeorm-^0.3.12-green?style=flat&logo=node.js)](https://www.npmjs.com/package/typeorm)
[![express@^4.18.2](https://shields.io/badge/express-^4.18.2-green?style=flat&logo=express)](https://www.npmjs.com/package/express)

TypeNexus 是一个很棒的 API 封装和管理工具。 它提供了一种干净、轻量级的方式来捆绑 [TypeORM](https://github.com/typeorm/typeorm) + [Express.js](https://github.com/expressjs/express) 功能，帮助您构建 应用程序速度更快，同时减少模板代码冗余和类型转换工作。


## 安装

```shell
$ npm install typenexus
```

在项目的 `tsconfig.json` 文件中设置这些选项很重要：

```typescript
{
  "emitDecoratorMetadata": true,
  "experimentalDecorators": true
}
```

在项目的 `package.json` 文件中设置这些选项很重要：

```typescript
{
  "type": "module",
}
```

## 快速开始

```javascript
import { TypeNexus } from 'typenexus';

(async () => {
  const app = new TypeNexus();
  await app.start();
  // 在浏览器中打开 http://localhost:3000
})();
```

### ❶ 创建 API

`./src/controller/UserController.ts`

```typescript
import { TypeNexus, Controller, Param, Body, DataSource } from 'typenexus';
import { Get, Post, Put, Delete, Patch, Delete, Head } from 'typenexus';
import { User } from '../entities/user.entity';

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

此类将在服务器框架 [Express.js](https://github.com/expressjs/express) 中注册方法装饰器中指定的路由。

### ❷ 创建实体

实体是映射到数据库表（或使用“Postgres”时的集合）的类。 您可以通过定义一个新类来创建一个实体，并用 **`@Entity()`** 标记它：

`./src/entities/user.entity.ts`

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

### ❸ 创建服务器

`./src/entities/user.entity.ts`

```typescript
import { TypeNexus } from 'typenexus';
import { UserController } from './controller/User.js';

;(async () => {
  const app = new TypeNexus();
  // ❶ 执行与数据库的连接
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
  // ❷ 🚨 请务必在 `app.connect()` 之后使用它
  app.controllers([UserController]);
  // ❸ 监听连接
  await app.start();

})();
```

在浏览器中打开 http://localhost:3000/users。 您将看到此操作返回浏览器中的所有用户。 如果您打开 “http://localhost:3000/api/users/1”，您将看到此操作返回用户数据。

```bash
└── src
    ├── controller
    │   └── User.ts
    ├── entity
    │   └── User.ts
    └── index.ts
```