const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ChromeExtensionReloader = require('webpack-chrome-extension-reloader');


const config = (_env, argv) => {
  const mode = argv.mode;

  return {
    entry: {
      content: path.join(__dirname, 'src', 'scripts', 'content.ts'),
      background: path.join(__dirname, 'src', 'scripts', 'background.ts'),
      popup: path.join(__dirname, 'src', 'scripts', 'popup.ts'),
    },
    devtool: mode === 'development' ? 'cheap-module-eval-source-map' : 'inline-source-map',
    output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
          exclude: /node_modules/
        },
        {
          test: /\.html$/,
          loader: 'html-loader',
          exclude: /node_modules/
        },
        {
          test: /\.ts$/,
          use: 'ts-loader',
        },
      ]
    },
    resolve: {
      extensions: ['.ts', '.js'],
    },
    plugins: [
      // clean the dist folder
      new CleanWebpackPlugin(['dist']),
      new CopyWebpackPlugin([{
        from: 'src/manifest.json',
        transform: function (content, _path) {
          // generates the manifest file using the package.json informations
          return Buffer.from(JSON.stringify({
            description: process.env.npm_package_description,
            version: process.env.npm_package_version,
            ...JSON.parse(content.toString())
          }))
        }
      }]),
      new CopyWebpackPlugin([{
        from: 'src/assets',
      }]),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src', 'popup.html'),
        filename: 'popup.html',
        chunks: ['popup']
      }),
      ...(mode === 'development' ? [new ChromeExtensionReloader({
        port: 9090, // Which port use to create the server
        reloadPage: true, // Force the reload of the page also
        entries: { //The entries used for the content/background scripts
          contentScript: ['content', 'popup'], //Use the entry names, not the file name or the path
          background: 'background',
        }
      })] : []),
    ]
  };
};

module.exports = config;
