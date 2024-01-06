'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();

const fileinclude = require('gulp-file-include');

const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const postCss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');

const rollup = require('@rollup/stream');
const babel = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const eslint = require('@rollup/plugin-eslint');
const source = require('vinyl-source-stream');
const terser = require('@rollup/plugin-terser');

gulp.task('styles', function () {
  return gulp.src('./src/styles/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['node_modules'],
    }).on('error', sass.logError))
    .pipe(postCss([
      autoprefixer({grid: 'autoplace'}),
      cssnano({preset: ['default', {discardComments: {removeAll: true}}]})
    ]))
    .pipe(concat('main.css'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./public/css'))
    .pipe(browserSync.stream());
});

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

gulp.task('html', function() {
  return gulp.src('./src/templates/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(gulp.dest('./public'));
});

gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: './public',
    }
  });

  gulp.watch('./src/styles/**/*.scss', gulp.parallel('styles'));
  gulp.watch('./src/scripts/**/*.js').on('change', gulp.series('scripts', browserSync.reload));
  gulp.watch('./src/templates/**/*.html').on('change', gulp.series('html', browserSync.reload));
});

gulp.task('default', gulp.parallel('styles', 'scripts', 'html'));
