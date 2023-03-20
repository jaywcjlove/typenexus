import { ControllerMetadata } from '../metadata/ControllerMetadata.js';
import { MiddlewareMetadata } from '../metadata/MiddlewareMetadata.js';
import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';
import { ActionMetadata } from '../metadata/ActionMetadata.js';
import { ActionMetadataArgs } from '../metadata/args/ActionMetadataArgs.js';
import { ResponseHandlerMetadata } from '../metadata/ResponseHandleMetadata.js';
import { ParamMetadata } from '../metadata/ParamMetadata.js';
import { UseMetadata } from '../metadata/UseMetadata.js';

/**
 * Builds metadata from the given metadata arguments.
 */
export class MetadataBuilder {
  constructor() {}
  /**
   * Builds controller metadata from a registered controller metadata args.
   */
  buildControllerMetadata(classes?: Function[]): ControllerMetadata[] {
    return this.createControllers(classes);
  }
  /**
   * Builds middleware metadata from a registered middleware metadata args.
   */
  buildMiddlewareMetadata(classes?: Function[]): MiddlewareMetadata[] {
    return this.createMiddlewares(classes);
  }
  /**
   * Creates middleware metadatas.
   */
  protected createMiddlewares(classes?: Function[]): MiddlewareMetadata[] {
    const middlewares = !classes
      ? getMetadataArgsStorage().middlewares
      : getMetadataArgsStorage().filterMiddlewareMetadatasForClasses(classes);
    return middlewares.map(middlewareArgs => new MiddlewareMetadata(middlewareArgs));
  }

  /**
   * Creates controller metadatas.
   */
  protected createControllers(classes?: Function[]): ControllerMetadata[] {
    const controllers = !classes
      ? getMetadataArgsStorage().controllers
      : getMetadataArgsStorage().filterControllerMetadataForClasses(classes);

    return controllers.map(controllerArgs => {
      const controller = new ControllerMetadata(controllerArgs);
      controller.build(this.createControllerResponseHandlers(controller));
      controller.actions = this.createActions(controller);
      controller.uses = this.createControllerUses(controller);
      return controller;
    });
  }
  /**
   * Creates action metadata.
   */
  protected createActions(controller: ControllerMetadata): ActionMetadata[] {
    let target = controller.target;
    const actionsWithTarget: ActionMetadataArgs[] = [];
    while (target) {
      const actions = getMetadataArgsStorage()
        .filterActionsWithTarget(target)
        .filter(action => {
          return actionsWithTarget.map(a => a.method).indexOf(action.method) === -1;
        });

      actions.forEach(a => {
        a.target = controller.target;
        actionsWithTarget.push(a);
      });

      target = Object.getPrototypeOf(target);
    }

    return actionsWithTarget.map(actionArgs => {
      const action = new ActionMetadata(controller, actionArgs);
      action.params = this.createParams(action);
      action.uses = this.createActionUses(action);
      action.build(this.createActionResponseHandlers(action));
      return action;
    });
  }

  /**
   * Creates param metadatas.
   */
  protected createParams(action: ActionMetadata): ParamMetadata[] {
    const dta =  getMetadataArgsStorage()
      .filterParamsWithTargetAndMethod(action.target, action.method)
      .map(paramArgs => {
        return new ParamMetadata(action, paramArgs)
      });
      return dta
  }

  /**
   * Creates response handler metadatas for action.
   */
  protected createActionResponseHandlers(action: ActionMetadata): ResponseHandlerMetadata[] {
    return getMetadataArgsStorage()
      .filterResponseHandlersWithTargetAndMethod(action.target, action.method)
      .map(handlerArgs => {
        return new ResponseHandlerMetadata(handlerArgs)
      });
  }

  /**
   * Creates use metadatas for actions.
   */
  protected createActionUses(action: ActionMetadata): UseMetadata[] {
    return getMetadataArgsStorage()
      .filterUsesWithTargetAndMethod(action.target, action.method)
      .map(useArgs => new UseMetadata(useArgs));
  }

  /**
   * Creates response handler metadatas for controller.
   */
  protected createControllerResponseHandlers(controller: ControllerMetadata): ResponseHandlerMetadata[] {
    return getMetadataArgsStorage()
      .filterResponseHandlersWithTarget(controller.target)
      .map(handlerArgs => new ResponseHandlerMetadata(handlerArgs));
  }

  /**
   * Creates use metadatas for controllers.
   */
  protected createControllerUses(controller: ControllerMetadata): UseMetadata[] {
    return getMetadataArgsStorage()
      .filterUsesWithTargetAndMethod(controller.target, undefined)
      .map(useArgs => new UseMetadata(useArgs));
  }
}