import { TypeNexus } from 'typenexus';
import { UserController } from './UserController.js';

(async () => {
  const app = new TypeNexus(3012, {
    routePrefix: '/api',
    developmentMode: false,
  });

  app.controllers([UserController]);
  await app.start();
})();
