/** @jest-environment node */
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      routePrefix: '/api',
      developmentMode: false,
    });
    app.controllers([UserController]);
    agent = supertest.agent(app.app);
  });

  test('GET /api/users', async () => {
    const result = await agent
      .get('/api/users')
      .set('Accept', 'application/json')
      .expect(302)

    expect(result.redirect).toEqual(true);
    expect(result.header.location).toEqual('http://github.com/jaywcjlove/typenexus');
  });

  test('GET /api/redirect/github', async () => {
    const result = await agent
      .get('/api/redirect/github')
      .set('Accept', 'application/json')
      .expect(302)

    expect(result.redirect).toEqual(true);
    expect(result.header.location).toEqual('http://github.com');
  });

  test('GET /api/redirect/location', async () => {
    const result = await agent
      .get('/api/redirect/location')
      .set('Accept', 'application/json')
      .expect(201)

    expect(result.body).toEqual({});
    expect(result.redirect).toEqual(false);
    expect(result.header.location).toEqual('https://bing.com');
  });

  test('GET /api/users/location', async () => {
    const result = await agent
      .get('/api/users/location')
      .set('Accept', 'application/json')
      .expect(404)

    expect(result.redirect).toEqual(false);
    expect(result.body).toEqual({ name: 'NotFoundError' });
    expect(result.header['cache-control']).toEqual('none');
  });
});
