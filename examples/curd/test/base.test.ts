/** @jest-environment node */
import { TypeNexus, TypeNexusOptions, Action } from 'typenexus';
import crypto from 'crypto';
import supertest from 'supertest';
import { UserController } from '../dist/controller/User.js';
import { config, adminAccount } from '../dist/config.js';
import { User } from '../dist/entity/User.js';
import { Session } from '../dist/entity/Session.js';

const testConf: TypeNexusOptions = {
  ...config,
  dataSourceOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-curd-test',
    synchronize: true,
    logging: false,
    // entities: ['dist/entity/*.js'],
    entities: [Session, User],
  }
}

describe('API request test case', () => {
  let app: TypeNexus;
  let authToken = '';
  let agent: supertest.SuperAgentTest;
  beforeAll(async () => {
    app = new TypeNexus(3033, testConf);
    await app.connect();
    app.controllers([UserController]);
    app.authorizationChecker = async (action: Action, roles: string[]) => {
      // here you can use request/response objects from action
      // also if decorator defines roles it needs to access the action
      // you can use them to provide granular access check
      // checker must return either boolean (true or false)
      // either promise that resolves a boolean value
      // demo code: 
      const token = action.request.query.token || action.request.body.token || (action.request.headers.authorization || '').replace(/^token\s/, '');

      // @ts-ignore
      if (action.request.session.token === token) return true;
      return false;
    }
    // Check if an administrator account has been created.
    // 🚨 Please be sure to use it after `app.connect()`.
    const repos = app.dataSource.getRepository(User);
    // Check if there is an admin account.
    const adminUser = await repos.findOneBy({ username: 'wcj' });
    if (!adminUser) {
      const hashPassword = crypto.createHmac('sha256', adminAccount.password).digest('hex');
      // Create an admin account.
      const user = await repos.create({
        ...adminAccount,
        password: hashPassword,
      });
      await repos.save(user);
    }

    agent = supertest.agent(app.app);
  });

  it('POST /api/users/login \x1b[34;1m \x1b[0m', async () => {
    const result = await agent
      .post('/api/users/login')
      .send({ username: "wcj", password: "1234" })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(Object.keys(result.body)).toEqual([ 'id', 'username', 'name', 'deleteAt', 'createAt', 'token' ]);
    authToken = result.body.token;
  });

  it('GET /api/users?token=xxx \x1b[34;1m @Authorized()\x1b[0m', async () => {
    const result = await agent
      .get(`/api/users?token=${authToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(result.body.length > 0).toEqual(true);
    expect(result.body[0].id).toEqual(1);
    expect(result.body[0].name).toEqual('admin');
    expect(result.body[0].username).toEqual('wcj');
  });

  it('GET /api/users/verify?token=xxx', async () => {
    const result = await agent
      .get(`/api/users/verify?token=${authToken}`)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      expect(Object.keys(result.body)).toEqual([ 'token', 'id', 'username', 'name', 'deleteAt', 'createAt' ]);
  });

});
