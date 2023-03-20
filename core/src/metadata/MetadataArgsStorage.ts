import { ControllerMetadataArgs } from './args/ControllerMetadataArgs.js';
import { ActionMetadataArgs } from './args/ActionMetadataArgs.js';
import { MiddlewareMetadataArgs } from './args/MiddlewareMetadataArgs.js';
import { ResponseHandlerMetadataArgs } from './args/ResponseHandleMetadataArgs.js';
import { ParamMetadataArgs } from './args/ParamMetadataArgs.js';
import { UseMetadataArgs } from './args/UseMetadataArgs.js';

/**
 * Gets metadata args storage.
 * Metadata args storage follows the best practices and stores metadata in a global variable.
 */
export function getMetadataArgsStorage(): MetadataArgsStorage {
  if (!(global as any).metadataArgsStorage)
    (global as any).metadataArgsStorage = new MetadataArgsStorage();

  return (global as any).metadataArgsStorage;
}

export class MetadataArgsStorage {
  /**
   * Registered controller metadata args.
   */
  controllers: ControllerMetadataArgs[] = [];
  /**
   * Registered middleware metadata args.
   */
  middlewares: MiddlewareMetadataArgs[] = [];
  /**
   * Registered action metadata args.
   */
  actions: ActionMetadataArgs[] = [];
  /**
   * Registered param metadata args.
   */
  params: ParamMetadataArgs[] = [];
  /**
   * Registered response handler metadata args.
   */
  responseHandlers: ResponseHandlerMetadataArgs[] = [];

  /**
   * Registered "use middleware" metadata args.
   */
  uses: UseMetadataArgs[] = [];
  /**
   * Filters registered controllers by a given classes.
   */
  filterControllerMetadataForClasses(classes: Function[]): ControllerMetadataArgs[] {
    return this.controllers.filter(ctrl => {
      return classes.filter(cls => ctrl.target === cls).length > 0;
    });
  }
  /**
   * Filters registered actions by a given classes.
   */
  filterActionsWithTarget(target: Function): ActionMetadataArgs[] {
    return this.actions.filter(action => {
      return action.target === target
    });
  }
  /**
   * Filters response handlers by a given classes.
   */
  filterResponseHandlersWithTargetAndMethod(target: Function, methodName: string): ResponseHandlerMetadataArgs[] {
    return this.responseHandlers.filter(property => {
      return property.target === target && property.method === methodName;
    });
  }

  /**
   * Filters parameters by a given classes.
   */
  filterParamsWithTargetAndMethod(target: Function, methodName: string): ParamMetadataArgs[] {
    return this.params.filter(param => {
      return param.object.constructor === target && param.method === methodName;
    });
  }
  /**
   * Filters response handlers by a given class.
   */
  filterResponseHandlersWithTarget(target: Function): ResponseHandlerMetadataArgs[] {
    return this.responseHandlers.filter(property => {
      return property.target === target;
    });
  }

  /**
   * Filters registered "use middlewares" by a given target class and method name.
   */
  filterUsesWithTargetAndMethod(target: Function, methodName: string): UseMetadataArgs[] {
    return this.uses.filter(use => {
      return use.target === target && use.method === methodName;
    });
  }
  /**
   * Filters registered middlewares by a given classes.
   */
  filterMiddlewareMetadatasForClasses(classes: Function[]): MiddlewareMetadataArgs[] {
    return classes.map(cls => this.middlewares.find(mid => mid.target === cls)).filter(midd => midd !== undefined); // this might be not needed if all classes where decorated with `@Middleware`
  }

}