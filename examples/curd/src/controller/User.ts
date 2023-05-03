import { Controller, ContentType, Get, Param, Post, Delete, Res, Req, DSource, DataSource } from 'typenexus';
import { Body, BodyParam, Authorized, SessionParam } from 'typenexus';
import { Response, Request } from 'express';
import crypto from 'crypto';
import { User } from '../entity/User.js';

// Fix type error issue
// e.g: `req.session.userInfo`
import 'express-session';

interface UserResult {
  code: number;
  message: string;
  token?: string;
}

@Controller('/users')
export class UserController {
  constructor(@DSource() private dataSource: DataSource) {}
  @ContentType('application/json')
  @Authorized()
  @Get()
  public async all(): Promise<User[]> {
    return this.dataSource.manager.find(User);
  }
  @Post('/login')
  public async login(
    @BodyParam('username') username: string,
    @BodyParam('password') password: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<User | UserResult> {
    if (!username) {
      res.status(332);
      return { code: 1, message: '请输入登录账号' };
    }
    if (!password) {
      res.status(331);
      return { code: 2, message: '请输入登录密码' };
    }

    const hashPassword = crypto.createHmac('sha256', password).digest('hex');
    const userInfo = await this.dataSource.manager.findOne(User, {
      where: { username, password: hashPassword },
      select: ['username', 'id', 'name', 'createAt', 'deleteAt'],
    });
    if (!userInfo) {
      res.status(401);
      return { code: 3, message: '用户名或密码错误' };
    }
    if (req.session?.token) {
      const { token, userInfo: sessionUserInfo } = req.session;
      return { ...userInfo, token, ...sessionUserInfo };
    }
    const token = crypto.createHmac('sha256', `${username}`).digest('hex');
    req.session.token = token;
    req.session.userInfo = userInfo;
    req.session.userId = userInfo.id;
    return { ...userInfo, token };
  }
  @Get('/verify')
  public async verify(
    @SessionParam('token') token: string,
    @SessionParam('userInfo') userInfo: User,
    @Res() res: Response,
  ): Promise<User | UserResult> {
    if (token) {
      return { token, ...userInfo };
    }
    res.status(401);
    return { code: 401, message: 'Expired, please login again!' };
  }
  @Get('/:userId')
  public async detail(@Param('userId') userId: string, @Res() res: Response): Promise<User | UserResult> {
    const info = await this.dataSource.manager.findOneBy(User, {
      id: userId as unknown as number,
    });
    if (!info) res.status(404);
    return info;
  }
  @Post('/logout')
  public async logout(@Req() req: Request, @Res() res: Response) {
    const destroy = () =>
      new Promise((resolve, reject) => {
        req.session.destroy((error) => {
          res.status(error ? 500 : 200);
          error ? reject({ ...error }) : resolve({ message: 'Logout successful!' });
        });
      });
    return destroy();
  }
  @Post()
  public async create(@Body() body: User, @Res() res: Response) {
    if (body.password) {
      body.password = crypto.createHmac('sha256', body.password).digest('hex');
    }
    const userEntity = this.dataSource.manager.create(User, { ...body });
    try {
      const userInfo = await this.dataSource.manager.save(userEntity);
      delete userInfo.password;
      return userInfo;
    } catch (error) {
      res.status(409);
      return { message: 'User already exists and cannot be created.' };
    }
  }
  @Delete('/:userId')
  public async remove(@Param('userId') userId: string, @Res() res: Response) {
    const result = await this.dataSource.manager.softDelete(User, userId);
    res.status(result.affected ? 200 : 404);
    return result.affected ? { message: 'Deletion successful!' } : { message: 'Deletion failed!' };
  }
}
