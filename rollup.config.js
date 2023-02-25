const { defineConfig } = require("rollup");
const tsc = require("@rollup/plugin-typescript");
const commonjs = require("@rollup/plugin-commonjs");
const terser = require("@rollup/plugin-terser");

const input = "./src/query.ts";

exports.default = [
    defineConfig({
        context: "./",
        input,
        output: [
            {
                file: `./lib/esm/query.js`,
                format: "esm",
                compact: true,
                sourcemap: true,
            },
            {
                file: `./lib/esm/query.min.js`,
                format: "esm",
                compact: true,
                sourcemap: true,
                plugins: [terser()],
            },
        ],
        plugins: [tsc({ tsconfig: "./configs/tsconfig.esm.json" })],
    }),
    defineConfig({
        input,
        output: [
            {
                file: `./lib/cjs/query.js`,
                compact: true,
                format: "cjs",
            },
            {
                file: `./lib/cjs/query.min.js`,
                format: "cjs",
                compact: true,
                plugins: [terser()],
            },
        ],
        plugins: [
            tsc({ tsconfig: "./configs/tsconfig.cjs.json" }),
            commonjs({ extensions: [".js", ".ts"] }),
        ],
    }),
    defineConfig({
        input,
        output: [
            {
                file: `./lib/umd/query.js`,
                format: "umd",
                name: "Query",
                compact: true,
                sourcemap: true,
            },
            {
                file: `./lib/umd/query.min.js`,
                format: "umd",
                name: "Query",
                compact: true,
                sourcemap: true,
                plugins: [terser()],
            },
        ],
        plugins: [tsc({ tsconfig: "./configs/tsconfig.umd.json" })],
    }),
];
