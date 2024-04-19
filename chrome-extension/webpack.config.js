const webpack = require('webpack');  
const path = require('path');

module.exports = {
  entry: './src/index.js', // Your main JavaScript file
  output: {
    path: path.resolve(__dirname, 'dist'), // Output directory
    filename: 'bundle.js' // Output file
  },
  experiments: {
    asyncWebAssembly: true, // Enable WebAssembly as an async module
    syncWebAssembly: true   // Enable synchronous WebAssembly (choose based on use case)
},
  plugins: [
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'], // Provide Buffer globally for modules that require it
    })
  ],
  resolve: {
    fallback: {
        "util": require.resolve("util"),
        "stream": require.resolve("stream-browserify"),
        "path": require.resolve("path-browserify"),
        "fs": false  // Assuming you don't need filesystem access in the browser
      }
  },
  module: {
    rules: [
        {
            test: /\.wasm$/,
            loader: 'base64-loader', 
            type: 'javascript/auto', // or 'webassembly/async', depending on your usage
           } ,
      {
        test: /\.js$/, // Apply this rule to all JavaScript files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Use babel-loader to transpile JavaScript
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }, 
    ]
  },
  devtool: 'source-map',
  mode: 'development' // Use 'production' for production builds
};
