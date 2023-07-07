/** @jest-environment node */
import path from 'path'
import { TypeNexus } from 'typenexus';
import supertest from 'supertest';
import { UserController } from '../dist/UserController.js';

describe('API request test case', () => {
  let app: TypeNexus;
  let agent: supertest.SuperAgentTest;
  beforeAll(() => {
    app = new TypeNexus(3112, {
      routePrefix: '/api',
      developmentMode: false,
    });
    app.controllers([UserController]);
    agent = supertest.agent(app.app);
  });

  test('POST /api/file', async () => {
    const result = await agent
      .post('/api/file')
      .attach('fileName1', './doc/demo.xml')
      .expect(200);

    expect(result.body).toEqual({
      fieldname: "fileName1",
      mimetype: "application/xml",
      originalname: "demo.xml",
    });
  });

  test('POST /api/multiple/file', async () => {
    const result = await agent
      .post('/api/multiple/file')
      .attach('fileName', './doc/demo.xml')
      .attach('fileName', './doc/demo2.xml')
      .expect(200);

    expect(result.body).toEqual({
      data: [
        {
          encoding: '7bit',
          fieldname: "fileName",
          mimetype: "application/xml",
          originalname: "demo.xml",
        },{
          encoding: '7bit',
          fieldname: "fileName",
          mimetype: "application/xml",
          originalname: "demo2.xml",
        }
      ]
    });
  });
});
