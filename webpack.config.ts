import type { Configuration } from 'webpack';
import path from 'path';

const config: Configuration = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, 'src', 'server.ts'),
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  module: {
    rules: [{ test: /\.ts/, loader: 'ts-loader', exclude: /node_modules/ }],
  },
  resolve: { extensions: ['.ts', '.js'] },
};

export default config;
