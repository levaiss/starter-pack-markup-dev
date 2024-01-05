'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');

const rollup = require('@rollup/stream');
const babel = require('@rollup/plugin-babel');
const nodeResolve = require('@rollup/plugin-node-resolve');
const source = require('vinyl-source-stream');

gulp.task('styles', function () {
  return gulp.src('./src/styles/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('main.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./public/css'))
      .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  return rollup({
    input: './src/scripts/index.js',
    plugins: [babel(), nodeResolve()],
    output: {
      format: 'iife',
      sourcemap: true
    }
  })
      .pipe(source('main.js'))
      .pipe(gulp.dest('./public/js'));
})

gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: './public',
    }
  });

  gulp.watch('./src/styles/**/*.scss', gulp.parallel('styles'));
  gulp.watch('./src/scripts/**/*.js').on('change', gulp.series('scripts', browserSync.reload));
  gulp.watch('./public/*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('styles', 'scripts'));
