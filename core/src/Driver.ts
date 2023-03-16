import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import { DataSource } from 'typeorm';
import { RouteParameters } from 'express-serve-static-core';
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { ParamMetadata } from './metadata/ParamMetadata.js';
import { Action } from './Action.js';

export abstract class Driver {
  /**
   * Global application prefix.
   */
  public routePrefix: string = '';
  public dataSource: DataSource;
  public app: Express;
  constructor(public readonly port: number = 3000) {
    this.app = express();
    this.app.use(express.json());
    this.app.set('port', process.env.PORT || this.port);
  }
  public use<Route extends string = string>(handlers: Array<RequestHandler<RouteParameters<Route>>>) {
    this.app.use(handlers);
    return this.app;
  }
  public set(setting: string, val: any) {
    this.app.set(setting, val);
    return this.app;
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
    if (result && result === options.response) {
      options.next!();
      return;
    }
    if (action.controllerMetadata.type === 'json') {
      options.response.json(result || {});
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

      case 'body-param':
        return request.body[param.name];

      case 'session-param':
        return request.session[param.name];

      case 'session':
        return request.session;

      case 'query':
        return request.query[param.name];

      case 'queries':
        return request.query;

      case 'header':
        return request.headers[param.name.toLowerCase()];

      case 'headers':
        return request.headers;

    }
  }

}