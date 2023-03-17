import { DataSource, DataSourceOptions, EntityTarget } from 'typeorm';
import session from 'express-session';
import { Driver } from './Driver.js';

import { ISession } from 'connect-typeorm';
import { SessionOptions } from "express-session";
import { TypeormStore, Ttl } from 'connect-typeorm';
export interface TypeNexusOptions {
  /**
   * Global route prefix, for example '/api'.
   */
  routePrefix?: string;
  port?: number;
  dataSourceOptions?: DataSourceOptions;
  session?: SessionResult | SessionCallback;
}

export interface SessionResult extends session.SessionOptions {}
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