/** @jest-environment node */
import { TypeNexus, TypeNexusOptions, Action } from 'typenexus';
import crypto from 'crypto';
import supertest from 'supertest';
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
    database: process.env.POSTGRES_DB || 'typenexus-constructor-decorator-test',
    synchronize: true,
    logging: false,
    // entities: ['dist/entity/*.js'],
    entities: [User],
  }
}

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(async () => {
    app = new TypeNexus(3033, testConf);
    await app.connect();
    app.controllers([UserController]);
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

  it('GET /api/users \x1b[34;1m \x1b[0m', async () => {
    const result = await agent
      .get('/api/users')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(Object.keys(result.body[0])).toEqual([ 'id', 'username', 'name', 'deleteAt', 'createAt' ]);
    // expect(result.body).toEqual([]);
  });

});
