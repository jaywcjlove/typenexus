import { Request, Response, NextFunction } from 'express';
import { DataSource } from 'typeorm';

/**
 * Controller action properties.
 */
export interface Action {
  /**
   * Action Request object.
   */
  request: Request;

  /**
   * Action Response object.
   */
  response: Response;

  /**
   * "Next" function used to call next middleware.
   */
  next?: NextFunction;

  /**
   * DataSource is a pre-defined connection configuration to a specific database.
   */
  dataSource: DataSource;
}
