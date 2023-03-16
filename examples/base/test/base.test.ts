import { TypeNexus, DataSourceOptions } from 'typenexus';
import request from 'supertest';
import assert from 'node:assert/strict';
import { UserController } from '../dist/controller/User.js';

const options: DataSourceOptions = { 
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'wcjiang',
  database: process.env.POSTGRES_DB || 'typenexus-base',
  synchronize: true,
  logging: false,
  entities: ['dist/entity/*.js'],
}

;(async () => {
  const app = new TypeNexus(3033);
  app.controllers([UserController]);
  await app.connect(options);

  console.log('\x1b[32;1m GET\x1b[0m /users');
  let req = await request(app.app)
    .get('/users')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.equal(Array.isArray(req.body), true);
  assert.deepEqual(req.body, []);

  console.log('\x1b[32;1m GET\x1b[0m /users/users/info?user=wcj&age=18');
  req = await request(app.app)
    .get('/users/users/info?user=wcj&age=18')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12, user: 'wcj', queries: { user: 'wcj', age: '18' } });

  console.log('\x1b[32;1m GET\x1b[0m /users/users/info?user=wcj&user=jay');
  req = await request(app.app)
    .get('/users/users/info?user=wcj&user=jay')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12, user: ['wcj', 'jay'], queries: { user: ['wcj', 'jay'] } });

  console.log('\x1b[32;1m POST\x1b[0m /users');
  req = await request(app.app)
    .post('/users')
    .send({ name: 'john' })
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, {  id: 12, name: 'john' });

  console.log('\x1b[32;1m PUT\x1b[0m /users/info/:id');
  req = await request(app.app)
    .put('/users/info/34')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: '34', params: { id: '34' } });

})();
