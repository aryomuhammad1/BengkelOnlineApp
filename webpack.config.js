const path = require("path");

module.exports = {
  mode: "development",
  //   entry: {
  //     index: "./public/src/js/index.js",
  //     firebase_messaging_sw: "./public/firebase-messaging-sw.js",
  //   },
  //   output: {
  //     filename: "[name].bundle.js",
  //     path: path.resolve(__dirname, "public"),
  //   },
  entry: "./public/src/js/index.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.png$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  watch: true,
};
