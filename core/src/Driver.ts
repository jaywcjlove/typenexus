import express, { Express, Request, Response, NextFunction, RequestHandler } from 'express';
import { RouteParameters } from 'express-serve-static-core';
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { Action } from './Action.js';

export abstract class Driver {
  /**
   * Global application prefix.
   */
  public routePrefix: string = '';
  public app: Express;
  constructor(public readonly port: number = 3000) {
    this.app = express();
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
    const routeHandler = function routeHandler(request: Request, response: Response, next: NextFunction) {
      return executeCallback({ request, response, next });
    };
    this.app[actionMetadata.type.toLowerCase() as keyof Express](...[route, routeHandler]);
  }
  /**
   * Handles result of successfully executed controller action.
   */
  public handleSuccess(result: any, action: ActionMetadata, options: Action) {
    console.log('::handleSuccess:1:', result, action)
    console.log('::handleSuccess:2:', result, result === options.response)
    if (result && result === options.response) {
      options.next();
      return;
    }
    options.next();
  }
  /**
   * Handles result of failed executed controller action.
   */
  handleError(error: any, action: ActionMetadata | undefined, options: Action): any {
    options.next(error);
  }
}