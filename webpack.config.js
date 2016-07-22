const Path = require('path')

module.exports = {
  entry: './lib/page.js',
  output: {
    path: Path.join(__dirname, 'public', 'js'),
    filename: 'page.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015', 'stage-2']
        }
      }
  //    { test: /\.css$/, loader: "style!css" }
    ]
  }
}
