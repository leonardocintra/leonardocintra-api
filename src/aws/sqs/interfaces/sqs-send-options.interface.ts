import type { MessageAttributeValue } from '@aws-sdk/client-sqs';

export interface SqsSendOptions {
  delaySeconds?: number;
  messageAttributes?: Record<string, MessageAttributeValue>;
}
