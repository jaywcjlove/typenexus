/**
 * Response handler type.
 */
export type ResponseHandlerType =
  | 'success-code'
  | 'content-type'
  | 'header'
  | 'rendered-template'
  | 'redirect'
  | 'location'
  | 'on-null'
  | 'on-undefined'
  | 'authorized';
