
/**
 * Controller action's parameter type.
 */
export type ParamType =
  | 'body'
  | 'body-param'
  | 'query'
  | 'queries'
  | 'header'
  | 'headers'
  | 'file'
  | 'files'
  | 'param'
  | 'params'
  | 'session'
  | 'session-param'
  | 'state'
  | 'cookie'
  | 'cookies'
  | 'request'
  | 'response'
  | 'context';


/**
 * Controller metadata used to storage information about registered parameters.
 */
export interface ParamMetadataArgs {
  /**
   * Parameter object.
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
  name?: string;
}
