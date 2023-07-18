/** @jest-environment node */
import { TypeNexus, TypeNexusOptions } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/user.controller.js';
import { Session } from '../dist/session.entity.js';
import { User } from '../dist/user.entity.js';

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
    // entities: ['dist/entity/*.js'],
    entities: [Session, User],
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
  },
  cors: {
    origin: 'http://localhost:3001',
    credentials: true,
  },
}

describe('API request test case', () => {
  let app: TypeNexus;
  beforeAll(async () => {
    app = new TypeNexus(options);
    await app.connect();
    app.controllers([UserController]);
  });

  it('GET /users \x1b[34;1m @DSource\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .get('/users')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual([]);
    expect(Array.isArray(req.body)).toBeTruthy();
  });

  it('GET /users/users/info?user=wcj&age=18 \x1b[34;1m @QueryParam/@QueryParams\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .get('/users/users/info?user=wcj&age=18')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, user: 'wcj', queries: { user: 'wcj', age: '18' } });
  });

  it('GET /users/users/info?user=wcj&user=jay \x1b[34;1m user=[]\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .get('/users/users/info?user=wcj&user=jay')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, user: ['wcj', 'jay'], queries: { user: ['wcj', 'jay'] } });
  });

  it('POST /users \x1b[34;1m user=[]\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .post('/users')
      .send({ name: 'john' })
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, name: 'john', username: 'john' });
  });

  it('PUT /users/info/:id', async () => {
    const req = await supertest.agent(app.app)
      .put('/users/info/34')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: '34', params: { id: '34' } });
  });
  
  it('DELETE /users/order/:id \x1b[34;1m @HeaderParams/@HeaderParam\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .delete('/users/order/34')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, accept: 'application/json', keys: ['host', 'accept-encoding', 'accept', 'connection'] });
  });
  
  it('GET /users/order/:id \x1b[34;1m cookies|@Get\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .get('/users/order/34').set('Cookie', ['token=YourAccessToken', 'userId=123'])
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, token: 'YourAccessToken', cookies: { token: 'YourAccessToken', userId: '123' } });
  });
  
  test('PATCH /users/order/:id', async () => {
    const req = await supertest.agent(app.app)
      .patch('/users/order/34')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12 });
  });
  
  test('HEAD /users/order \x1b[34;1m @Head\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .head('/users/order')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ });
  });
  
  test('POST /users/session \x1b[34;1m @Session/@SessionParam\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .post('/users/session')
      .send({ username: 'foo', password: 'password' })
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, session: ['cookie'], cookie: ['path', '_expires', 'originalMaxAge', 'httpOnly'] });
  });
  
  
  test('GET /users/order/:id', async () => {
    const req = await supertest.agent(app.app)
      .get('/users/order/34').set('Cookie', ['token=YourAccessToken', 'userId=123'])
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
    expect(req.body).toEqual({ id: 12, token: 'YourAccessToken', cookies: { token: 'YourAccessToken', userId: '123' } });
    expect(req.header['access-control-allow-origin']).toEqual('http://localhost:3001');
  });

  test('POST /users/text-html \x1b[34;1m @Session/@SessionParam\x1b[0m', async () => {
    const req = await supertest.agent(app.app)
      .get('/users/text-html')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200)
      console.log('req.text:', req.text)
    expect(req.text).toEqual('<html>Test</html>');
  });
});

