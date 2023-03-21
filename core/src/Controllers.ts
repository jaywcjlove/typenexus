import { MetadataBuilder } from './builder/MetadataBuilder.js';
import { Driver } from './Driver.js';
import { TypeNexusOptions } from './DriverOptions.js';
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { Action } from './Action.js';
import { isPromiseLike } from './utils/isPromiseLike.js';
import { ActionParameterHandler } from './ActionParameterHandler.js';

export class Controllers<T extends Driver> {
  /**
   * Used to build metadata objects for controllers and middlewares.
   */
  private metadataBuilder: MetadataBuilder;
  /**
   * Used to check and handle controller action parameters.
   */
  private parameterHandler: ActionParameterHandler<T>;
  constructor(private driver: T, private options: TypeNexusOptions) {
    this.parameterHandler = new ActionParameterHandler<T>(driver);
    this.metadataBuilder = new MetadataBuilder(this.options);
  }
  registerControllers(classes?: Function[]): this {
    const controllers = this.metadataBuilder.buildControllerMetadata(classes);
    controllers.map((controller) => {
      controller.actions.forEach(actionMetadata => {
        this.driver.registerAction(actionMetadata, (action) => {
          this.executeAction(actionMetadata, action)
        });
      })
    })
    return this;
  }
  /**
   * Registers middleware that run before controller actions.
   */
  registerMiddlewares(type: 'before' | 'after', classes: Function[], option: TypeNexusOptions): this {
    this.metadataBuilder.buildMiddlewareMetadata(classes)
    .filter(middleware => middleware.global && middleware.type === type)
    .sort((middleware1, middleware2) => middleware2.priority - middleware1.priority)
    .forEach(middleware => this.driver.registerMiddleware(middleware, option));
    return this;
  }
  /**
   * Executes given controller action.
   */
  protected executeAction(actionMetadata: ActionMetadata, action: Action) {
    // compute all parameters
    const paramsPromises = actionMetadata.params
      .sort((param1, param2) => param1.index - param2.index)
      .map(param => {
        return this.parameterHandler.handle(action, param)
      });

    return Promise.all(paramsPromises).then((params) => {
      const result = actionMetadata.callMethod(params, action);
      return this.handleCallMethodResult(result, actionMetadata, action);
    })
    .catch(error => {
      return this.driver.handleError(error, actionMetadata, action);
    });
  }

  /**
   * Handles result of the action method execution.
   */
  protected handleCallMethodResult(result: any, action: ActionMetadata, options: Action): any {
    if (isPromiseLike(result)) {
      return result.then((data) => {
        return this.handleCallMethodResult(data, action, options);
      })
      .catch((error) => {
        return this.driver.handleError(error, action, options);
      });
    } else {
      return this.driver.handleSuccess(result, action, options)
    }
  }
}