import express, { Express, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';
import cookie from 'cookie';
import compression from 'compression';
import session from 'express-session';
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { ParamMetadata } from './metadata/ParamMetadata.js';
import { TypeNexusOptions } from './DriverOptions.js';
import { Action } from './Action.js';

export abstract class Driver {
  /**
   * Global application prefix.
   */
  public routePrefix: string = '';
  public dataSource: DataSource;
  public app: Express = express();
  public express: Express = this.app;
  constructor(public readonly port: number = Number(process.env.PORT || 3000), public options?: TypeNexusOptions) {
    this.port = options?.port || this.port;
    this.express.set('port', this.port);
    this.routePrefix = options?.routePrefix || this.routePrefix;
    if (this.options.bodyParser?.json !== false) {
      this.app.use(express.json(this.options.bodyParser?.json));
    }
    if (this.options.bodyParser?.text) {
      this.app.use(express.text(this.options.bodyParser?.text));
    }
    if (this.options.bodyParser?.raw) {
      this.app.use(express.raw(this.options.bodyParser?.raw));
    }
    if (this.options.compression !== false) {
      this.app.use(compression(this.options.compression));
    }
    if (this.options.bodyParser?.urlencoded !== false) {
      this.app.use(express.urlencoded({ extended: false, ...this.options.bodyParser?.urlencoded }))
    }
  }
  public async registerSession() {
    if (this.options?.session) {
      let sessionOptions = typeof this.options?.session == 'function' ? this.options?.session({ app: this, dataSource: this.dataSource }) : this.options?.session;
      if (sessionOptions.repositoryTarget) {
        const reps = this.dataSource.getRepository(sessionOptions.repositoryTarget);
        const typeormStoreOptions = {
          // limitSubquery: false, // If using MariaDB.
          cleanupLimit: 2,
          ttl: 86400,
          ...sessionOptions.typeormStore,
        }
        sessionOptions.store = new TypeormStore(typeormStoreOptions).connect(reps)
      }
      this.app.use(session(sessionOptions));
    }
  }
  public registerAction(actionMetadata: ActionMetadata, executeCallback: (options: Action) => any) {
    // prepare route and route handler function
    const route = ActionMetadata.appendBaseRoute(this.routePrefix, actionMetadata.fullRoute);
    const routeHandler = (request: Request, response: Response, next: NextFunction) => {
      return executeCallback({ request, response, next, dataSource: this.dataSource });
    };
    this.app[actionMetadata.type.toLowerCase() as keyof Express](...[route, routeHandler]);
  }
  /**
   * Handles result of successfully executed controller action.
   */
  public handleSuccess(result: any, action: ActionMetadata, options: Action) {
    /**
     * HTTP HEAD requests are a type of request similar to GET requests,
     * but the server does not return the entity body of the requested resource.
     * Instead, it only returns the metadata of the requested resource,
     * such as the response header information. Therefore,
     * it is often used to retrieve metadata of resources,
     * such as whether a resource exists or its last modification time.
     */
    if (result && result === options.response) {
      options.next!();
      return;
    }
    if (action.controllerMetadata.type === 'json') {
      options.response.json(result);
    }
    options.next!();
  }
  /**
   * Handles result of failed executed controller action.
   */
  handleError(error: any, action: ActionMetadata | undefined, options: Action): any {
    options.next!(error);
  }
  /**
   * Gets param from the request.
   */
  getParamFromRequest(action: Action, param: ParamMetadata): any {
    const request: any = action.request;
    switch (param.type) {
      case 'body':
        return request.body;

      case 'param':
        return request.params[param.name];

      case 'params':
        return request.params;

      case 'query':
        return request.query[param.name];

      case 'queries':
        return request.query;

      case 'body-param':
        return request.body[param.name];

      case 'session-param':
        return request.session[param.name];

      case 'session':
        return request.session;

      case 'header':
        return request.headers[param.name.toLowerCase()];

      case 'headers':
        return request.headers;
      
      case 'cookie':
        if (!request.headers.cookie) return;
        const cookies = cookie.parse(request.headers.cookie);
        return cookies[param.name];

      case 'cookies':
        if (!request.headers.cookie) return {};
        return cookie.parse(request.headers.cookie);

    }
  }

}