module.exports = {
  "plugins": ["babel-plugin-transform-import-meta"],
  "presets": [ ["@babel/preset-env", { modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false }] ]
}
