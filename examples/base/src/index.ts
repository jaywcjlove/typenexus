import { TypeNexus } from 'typenexus';
import { UserController } from './controller/User.js';

;(async () => {
  const app = new TypeNexus(3009);
  app.controllers([UserController])

  app.app.disable('x-powered-by');

  await app.connect({ 
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-base',
    synchronize: true,
    logging: true,
    entities: ['dist/entity/*.js'],   
    // entities: [User],      
  });

  await app.start();

})();