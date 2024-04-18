const gulp = require("gulp");
const fileinclude = require("gulp-file-include");


module.exports = function () {
  gulp.task('html', function() {
    return gulp.src('./src/templates/*.html')
      .pipe(fileinclude({
        prefix: '@@',
        basepath: '@file'
      }))
      .pipe(gulp.dest('./public'));
  });
}
