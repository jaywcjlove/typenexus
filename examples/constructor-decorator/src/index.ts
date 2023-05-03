import { TypeNexus } from 'typenexus';
import crypto from 'crypto';
import { config, adminAccount } from './config.js';
import { UserController } from './controller/User.js';
import { User } from './entity/User.js';

(async () => {
  const app = new TypeNexus(3002, config);
  await app.connect();

  // Check if an administrator account has been created.
  // 🚨 Please be sure to use it after `app.connect()`.
  const repos = app.dataSource.getRepository(User);
  // Check if there is an admin account.
  const adminUser = await repos.findOneBy({ username: 'wcj' });
  if (!adminUser) {
    const hashPassword = crypto.createHmac('sha256', adminAccount.password).digest('hex');
    // Create an admin account.
    const user = await repos.create({
      ...adminAccount,
      password: hashPassword,
    });
    await repos.save(user);
  }

  app.controllers([UserController]);
  app.express.disable('x-powered-by');
  await app.start();
})();
