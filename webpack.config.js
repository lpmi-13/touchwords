var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './build/bundle.js'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true,
    port: 9000
  }
};
