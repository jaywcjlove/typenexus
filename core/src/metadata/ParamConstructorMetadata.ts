
import { ActionMetadata } from './ActionMetadata.js';
import { ParamConstructorMetadataArgs } from './args/ParamConstructorMetadataArgs.js';
import { ConstructorType } from './types/ConstructorType.js';
/**
 * Action Parameter metadata.
 */
export class ParamConstructorMetadata {
  /**
   * Parameter's action.
   */
  actionMetadata: ActionMetadata;
  /**
   * Object on which's method's parameter this parameter is attached.
   */
  object: any;

  /**
   * Method on which's parameter is attached.
   */
  method: string;

  /**
   * Index (# number) of the parameter in the method signature.
   */
  index: number;

  /**
   * Parameter type.
   */
  type: ConstructorType;

  /**
   * Parameter name.
   */
  name: string;

  /**
   * Parameter target.
   */
  target: any;

  /**
   * Indicates if this parameter is required or not
   */
  required: boolean;

  constructor(actionMetadata: ActionMetadata, args: ParamConstructorMetadataArgs) {
    this.actionMetadata = actionMetadata;

    this.target = args.object.constructor;
    this.method = args.method || 'constructor';
    this.object = args.object;
    this.index = args.index;
    this.type = args.type;
    this.required = args.required;
    this.name = args.name || '';

  }
}