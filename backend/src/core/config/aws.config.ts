import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';
import { SQSClient } from '@aws-sdk/client-sqs';
import { SNSClient } from '@aws-sdk/client-sns';

const awsConfig = {
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
};

export const s3Client = new S3Client(awsConfig);
export const sesClient = new SESClient(awsConfig);
export const sqsClient = new SQSClient(awsConfig);
export const snsClient = new SNSClient(awsConfig);

export const S3_BUCKETS = {
  AVATARS: process.env.S3_BUCKET_AVATARS || 'travel-avatars',
  PLACES: process.env.S3_BUCKET_PLACES || 'travel-places',
  REVIEWS: process.env.S3_BUCKET_REVIEWS || 'travel-reviews',
  DOCUMENTS: process.env.S3_BUCKET_DOCUMENTS || 'travel-documents',
};

export const SQS_QUEUES = {
  RATING_CALCULATION: process.env.SQS_RATING_QUEUE_URL || '',
  EMAIL_QUEUE: process.env.SQS_EMAIL_QUEUE_URL || '',
};

export const SNS_TOPICS = {
  ADMIN_NOTIFICATIONS: process.env.SNS_ADMIN_TOPIC_ARN || '',
  BUSINESS_NOTIFICATIONS: process.env.SNS_BUSINESS_TOPIC_ARN || '',
};
