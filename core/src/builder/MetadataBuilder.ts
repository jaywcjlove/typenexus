import { ControllerMetadata } from '../metadata/ControllerMetadata.js';
import { MiddlewareMetadata } from '../metadata/MiddlewareMetadata.js';
import { getMetadataArgsStorage } from '../metadata/MetadataArgsStorage.js';
import { ActionMetadata } from '../metadata/ActionMetadata.js';
import { ResponseHandlerMetadata } from '../metadata/ResponseHandleMetadata.js';
import { ParamMetadata } from '../metadata/ParamMetadata.js';
import { ParamConstructorMetadata } from '../metadata/ParamConstructorMetadata.js';
import { UseMetadata } from '../metadata/UseMetadata.js';
import { TypeNexusOptions } from '../DriverOptions.js';

/**
 * Builds metadata from the given metadata arguments.
 */
export class MetadataBuilder {
  constructor(private options: TypeNexusOptions) {}
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
    const actionsWithTarget: ActionMetadata[] = [];
    for (let target = controller.target; target; target = Object.getPrototypeOf(target)) {
      const actions = getMetadataArgsStorage().filterActionsWithTarget(target);
      const methods = actionsWithTarget.map(a => a.method);
      actions
        .filter(({ method }) => !methods.includes(method))
        .forEach(actionArgs => {
          const action = new ActionMetadata(controller, { ...actionArgs, target: controller.target }, this.options);
          action.params = this.createParams(action);
          action.paramsConstructor = this.createParamsConstructor(action);
          action.uses = this.createActionUses(action);
          action.build(this.createActionResponseHandlers(action));
          actionsWithTarget.push(action);
        });
    }
    return actionsWithTarget;
  }

  /**
   * Creates constructor param metadatas.
   */
  protected createParamsConstructor(action: ActionMetadata): ParamConstructorMetadata[] {
    return getMetadataArgsStorage()
      .filterParamsConstructorWithTargetAndMethod('constructor')
      .map(paramArgs => new ParamConstructorMetadata(action, paramArgs));
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