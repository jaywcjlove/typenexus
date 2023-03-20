import { TypeNexus, TypeNexusOptions, Action } from 'typenexus';
import crypto from 'crypto';
import supertest from 'supertest';
import assert from 'node:assert/strict';
import { UserController } from '../dist/controller/User.js';
import { config, adminAccount } from '../dist/config.js';
import { User } from '../dist/entity/User.js';

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
    entities: ['dist/entity/*.js'],
  }
}

;(async () => {
  const app = new TypeNexus(3033, testConf);
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

  const log = (method: string = 'GET', url: string, info?: string) => console.log(...[`\x1b[32;1m ${method}\x1b[0m`, url, info ? `\x1b[34;1m ${info}\x1b[0m` : '']);

  log('POST', '/api/users/login', 'login');
  const agent = supertest.agent(app.app);
  let authToken = '';
  let result = await agent
    .post('/api/users/login')
    .send({ username: "wcj", password: "1234" })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(Object.keys(result.body), [ 'id', 'username', 'name', 'deleteAt', 'createAt', 'token' ]);
  authToken = result.body.token;

  log('GET ', '/api/users?token=xxx', 'auth');
  result = await agent
    .get(`/api/users?token=${authToken}`)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.equal(result.body.length > 0, true);
  assert.equal(result.body[0].id, 1);
  assert.equal(result.body[0].name, 'admin');
  assert.equal(result.body[0].username, 'wcj');

})();
