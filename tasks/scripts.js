const gulp = require('gulp');
const rollup = require('@rollup/stream');
const babel = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const eslint = require('@rollup/plugin-eslint');
const source = require('vinyl-source-stream');
const terser = require('@rollup/plugin-terser');

module.exports = function () {
  gulp.task('scripts', function () {
    return rollup({
      input: './src/scripts/index.js',
      plugins: [eslint(), babel(), nodeResolve(), terser()],
      output: {
        format: 'iife',
        sourcemap: true
      }
    })
      .pipe(source('main.js'))
      .pipe(gulp.dest('./public/js'));
  });
}
