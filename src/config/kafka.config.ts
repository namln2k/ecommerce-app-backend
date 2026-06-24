import { registerAs } from '@nestjs/config';

const DEFAULT_KAFKA_BROKERS = ['kafka:29092'];
const DEFAULT_KAFKA_CLIENT_ID = 'ecommerce-app-backend';

function normalizeBrokers(rawValue: string | undefined): string[] {
  if (!rawValue) {
    return DEFAULT_KAFKA_BROKERS;
  }

  return rawValue
    .split(',')
    .map((broker) => broker.trim())
    .filter(Boolean);
}

export default registerAs('kafka', () => ({
  brokers: normalizeBrokers(process.env.KAFKA_BROKERS),
  clientId: process.env.KAFKA_CLIENT_ID || DEFAULT_KAFKA_CLIENT_ID,
}));

