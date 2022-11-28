import { TransformStream } from 'web-streams-polyfill/dist/ponyfill.es2018.mjs';
// @zip.js/zip.js needs TransformStream to be available
global.TransformStream = TransformStream;
