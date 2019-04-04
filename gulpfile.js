const gulp = require('gulp');
const minify = require('gulp-uglify');
const stripDebug = require('gulp-strip-debug');

gulp.task('mini', done => {
  gulp.src('js/*.js')
    .pipe(minify())
    .pipe(stripDebug())
    .pipe(gulp.dest('dist/'))
  done();
});

gulp.task('default', gulp.parallel(
  'mini'
  )
);
