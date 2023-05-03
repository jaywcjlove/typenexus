import { TypeNexusOptions } from 'typenexus';
import { Session } from './entity/Session.js';

export const config: TypeNexusOptions = {
  routePrefix: '/api',
  developmentMode: false,
  dataSourceOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-curd',
    synchronize: true,
    logging: true,
    entities: ['dist/entity/*.js'],
    // entities: [User],
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
    },
  },
};

export const adminAccount = {
  username: 'wcj',
  name: 'admin',
  password: '1234',
};
