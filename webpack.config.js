const path = require('path');

module.exports = {
  mode: 'development', // or 'production' for production builds
  entry: './src/app.js', // Your main JavaScript file that includes other imports
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js', // Output bundle file
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                useBuiltIns: 'usage',
                corejs: 3, // Specify the core-js version
              }],
            ],
          },
        },
      },
    ],
  },
};
