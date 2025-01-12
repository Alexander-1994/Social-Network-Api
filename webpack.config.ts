import type { Configuration } from 'webpack';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const config: Configuration = {
  mode: 'production',
  target: 'node',
  entry: path.resolve(__dirname, 'src', 'server.ts'),
  output: {
    filename: 'js/bundle.js',
    path: path.resolve(__dirname, 'build'),
    clean: true,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'prisma/schema.prisma'),
          to: path.resolve(__dirname, 'build', 'prisma/schema.prisma'),
        },
      ],
    }),
  ],
  module: {
    rules: [{ test: /\.ts/, loader: 'ts-loader', exclude: /node_modules/ }],
  },
  resolve: { extensions: ['.ts', '.js'] },
};

export default config;
