import { TypeNexus, TypeNexusOptions, DataSourceOptions } from 'typenexus';
import { UserController } from './user.controller.js';
import { Session } from './session.entity.js';
import { User } from './user.entity.js';

const ormOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'wcjiang',
  database: process.env.POSTGRES_DB || 'typenexus-base',
  synchronize: true,
  logging: true,
  // entities: ['dist/entity/*.js'],
  entities: [User, Session],
};

(async () => {
  const options: TypeNexusOptions = {
    dataSourceOptions: ormOptions,
    session: {
      secret: 'secret',
      resave: false,
      saveUninitialized: false,
      repositoryTarget: Session,
      typeormStore: {
        cleanupLimit: 2,
        // limitSubquery: false, // If using MariaDB.
        ttl: 86400,
      },
    },
  };
  const app = new TypeNexus(options);
  await app.connect();
  app.controllers([UserController]);
  app.express.disable('x-powered-by');

  await app.start();
})();
