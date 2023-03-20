import { Request, Response, NextFunction } from 'express';
import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';

/**
 * Specifies a given middleware to be used for controller or controller action AFTER the action executes.
 * Must be set to controller action or controller class.
 */
export function UseBefore(
  ...middlewares: Array<Function | ((request: Request, response: Response, next: NextFunction) => any)>
): ClassDecorator & PropertyDecorator {
  return function (objectOrFunction: Object | Function, methodName?: string) {
    middlewares.forEach(middleware => {
      getMetadataArgsStorage().uses.push({
        target: methodName ? objectOrFunction.constructor : (objectOrFunction as Function),
        method: methodName,
        middleware: middleware,
        afterAction: false,
      });
    });
  };
}
