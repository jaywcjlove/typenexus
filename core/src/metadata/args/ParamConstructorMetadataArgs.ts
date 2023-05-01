import { ConstructorType } from '../types/ConstructorType.js';

/**
 * Controller metadata used to storage information about registered parameters.
 */
export interface ParamConstructorMetadataArgs {
  /**
   * Parameter object.
   */
  object: any;

  /**
   * Method on which's constructor parameter is attached.
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
  name?: string;

  /**
   * Indicates if this parameter is required or not
   */
  required?: boolean;
}
