import { ControllerMetadataArgs } from './args/ControllerMetadataArgs.js'
import { ControllerMetadata } from './ControllerMetadata.js'
import { ActionMetadataArgs } from './args/ActionMetadataArgs.js'
import { ResponseHandlerMetadataArgs } from './args/ResponseHandleMetadataArgs.js'
import { ResponseHandlerMetadata } from './ResponseHandleMetadata.js'
import { ParamMetadataArgs } from './args/ParamMetadataArgs.js'

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
    return this.actions.filter(action => action.target === target);
  }
  /**
   * Filters response handlers by a given classes.
   */
  filterResponseHandlersWithTargetAndMethod(target: Function, methodName: string): ResponseHandlerMetadataArgs[] {
    return this.responseHandlers.filter(property => {
      return property.target === target && property.method === methodName;
    });
  }
}