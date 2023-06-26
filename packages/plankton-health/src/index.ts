import Bluebird from 'bluebird';

const healthIndicators: Record<string, HealthIndicator> = {};

export { HealthCheckError } from '@godaddy/terminus';

export type HealthIndicator = () => Promise<unknown>;

export const registerHealthIndicator = (name: string, indicator: HealthIndicator) => {
  healthIndicators[name] = indicator;
};
export const unregisterHealthIndicator = (name: string) => {
  delete healthIndicators[name];
};

export const checkHealth = (): Promise<Record<string, never>> =>
  Bluebird.reduce(
    Object.entries<HealthIndicator>(healthIndicators),
    async (results, [name, healthIndicator]) => ({
      ...results,
      [name]: await healthIndicator().catch(),
    }),
    {} as Record<string, unknown>,
  );
