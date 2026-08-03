export interface SqsReceiveOptions {
  maxNumberOfMessages?: number;
  waitTimeSeconds?: number;
  messageAttributeNames?: string[];
}
