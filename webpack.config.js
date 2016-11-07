const fs = require('fs')
const Path = require('path')

const entries = ['./lib/page.js']
const dirs = fs.readdirSync(Path.join(__dirname, 'lib', 'components'), {})
dirs.forEach((dir) => {
  const path = `./lib/components/${dir}/speech.js`
  if (fs.existsSync(path)) {
    entries.unshift(path)
  }
})
console.log('Webpacking these files: ', entries)

module.exports = {
  entry: entries,
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
