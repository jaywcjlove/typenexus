import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { createDatabase } from 'typeorm-extension';
import localIpUrl from 'local-ip-url';
import { Controllers } from './Controllers.js';
import { Driver } from './Driver.js';

export * from 'typeorm';
export * from './decorator/Authorized.js';
export * from './decorator/ContentType.js';
export * from './decorator/Controller.js';
export * from './decorator/CurrentUser.js';
export * from './decorator/Delete.js';
export * from './decorator/Patch.js';
export * from './decorator/Post.js';
export * from './decorator/Put.js';
export * from './decorator/Get.js';
export * from './decorator/Head.js';
export * from './decorator/Body.js';
export * from './decorator/BodyParam.js';
export * from './decorator/Param.js';
export * from './decorator/OnUndefined.js';
export * from './decorator/OnNull.js';
export * from './decorator/Params.js';
export * from './decorator/Middleware.js';
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
export * from './decorator/Redirect.js';
export * from './decorator/UseAfter.js';
export * from './decorator/UseBefore.js';
export * from './decorator/Location.js';
export * from './decorator/HttpCode.js';
export * from './decorator/Header.js';
export * from './decorator/Render.js';
export * from './DriverOptions.js';

export * from './Action.js';

export * from './http-error/HttpError.js';
export * from './http-error/BadRequestError.js';
export * from './http-error/ForbiddenError.js';
export * from './http-error/InternalServerError.js';
export * from './http-error/MethodNotAllowedError.js';
export * from './http-error/NotAcceptableError.js';
export * from './http-error/NotFoundError.js';
export * from './http-error/UnauthorizedError.js';

/**
 * TypeNexus is a good tool for API encapsulation and management.
 * It provides a clean and lightweight way to package TypeORM functionality,
 * helping you build applications faster while reducing template code redundancy and type conversion work.
 */
export class TypeNexus extends Driver {
  /**
   * Performs connection to the database.
   * This method should be called once on application bootstrap.
   * This method not necessarily creates database connection (depend on database type),
   * but it also can setup a connection pool with database to use.
   */
  public async connect(options?: DataSourceOptions): Promise<TypeNexus> {
    try {
      const opts = { ...this.options?.dataSourceOptions, ...options } as DataSourceOptions;
      await createDatabase({ ifNotExist: true, options: opts });
      this.dataSource = new DataSource({ ...opts });
      const dataSource = await this.dataSource.initialize();
      if (!dataSource.isInitialized) {
        throw new Error('Initialization and establishment of initial connection/connection pool to database failed.');
      }
      await this.registerSession();
    } catch (error) {
      console.error('Error connecting to the database', error);
      process.exit(1);
    }
    return Promise.resolve(this);
  }
  /**
   * import all controllers and middleman's and error handlers (new way)
   * 🚨 Please be sure to use it after `app.connect()`.
   */
  public controllers(classes: Function[], middlewareClasses?: Function[]) {
    new Controllers(this, this.options)
      .registerMiddlewares('before', middlewareClasses, this.options)
      .registerControllers(classes)
      .registerMiddlewares('after', middlewareClasses, this.options);
  }
  /**
   * Listen for connections.
   */
  public async start(port: number = 3000): Promise<TypeNexus> {
    this.options.port = Number(process.env.PORT || this.options.port || port);
    this.express.set('port', this.options.port);
    // console.log('????', localIpUrl())
    await new Promise((resolve) => this.app.listen(this.options.port, resolve as () => void));
    console.log(
      '\n  App is running at\x1b[32;1m http://localhost:%d\x1b[0m in %s mode\n',
      this.app.get('port'),
      this.app.get('env'),
    );
    console.log(`   Local:            \x1b[32;1m http://localhost:%d\x1b[0m`, this.app.get('port'));
    console.log(`   On Your Network:  \x1b[32;1m http://%s:%d\x1b[0m\n`, localIpUrl(), this.app.get('port'));
    console.log('  Press\x1b[33;1m CTRL-C\x1b[0m to stop\n');
    return this;
  }
  public async stop(): Promise<void> {
    this.dataSource.destroy();
    console.log('Connection to the database closed');
  }
}
