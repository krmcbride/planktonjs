import type { Application, RequestHandler } from 'express';
import type { HealthIndicator } from '@krmcbride/plankton-health';

export type ComponentsCallbackArgs = {
  registerHealthIndicator: (name: string, indicator: HealthIndicator) => void;
};

export type TemplatingCallbackArgs = {
  app: Application;
};

export type ParsersCallbackArgs = {
  app: Application;
};

export type RoutesCallbackArgs = {
  app: Application;
  access: (expression: string) => RequestHandler;
};
