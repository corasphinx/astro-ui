const path = require('path');
const svgSprite = require('./plugins/next-svg-sprites');
const cssLoaderConfig = require('./plugins/css-loader-config');
const { i18n } = require('./next-i18next.config');

module.exports = (phase, { defaultConfig }) => {
  const plugins = [svgSprite, cssLoaderConfig];

  const transformers = [];

  const nextConfig = plugins.reduce(
    (acc, next) => {
      const nextConfig = next(acc);
      if (typeof nextConfig.webpack === 'function') {
        transformers.push(nextConfig.webpack);
      }

      return nextConfig;
    },
    {
      ...defaultConfig,
      swcMinify: true,
      reactStrictMode: true,
      images: {
        domains: [
          'i.imgur.com',
          'sputnik-dao.s3.eu-central-1.amazonaws.com',
          'ipfs.io',
          'ipfs.fleek.co',
          'cloudflare-ipfs.com',
        ],
      },
      sassOptions: {
        includePaths: [path.join(__dirname, 'styles')],
      },
      async rewrites() {
        return [
          {
            source: '/create-dao',
            destination: '/create-dao/foundation',
          },
        ];
      },
      /* experimental: {
        outputStandalone: true,
      },*/
      i18n,
      publicRuntimeConfig: {
        shouldUseExternalAssetUrl: process.env.NODE_ENV === 'production',
        assetUrl: '/_next/static/sprite.svg',
      },
      api: {
        responseLimit: false,
      },
      typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
      },
      eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
      },
    }
  );

  nextConfig.webpack = (config, options) => {
    config.externals = [...config.externals, 'bufferutil', 'utf-8-validate'];

    config.resolve.fallback = {
      fs: false,
      tls: false,
      net: false,
      https: false,
      http: false,
      crypto: false,
      os: false,
    };

    return transformers.reduce((acc, next) => next(acc, options), config);
  };

  return nextConfig;
};
