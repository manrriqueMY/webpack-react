const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const fs = require("fs");
const dotenv = require("dotenv");

module.exports = (env, args) => {
  let mode = args.mode || "development";
  const currentPath = path.join(__dirname);
  const basePath = `${currentPath}/.env`;
  const envPath = `${basePath}.${mode}`;
  const finalPath = fs.existsSync(envPath) ? envPath : basePath;
  const fileEnv = dotenv.config({ path: finalPath }).parsed;
  const envKeys = Object.keys(fileEnv).reduce((prev, next) => {
    prev[`process.env.${next}`] = JSON.stringify(fileEnv[next]);
    return prev;
  }, {});

  const config = {
    entry: path.join(__dirname, "src", "index.js"),
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "[name].covende.js",
      chunkFilename: "[name].chunk.js",
      publicPath: "/",
    },
    module: {
      rules: [
        {
          test: /\.svg$/,
          use: ["@svgr/webpack"],
        },
        {
          test: /\.(png|jp(e*)g|svg|gif)$/,
          use: ["file-loader"],
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader"],
        },
        {
          test: /\.?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
            },
          },
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, "src", "index.html"),
      }),
    ],
    optimization: {
      usedExports: true,
      runtimeChunk: "single",
      splitChunks: {
        chunks: "all",
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1];
              return `npm.${packageName.replace("@", "")}`;
            },
          },
        },
      },
    },
  };

  if (mode == "development") {
    config.devServer = {
      compress: true,
      historyApiFallback: true,
      hot: true,
      port: 9000,
    };
  }
  if (mode == "production") {
    //config.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
  }

  return config;
};
