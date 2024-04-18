const gulp = require('gulp');
const svgSprite = require('gulp-svg-sprite');

module.exports = function() {
  gulp.task('icons', function () {
    return gulp.src('src/assets/icons/*.svg')
      .pipe(svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg"  //sprite file name
          }
        },
      }))
      .pipe(gulp.dest('public/icons'));
  });
};
