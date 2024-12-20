import express, { Express, Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';
import { TypeormStore } from 'connect-typeorm';
import { parse as cookieParse } from 'cookie';
import multerFn, { DiskStorageOptions, Options } from 'multer';
import bodyParser from 'body-parser';
import compression from 'compression';
import session from 'express-session';
import cors from 'cors';
import pathTemplater from 'path-templater';
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { AuthorizationRequiredError } from './http-error/AuthorizationRequiredError.js';
import { AccessDeniedError } from './http-error/AccessDeniedError.js';
import { HttpError } from './http-error/HttpError.js';
import { MiddlewareMetadata } from './metadata/MiddlewareMetadata.js';
import { ParamMetadata } from './metadata/ParamMetadata.js';
import { UseMetadata } from './metadata/UseMetadata.js';
import { TypeNexusOptions, ExpressMiddlewareInterface, ExpressErrorMiddlewareInterface } from './DriverOptions.js';
import { getFromContainer } from './metadata/ControllerMetadata.js';
import { isPromiseLike } from './utils/isPromiseLike.js';
import { Action } from './Action.js';
import { AuthorizationCheckerNotDefinedError } from './http-error/AuthorizationCheckerNotDefinedError.js';
import { NotFoundError } from './http-error/NotFoundError.js';

export abstract class Driver {
  /**
   * Global application prefix.
   */
  public routePrefix: string = '';
  /**
   * DataSource is a pre-defined connection configuration to a specific database.
   * You can have multiple data sources connected (with multiple connections in it), connected to multiple databases in your application.
   */
  public dataSource: DataSource;
  public app: Express = express();
  public express: Express = this.app;
  /**
   * Special function used to check user authorization roles per request.
   * Must return true or promise with boolean true resolved for authorization to succeed.
   */
  public authorizationChecker?: TypeNexusOptions['authorizationChecker'];
  /**
   * Special function used to get currently authorized user.
   */
  public currentUserChecker?: TypeNexusOptions['currentUserChecker'];
  constructor(
    portOrOptions: number | TypeNexusOptions = 3000,
    public options: TypeNexusOptions = {},
  ) {
    if (typeof portOrOptions === 'object') {
      this.options = portOrOptions;
    }
    if (this.options.cors) {
      this.express.use(this.options.cors === true ? cors() : cors(this.options.cors));
    }
    this.routePrefix = options?.routePrefix || this.routePrefix;
    this.options.port = typeof portOrOptions === 'number' ? portOrOptions : options.port;
    this.options.port && this.express.set('port', this.options.port);
    this.options.defaultErrorHandler = options.defaultErrorHandler !== undefined ? options.defaultErrorHandler : true;
    this.currentUserChecker = this.options.currentUserChecker || this.currentUserChecker;
    this.authorizationChecker = this.options.authorizationChecker || this.authorizationChecker;

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
      this.app.use(express.urlencoded({ extended: false, ...this.options.bodyParser?.urlencoded }));
    }
  }
  public async registerSession() {
    if (this.options?.session) {
      let sessionOptions =
        typeof this.options?.session == 'function'
          ? this.options?.session({ app: this, dataSource: this.dataSource })
          : this.options?.session;
      if (sessionOptions.repositoryTarget) {
        const reps = this.dataSource.getRepository(sessionOptions.repositoryTarget);
        const typeormStoreOptions = {
          // limitSubquery: false, // If using MariaDB.
          cleanupLimit: 2,
          ttl: 86400,
          ...sessionOptions.typeormStore,
        };
        sessionOptions.store = new TypeormStore(typeormStoreOptions).connect(reps);
      }
      this.app.use(session(sessionOptions));
    }
  }
  public registerAction(actionMetadata: ActionMetadata, executeCallback: (options: Action) => any) {
    // middlewares required for this action
    const defaultMiddleware: ((request: Request, response: Response, next: NextFunction) => void)[] = [];

    if (actionMetadata.isBodyUsed) {
      if (actionMetadata.isJsonTyped) {
        defaultMiddleware.push(bodyParser.json(actionMetadata.bodyExtraOptions));
      } else {
        defaultMiddleware.push(bodyParser.text(actionMetadata.bodyExtraOptions));
      }
    }

    if (actionMetadata.isAuthorizedUsed) {
      defaultMiddleware.push((request, response, next) => {
        const action: Action = { request, response, next, dataSource: this.dataSource };
        try {
          if (!this.authorizationChecker) throw new AuthorizationCheckerNotDefinedError();
          const checkResult = this.authorizationChecker(action, actionMetadata.authorizedRoles);
          const handleError = (result: any) => {
            if (!result) {
              const error =
                actionMetadata.authorizedRoles.length === 0
                  ? new AuthorizationRequiredError(action)
                  : new AccessDeniedError(action);
              this.handleError(error, actionMetadata, action);
            } else {
              next();
            }
          };
          if (isPromiseLike(checkResult)) {
            checkResult
              .then((result) => handleError(result))
              .catch((error) => this.handleError(error, actionMetadata, action));
          } else {
            handleError(checkResult);
          }
        } catch (error) {
          this.handleError(error, actionMetadata, action);
        }
      });
    }
    if (actionMetadata.isFileUsed || actionMetadata.isFilesUsed) {
      actionMetadata.params
        .filter((param) => param.type === 'file')
        .forEach((param) => {
          defaultMiddleware.push(multerFn(param.extraOptions).single(param.name));
        });
      actionMetadata.params
        .filter((param) => param.type === 'files')
        .forEach((param) => {
          defaultMiddleware.push(multerFn(param.extraOptions).array(param.name));
        });
    }

    // user used middlewares
    const uses = [...actionMetadata.controllerMetadata.uses, ...actionMetadata.uses];
    const beforeMiddlewares = this.prepareMiddlewares(uses.filter((use) => !use.afterAction));
    const afterMiddlewares = this.prepareMiddlewares(uses.filter((use) => use.afterAction));
    // prepare route and route handler function
    const route = ActionMetadata.appendBaseRoute(this.routePrefix, actionMetadata.fullRoute);
    const routeHandler = (request: Request, response: Response, next: NextFunction) => {
      return executeCallback({ request, response, next, dataSource: this.dataSource });
    };

    // This ensures that a request is only processed once to prevent unhandled rejections saying
    // "Can't set headers after they are sent"
    // Some examples of reasons a request may cause multiple route calls:
    // * Express calls the "get" route automatically when we call the "head" route:
    //   Reference: https://expressjs.com/en/4x/api.html#router.METHOD
    //   This causes a double execution on our side.
    // * Multiple routes match the request (e.g. GET /users/me matches both @All(/users/me) and @Get(/users/:id)).
    // The following middleware only starts an action processing if the request has not been processed before.
    const routeGuard = function routeGuard(request: any, response: any, next: Function) {
      if (!request.routingControllersStarted) {
        request.routingControllersStarted = true;
        return next();
      }
    };

    this.app[actionMetadata.type.toLowerCase() as keyof Express](
      ...[route, routeGuard, ...beforeMiddlewares, ...defaultMiddleware, routeHandler, ...afterMiddlewares],
    );
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
    if (result === undefined && action.undefinedResultCode) {
      if (action.undefinedResultCode instanceof Function) {
        throw new (action.undefinedResultCode as any)(options);
      }
      options.response.status(action.undefinedResultCode);
    } else if (result === null) {
      if (action.nullResultCode) {
        if (action.nullResultCode instanceof Function) {
          throw new (action.nullResultCode as any)(options);
        }
        options.response.status(action.nullResultCode);
      } else {
        options.response.status(204);
      }
    } else if (action.successHttpCode) {
      options.response.status(action.successHttpCode);
    }

    // apply http headers
    Object.keys(action.headers).forEach((name) => {
      options.response.header(name, action.headers[name]);
    });

    if (action.redirect) {
      // if redirect is set then do it
      if (typeof result === 'string') {
        options.response.redirect(result);
      } else if (result instanceof Object) {
        options.response.redirect(pathTemplater(action.redirect, result));
      } else {
        options.response.redirect(action.redirect);
      }
      options.next();
    } else if (action.renderedTemplate) {
      // if template is set then render it
      const renderOptions = result && result instanceof Object ? result : {};

      options.response.render(action.renderedTemplate, renderOptions, (err: any, html: string) => {
        if (err && action.isJsonTyped) {
          return options.next(err);
        } else if (err && !action.isJsonTyped) {
          return options.next(err);
        } else if (html) {
          options.response.send(html);
        }
        options.next();
      });
    } else if (result === undefined) {
      // throw NotFoundError on undefined response
      if (action.undefinedResultCode) {
        if (action.isJsonTyped) {
          options.response.json();
        } else {
          options.response.send();
        }
        options.next();
      } else {
        throw new NotFoundError();
      }
    } else if (result === null) {
      // send null response
      if (action.isJsonTyped) {
        options.response.json(null);
      } else {
        options.response.send(null);
      }
      options.next();
    } else if (result instanceof Buffer) {
      // check if it's binary data (Buffer)
      options.response.end(result, 'binary');
    } else if (result instanceof Uint8Array) {
      // check if it's binary data (typed array)
      options.response.end(Buffer.from(result as any), 'binary');
    } else if (result.pipe instanceof Function) {
      result.pipe(options.response);
    } else {
      if (action.isJsonTyped) {
        options.response.json(result);
      } else {
        options.response.send(result);
      }
      options.next!();
    }
  }
  /**
   * Handles result of failed executed controller action.
   */
  handleError(error: any, action: ActionMetadata | undefined, options: Action): any {
    if (this.options.defaultErrorHandler) {
      const response = options.response;
      // set http code
      // note that we can't use error instanceof HttpError properly anymore because of new typescript emit process
      if (error.httpCode) {
        response.status(error.httpCode);
      } else {
        response.status(500);
      }

      // send error content
      if (action && action.isJsonTyped) {
        response.json(this.processJsonError(error));
      } else {
        response.send(this.processTextError(error)); // todo: no need to do it because express by default does it
      }
    } else {
      options.next!(error);
    }
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

      case 'file':
        return request.file;

      case 'files':
        return request.files;

      case 'cookie':
        if (!request.headers?.cookie) return;
        const cookies = cookieParse(request.headers.cookie);
        return cookies[param.name];

      case 'cookies':
        if (!request.headers?.cookie) return {};
        return cookieParse(request.headers.cookie);
    }
  }
  /**
   * Creates middlewares from the given "use"-s.
   */
  protected prepareMiddlewares(uses: UseMetadata[]) {
    const middlewareFunctions: Function[] = [];
    uses.forEach((use: UseMetadata) => {
      if (use.middleware.prototype && use.middleware.prototype.use) {
        // if this is function instance of MiddlewareInterface
        middlewareFunctions.push((request: Request, response: Response, next: NextFunction) => {
          try {
            const useResult = getFromContainer<ExpressMiddlewareInterface>(use.middleware).use(request, response, next);
            if (isPromiseLike(useResult)) {
              useResult.catch((error: any) => {
                this.handleError(error, undefined, { request, response, next, dataSource: this.dataSource });
                return error;
              });
            }

            return useResult;
          } catch (error) {
            this.handleError(error, undefined, { request, response, next, dataSource: this.dataSource });
          }
        });
      } else if (use.middleware.prototype && use.middleware.prototype.error) {
        // if this is function instance of ErrorMiddlewareInterface
        middlewareFunctions.push(function (error: any, request: Request, response: Response, next: NextFunction) {
          return getFromContainer<ExpressErrorMiddlewareInterface>(use.middleware).error(
            error,
            request,
            response,
            next,
          );
        });
      } else {
        middlewareFunctions.push(use.middleware);
      }
    });
    return middlewareFunctions;
  }
  /**
   * Registers middleware that run before controller actions.
   */
  registerMiddleware(middleware: MiddlewareMetadata, options: TypeNexusOptions): void {
    let middlewareWrapper;

    // if its an error handler then register it with proper signature in express
    if ((middleware.instance as ExpressErrorMiddlewareInterface).error) {
      middlewareWrapper = (error: any, request: any, response: any, next: NextFunction) => {
        (middleware.instance as ExpressErrorMiddlewareInterface).error(error, request, response, next);
      };
    }

    // if its a regular middleware then register it as express middleware
    else if ((middleware.instance as ExpressMiddlewareInterface).use) {
      middlewareWrapper = (request: Request, response: Response, next: NextFunction) => {
        try {
          const useResult = (middleware.instance as ExpressMiddlewareInterface).use(request, response, next);
          if (isPromiseLike(useResult)) {
            useResult.catch((error: any) => {
              this.handleError(error, undefined, { request, response, next, dataSource: this.dataSource });
              return error;
            });
          }
        } catch (error) {
          this.handleError(error, undefined, { request, response, next, dataSource: this.dataSource });
        }
      };
    }
    if (middlewareWrapper) {
      // Name the function for better debugging
      Object.defineProperty(middlewareWrapper, 'name', {
        value: middleware.instance.constructor.name,
        writable: true,
      });
      this.express.use(options.routePrefix || '/', middlewareWrapper);
    }
  }
  protected processJsonError(error: any) {
    if (!this.options.defaultErrorHandler) return error;

    if (typeof error.toJSON === 'function') return error.toJSON();

    let processedError: any = {};
    if (error instanceof Error) {
      const name = error.name && error.name !== 'Error' ? error.name : error.constructor.name;
      processedError.name = name;

      if (error.message) processedError.message = error.message;
      if (error.stack && this.options.developmentMode) processedError.stack = error.stack;

      Object.keys(error)
        .filter(
          (key) =>
            key !== 'stack' &&
            key !== 'name' &&
            key !== 'message' &&
            (!(error instanceof HttpError) || key !== 'httpCode'),
        )
        .forEach((key) => (processedError[key] = (error as any)[key]));

      return Object.keys(processedError).length > 0 ? processedError : undefined;
    }

    return error;
  }

  protected processTextError(error: any) {
    if (!this.options.defaultErrorHandler) return error;

    if (error instanceof Error) {
      if (this.options.developmentMode && error.stack) {
        return error.stack;
      } else if (error.message) {
        return error.message;
      }
    }
    return error;
  }

  protected merge(obj1: any, obj2: any): any {
    const result: any = {};
    for (const i in obj1) {
      if (i in obj2 && typeof obj1[i] === 'object' && i !== null) {
        result[i] = this.merge(obj1[i], obj2[i]);
      } else {
        result[i] = obj1[i];
      }
    }
    for (const i in obj2) {
      result[i] = obj2[i];
    }
    return result;
  }
}
