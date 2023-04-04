/** @jest-environment node */
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3002, {
      developmentMode: false,
    });
    app.controllers([UserController]);
    agent = supertest.agent(app.app);
  });

  test('GET /blogs', async () => {
    const result = await agent
      .get('/blogs')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403)
    expect(result.body).toEqual({ name: 'ForbiddenError', message: 'Nooooo this message will be lost' });
  });
});
