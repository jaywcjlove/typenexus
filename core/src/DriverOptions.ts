import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';
import { OptionsUrlencoded, OptionsJson, OptionsText, Options } from 'body-parser';
import { CompressionOptions } from 'compression';
import { ISession } from 'connect-typeorm';
import { SessionOptions } from "express-session";
import session from 'express-session';
import { TypeormStore, Ttl } from 'connect-typeorm';
import { Driver } from './Driver.js';

export interface TypeNexusOptions {
  port?: number;
  /** Global route prefix, for example '/api'. */
  routePrefix?: string;
  /** DataSourceOptions is an interface with settings and options for specific DataSource. */
  dataSourceOptions?: DataSourceOptions;
  /** Create a session middleware */
  session?: SessionResult | SessionCallback;
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
  /**
   * Node.js compression middleware. The following compression codings are supported: deflate | gzip
   */
  compression?: false | CompressionOptions;
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