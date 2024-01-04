'use strict';

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');

gulp.task('styles', function () {
  return gulp.src('./src/assets/styles/**/*.scss')
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(concat('main.css'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./public/css'))
      .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
  return gulp.src('./src/assets/scripts/*.js')
      .pipe(sourcemaps.init())
      .pipe(concat('main.js'))
      .pipe(uglify())
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./public/js'));
})

gulp.task('watch', function(){
  browserSync.init({
    server: {
      baseDir: './public',
    }
  });

  gulp.watch('./src/assets/styles/**/*.scss', gulp.parallel('styles'));
  gulp.watch('./src/assets/scripts/**/*.js', gulp.parallel('scripts', browserSync.reload));
  gulp.watch('./public/*.html').on('change', browserSync.reload);
});

gulp.task('default', gulp.parallel('styles', 'scripts'));
