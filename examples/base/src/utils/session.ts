import { TypeNexus } from 'typenexus';
import { TypeormStore } from '@wcj/connect-typeorm';
import { Session } from '../entity/Session.js';

export const createSession = (app: TypeNexus) => {
  // Session
  const repository = app.dataSource.getRepository(Session);
  const store = new TypeormStore({
    cleanupLimit: 2,
    // limitSubquery: false, // If using MariaDB.
    ttl: 86400,
  }).connect(repository);

  app.useSession({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
}