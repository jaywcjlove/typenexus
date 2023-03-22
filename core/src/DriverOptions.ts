import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';
import { OptionsUrlencoded, OptionsJson, OptionsText, Options } from 'body-parser';
import { CompressionOptions } from 'compression';
import { Request, Response, NextFunction } from 'express';
import { ISession } from 'connect-typeorm';
import { SessionOptions } from "express-session";
import session from 'express-session';
import { TypeormStore, Ttl } from 'connect-typeorm';
import { Driver } from './Driver.js';
import { Action } from './Action.js';

export interface TypeNexusOptions {
  port?: number;
  /** Global route prefix, for example '/api'. */
  routePrefix?: string;
  /** DataSourceOptions is an interface with settings and options for specific DataSource. */
  dataSourceOptions?: DataSourceOptions;
  /** Create a session middleware */
  session?: SessionResult | SessionCallback;
  /**
   * Indicates if default TypeNexus's error handler is enabled or not.
   * Enabled by default.
   */
  defaultErrorHandler?: boolean;
  /**
   * Indicates if TypeNexus should operate in development mode.
   */
  developmentMode?: boolean;
  /** Node.js body parsing middleware. */
  bodyParser?: {
    /**
     * Returns middleware that parses all bodies as a string and only looks at requests where the Content-Type header matches the type option.
     */
    text?: OptionsText;
    /**
     * Returns middleware that parses all bodies as a Buffer and only looks at requests where the Content-Type header matches the type option.
     */
    raw?: Options;
    /**
     * Returns middleware that only parses json and only looks at requests where the Content-Type header matches the type option.
     */
    json?: false | OptionsJson;
    /**
     * Returns middleware that only parses urlencoded bodies and only looks at requests where the Content-Type header matches the type option
     * Used for parsing request bodies in application/x-www-form-urlencoded format.
     * @default `{extended:false}`
     */
    urlencoded?: false | OptionsUrlencoded;
  };
  /** Node.js compression middleware. The following compression codings are supported: deflate | gzip */
  compression?: false | CompressionOptions;
  /**
   * Default settings
   */
  defaults?: {
    /**
     * If set, all null responses will return specified status code by default
     */
    nullResultCode?: number;

    /**
     * If set, all undefined responses will return specified status code by default
     */
    undefinedResultCode?: number;
  };
  /**
   * Special function used to check user authorization roles per request.
   * Must return true or promise with boolean true resolved for authorization to succeed.
   */
  authorizationChecker?: (action: Action, roles: any[]) => Promise<boolean> | boolean;
  /**
   * Special function used to get currently authorized user.
   */
  currentUserChecker?: (action: Action) => Promise<any> | any;
}

export interface SessionResult extends session.SessionOptions {
  repositoryTarget?: EntityTarget<ISession>;
  typeormStore?: Partial<SessionOptions & {
    cleanupLimit: number;
    limitSubquery: boolean;
    onError: (s: TypeormStore, e: Error) => void;
    ttl: Ttl;
  }>;
}

export type SessionCallback = (params: { app: Driver; dataSource: DataSource }) => SessionResult;


/**
 * Express error middlewares can implement this interface.
 */
export interface ExpressErrorMiddlewareInterface {
  /**
   * Called before response.send is being called. The data passed to method is the data passed to .send method.
   * Note that you must return same (or changed) data and it will be passed to .send method.
   */
  error(error: any, request: Request, response: Response, next: NextFunction): void;
}
/**
 * Used to register middlewares.
 * This signature is used for express middlewares.
 */
export interface ExpressMiddlewareInterface {
  /**
   * Called before controller action is being executed.
   * This signature is used for Express Middlewares.
   */
  use(request: Request, response: Response, next: NextFunction): any;
}
