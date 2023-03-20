import { TypeNexus } from 'typenexus';
import { UserController } from './UserController.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  }); 

  app.controllers([UserController]);
  await app.start();
})();