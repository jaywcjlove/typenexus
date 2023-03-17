import { TypeNexus, TypeNexusOptions } from 'typenexus';
import request from 'supertest';
import assert from 'node:assert/strict';
import { UserController } from '../dist/controller/User.js';

// @ts-ignore
import session from 'supertest-session';
import { Session } from '../dist/entity/Session.js';

const options: TypeNexusOptions = {
  dataSourceOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-base',
    synchronize: true,
    logging: false,
    entities: ['dist/entity/*.js'],
  },
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
  const app = new TypeNexus(3033, options);
  app.controllers([UserController]);
  await app.connect();

  console.log('\x1b[32;1m GET\x1b[0m /users \x1b[34;1m @DSource\x1b[0m');
  let req = await request(app.app)
    .get('/users')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.equal(Array.isArray(req.body), true);
  assert.deepEqual(req.body, []);

  console.log('\x1b[32;1m GET\x1b[0m /users/users/info?user=wcj&age=18  \x1b[34;1m @QueryParam/@QueryParams\x1b[0m');
  req = await request(app.app)
    .get('/users/users/info?user=wcj&age=18')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12, user: 'wcj', queries: { user: 'wcj', age: '18' } });

  console.log('\x1b[32;1m GET\x1b[0m /users/users/info?user=wcj&user=jay \x1b[34;1m user=[]\x1b[0m');
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
  assert.deepEqual(req.body, { id: 12, name: 'john', username: 'john' });

  console.log('\x1b[32;1m PUT\x1b[0m /users/info/:id');
  req = await request(app.app)
    .put('/users/info/34')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: '34', params: { id: '34' } });

  console.log('\x1b[32;1m DELETE\x1b[0m /users/order/:id \x1b[34;1m @HeaderParams/@HeaderParam\x1b[0m');
  req = await request(app.app)
    .delete('/users/order/34')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12, accept: 'application/json', keys: ['host', 'accept-encoding', 'accept', 'connection'] });

  console.log('\x1b[32;1m GET\x1b[0m /users/order/:id \x1b[34;1m cookies|@Get\x1b[0m');
  req = await request(app.app)
    .get('/users/order/34').set('Cookie', ['token=YourAccessToken', 'userId=123'])
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12, token: 'YourAccessToken', cookies: { token: 'YourAccessToken', userId: '123' } });

  console.log('\x1b[32;1m PATCH\x1b[0m /users/order/:id');
  req = await request(app.app)
    .patch('/users/order/34')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { id: 12 });

  console.log('\x1b[32;1m HEAD\x1b[0m /users/order \x1b[34;1m @Head\x1b[0m');
  req = await request(app.app)
    .head('/users/order')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
  assert.deepEqual(req.body, { });

  ;(async () => {
    const app = new TypeNexus(3001, options);
    await app.connect();

    app.controllers([UserController]);
    const testSession = await session(app.app);

    console.log('\x1b[32;1m POST\x1b[0m /users/session \x1b[34;1m @Session/@SessionParam\x1b[0m');
    let req = await testSession
      .post('/users/session')
      .send({ username: 'foo', password: 'password' })
      .expect('Content-Type', /json/)
      .expect(200)
    assert.deepEqual(req.body, { id: 12, session: ['cookie'], cookie: ['path', '_expires', 'originalMaxAge', 'httpOnly'] });
  })();

})();
