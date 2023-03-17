import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';
import { Controllers } from './Controllers.js';
import { Driver } from './Driver.js';

export * from 'typeorm';
export * from './decorator/Controller.js';
export * from './decorator/Delete.js';
export * from './decorator/Patch.js';
export * from './decorator/Post.js';
export * from './decorator/Put.js';
export * from './decorator/Get.js';
export * from './decorator/Head.js';
export * from './decorator/Body.js';
export * from './decorator/BodyParam.js';
export * from './decorator/Param.js';
export * from './decorator/Params.js';
export * from './decorator/HeaderParam.js';
export * from './decorator/HeaderParams.js';
export * from './decorator/QueryParam.js';
export * from './decorator/QueryParams.js';
export * from './decorator/CookieParam.js';
export * from './decorator/CookieParam.js';
export * from './decorator/CookieParams.js';
export * from './decorator/Session.js';
export * from './decorator/SessionParam.js';
export * from './decorator/Res.js';
export * from './decorator/Req.js';
export * from './decorator/DSource.js';
export * from './DriverOptions.js';

/**
 * TypeNexus is a good tool for API encapsulation and management.
 * It provides a clean and lightweight way to package TypeORM functionality,
 * helping you build applications faster while reducing template code redundancy and type conversion work.
 */
export class TypeNexus extends Driver {
  /** import all controllers and middleman's and error handlers (new way) */
  public controllers(classes: Function[]) {
    new Controllers(this).registerControllers(classes)
  }
  public async connect(options?: DataSourceOptions): Promise<TypeNexus> {
    try {
      const opts = { ...this.options?.dataSourceOptions, ...options } as DataSourceOptions;
      await createDatabase({ ifNotExist: true, options: opts });
      this.dataSource = new DataSource({ ...opts });
      const dataSource = await this.dataSource.initialize();
      if (!dataSource.isInitialized) {
        throw new Error('Initialization and establishment of initial connection/connection pool to database failed.');
      }
      await this.registerSession()
    } catch (error) {
      console.error('Error connecting to the database', error);
      process.exit(1);
    }
    return Promise.resolve(this);
  }
  public async start(): Promise<TypeNexus> {
    await new Promise(resolve => this.app.listen(this.port, resolve as () => void));
    console.log(
      '\n  App is running at\x1b[32;1m http://localhost:%d\x1b[0m in %s mode',
      this.app.get('port'),
      this.app.get('env'),
    );
    console.log('  Press\x1b[33;1m CTRL-C\x1b[0m to stop\n');
    return this;
  }
  public async stop(): Promise<void> {
    this.dataSource.destroy();
    console.log('Connection to the database closed');
  }
}