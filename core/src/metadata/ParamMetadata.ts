import { ActionMetadata } from './ActionMetadata.js';
import { ParamMetadataArgs } from './args/ParamMetadataArgs.js';
import { ParamType } from './types/ParamType.js';
/**
 * Action Parameter metadata.
 */
export class ParamMetadata {
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
  type: ParamType;

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

  /**
   * Additional parameter options.
   * For example it can be uploader middleware options or body-parser middleware options.
   */
  extraOptions: any;

  constructor(actionMetadata: ActionMetadata, args: ParamMetadataArgs) {
    this.actionMetadata = actionMetadata;

    this.target = args.object.constructor;
    this.method = args.method;
    this.extraOptions = args.extraOptions;
    this.object = args.object;
    this.index = args.index;
    this.type = args.type;
    this.required = args.required;
    this.name = args.name || '';
  }
}
