import express, { Express, RequestHandler } from 'express';
import { MetadataBuilder } from './builder/MetadataBuilder.js'
import { Driver } from './Driver.js'
import { ActionMetadata } from './metadata/ActionMetadata.js';
import { Action } from './Action.js';
import { isPromiseLike } from './utils/isPromiseLike.js';

export class Controllers {
  /**
   * Used to build metadata objects for controllers and middlewares.
   */
  private metadataBuilder: MetadataBuilder;
  constructor(private driver: Driver) {
    this.metadataBuilder = new MetadataBuilder();
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
   * Executes given controller action.
   */
  protected executeAction(actionMetadata: ActionMetadata, action: Action) {
    const result = actionMetadata.callMethod([], action);
    return this.handleCallMethodResult(result, actionMetadata, action);
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