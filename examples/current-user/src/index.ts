import { TypeNexus, Action } from 'typenexus';
import { UserController } from './UserController.js';
import { User } from './User.js';

;(async () => {
  const app = new TypeNexus(3002, {
    routePrefix: '/api',
    developmentMode: false,
  });

  app.currentUserChecker = async (action: Action) => {
    return new User(1, 'Johny', 'Cage');
  }

  app.controllers([UserController]);
  await app.start();
})();