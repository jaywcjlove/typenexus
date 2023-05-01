import { TypeNexusOptions } from 'typenexus';

export const config: TypeNexusOptions = {
  routePrefix: '/api',
  developmentMode: false,
  dataSourceOptions: {
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'wcjiang',
    database: process.env.POSTGRES_DB || 'typenexus-constructor-decorator',
    synchronize: true,
    logging: true,
    entities: ['dist/entity/*.js'],
    // entities: [User], 
  },
}

export const adminAccount = {
  username: 'wcj',
  name: 'admin',
  password: '1234'
}