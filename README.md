# Emitting

[![Build Status](https://travis-ci.com/sergeysova/emitting.svg?branch=master)](https://travis-ci.com/sergeysova/emitting)
[![Codecov](https://img.shields.io/codecov/c/github/sergeysova/emitting)](https://codecov.io/gh/sergeysova/emitting)
[![Codacy](https://api.codacy.com/project/badge/Grade/3c6e3befee084c1d8e6ed87ef7b17327)](https://app.codacy.com/manual/sergeysova/emitting)
[![dependencies Status](https://david-dm.org/sergeysova/emitting/status.svg)](https://david-dm.org/sergeysova/emitting)
[![npm bundle size](https://img.shields.io/bundlephobia/min/emitting)](https://bundlephobia.com/result?p=emitting)

[[Github](https://github.com/sergeysova/emitting) | [NPM](https://npmjs.com/package/emitting)]

Emitting is a simple event emitter designed for **TypeScript** and **Promises**. There are some differences from other emitters:

- **Exactly typing** for event payloads `new EventEmitter<Events>()`
- **Waiting for event** with `.take("event"): Promise<Payload>` and same
- **Do not `throw`** an error when you emit an `error` event and nobody is listening
- **Small size**. 500 bytes with typings. No dependencies. [Size Limit](https://github.com/ai/size-limit) controls the size.

## Table of contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Installation](#installation)
- [Usage](#usage)
  - [JavaScript](#javascript)
  - [TypeScript](#typescript)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

```sh
# NPM
npm instal --save emitting

# Yarn
yarn add emitting
```

## Usage

### JavaScript

After installation the only thing you need to do is require the module:

```js
const { EventEmitter } = require("emitting")

const emitter = new EventEmitter()
```

### TypeScript

After installation you need to import module and define events:

```ts
import { EventEmitter } from "emitting"

type Events = {
  hello: { name: string }
  bye: void
}

const emitter = new EventEmitter<Events>()
// Now you have typed event emitter 🚀 yay!
```

## License

[MIT](https://github.com/sergeysova/emitting/blob/HEAD/LICENSE)
