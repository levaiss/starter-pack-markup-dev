const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const postCss = require('gulp-postcss');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const gulp = require("gulp");

module.exports = function(browserSync) {
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
};
