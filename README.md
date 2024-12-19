# 

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/assets/images/logo.svg">
    <img alt="Rockite - Modern WebSockets Client" src="/assets/images/logo.svg" width="256px">
  </picture>
</div>

###

<div align="center">

[![npm version](https://img.shields.io/npm/v/vite-plugin-secure-now.svg?style=flat-square)](https://www.npmjs.com/package/vite-plugin-secure-now)
[![license](https://img.shields.io/npm/l/vite-plugin-secure-now.svg?style=flat-square)](https://github.com/psyirius/vite-plugin-secure-now/blob/main/LICENSE)

</div>

<h1 align="center">Vite Plugin Secure Now 🎉</h1>

A Vite plugin to get instant HTTPS for your development server.

## Screenshots

![Vite Console](/assets/images/screenshot-0.png)

## Features

- **Instant HTTPS**: Automatically sets up HTTPS for your Vite dev server.
- **Easy Integration**: Simple configuration and seamless integration with Vite.

## Installation

### NPM

```sh
npm install vite-plugin-secure-now --save-dev
```

### Yarn

```sh
yarn add vite-plugin-secure-now --dev
```

### PNPM

```sh
pnpm add vite-plugin-secure-now --save-dev
```

## Usage

```js
// vite.config.js | vite.config.ts
import { defineConfig } from 'vite';
import secureNow from 'vite-plugin-secure-now';

export default defineConfig({
  plugins: [
    secureNow(),
  ],
});
```

## Options

```ts
interface Options {
  /**
   * Whether to enable HTTPS for the dev server.
   * @default true
   */
  dev?: boolean;
  /**
   * Whether to enable HTTPS for the preview server.
   * @default true
   */
  preview?: boolean;
  /**
   * The subdomain prefix for the HTTPS URL.
   * Note: The subdomain should not be nested.
   * @default 'vite'
   */
  prefix?: string;
}
```

## Issues

If you encounter any issues, please [open an issue](https://github.com/psyirius/vite-plugin-secure-now/issues) on GitHub.

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Authors

- [@psyirius](https://www.github.com/psyirius)
