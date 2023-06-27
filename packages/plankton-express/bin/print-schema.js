#!/usr/bin/env node
process.env.LOGGING_LEVEL = 'error';
require('reflect-metadata');
const express = require('express');
const { printSchema } = require('graphql');
const utils = require('../dist/src/utils');

const app = express();

(async () => {
  const routes = await utils.tryApplicationModule('routes', () => {});
  await routes({
    app,
    access: () => undefined,
    graphql: async (schema) => {
      // eslint-disable-next-line no-console
      console.log(printSchema(schema));
    },
  });
})();
