import { TypeNexus, TypeNexusOptions } from 'typenexus';
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
    logging: true,
    entities: ['dist/entity/*.js'],
  }
}

;(async () => {
  const app = new TypeNexus(3033, testConf);
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

  console.log('\x1b[32;1m POST\x1b[0m /api/users/login  \x1b[34;1m login\x1b[0m');
  const agent = supertest(app.app);
  const result = await agent.post('/api/users/login')
    .send({ username: "wcj", password: "1234" })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(Object.keys(result.body), [ 'id', 'username', 'name', 'deleteAt', 'createAt', 'token' ]);
  // console.log('req:', result.body)

})();
