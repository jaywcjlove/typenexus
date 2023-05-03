import { TypeNexus } from 'typenexus';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { UserController, CustomErrorHandler } from './UserController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const app = new TypeNexus(3002, {
    developmentMode: false,
    defaultErrorHandler: false,
  });
  app.express.set('views', path.join(__dirname, 'views'));
  app.express.set('view engine', 'ejs');
  app.controllers([UserController], [CustomErrorHandler]);
  await app.start();
})();
