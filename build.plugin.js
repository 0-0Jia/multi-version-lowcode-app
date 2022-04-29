const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = ({ onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.resolve.plugin('tsconfigpaths').use(TsconfigPathsPlugin, [
      {
        configFile: './tsconfig.json',
      },
    ]);

    config.merge({
      entry: {
        index: require.resolve(`./src/index.tsx`)
      },
      node: {
        fs: 'empty',
      },
    });

    config
        .plugin('index')
        .use(HtmlWebpackPlugin, [
          {
            inject: false,
            minify: false,
            template: require.resolve('./public/index.ejs'),
            filename: `index.html`,
          },
        ]);

    config
      .plugin('preview')
      .use(HtmlWebpackPlugin, [
        {
          inject: false,
          templateParameters: {
          },
          template: require.resolve('./public/preview.html'),
          filename: 'preview.html',
        },
      ]);

    config.plugins.delete('hot');
    config.devServer.hot(false);

    config.module // fixes https://github.com/graphql/graphql-js/issues/1272
      .rule('mjs$')
      .test(/\.mjs$/)
      .include
        .add(/node_modules/)
        .end()
      .type('javascript/auto');
  });
};
