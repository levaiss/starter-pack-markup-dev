const gulp = require("gulp");
const pug = require("gulp-pug");

module.exports = function () {
  gulp.task('html', function() {
    return gulp.src('./src/templates/*.pug')
      .pipe(pug({
        pretty: true
      }))
      .pipe(gulp.dest('./public'));
  });
}
