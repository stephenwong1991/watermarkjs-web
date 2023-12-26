const typescript = require("@rollup/plugin-typescript");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");

module.exports = {
  input: "src/index.ts",
  output: {
    file: "dist/bundle.js",
    format: "umd",
    name: "Watermark",
  },
  plugins: [typescript(), resolve(), commonjs()],
};
