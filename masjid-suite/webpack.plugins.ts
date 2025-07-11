import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import webpack from 'webpack';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

export const plugins = [
  // Skip type checking when FORGE_TS_SKIP environment variable is truthy (e.g. npm run start:no-types)
  ...(process.env.FORGE_TS_SKIP ? [] : [
    new ForkTsCheckerWebpackPlugin({
      logger: 'webpack-infrastructure',
    }),
  ]),
  new webpack.EnvironmentPlugin({ NODE_ENV: process.env.NODE_ENV ?? 'production' }),
];
