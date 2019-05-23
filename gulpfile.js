const gulp = require('gulp');
const inject = require('gulp-inject-string');
const minify = require('gulp-uglify');
const rename = require('gulp-rename');
const stripDebug = require('gulp-strip-debug');

var buildTargetUrlPath = process.env.BUILD_TARGET_URL_PATH || './';

gulp.task('miniJS', done => {
  gulp.src('js/*.js')
    // replace file paths for assets
    .pipe(inject.replace(
      'var BASE_FILE_PATH = \'./\';',
      `var BASE_FILE_PATH = '${buildTargetUrlPath}'`
     ))
    .pipe(minify())
    .pipe(stripDebug())
    .pipe(gulp.dest('dist/'))
  done();
});

gulp.task('injectHTMLSrc', done => {
  gulp.src('./index-template.html')
    // replace all js file paths
    .pipe(inject.replace(
      'src="./',
      `src="${buildTargetUrlPath}`
     ))
    // replace file path for favicon
    .pipe(inject.replace(
      'href="./',
      `href="${buildTargetUrlPath}`
     ))
    // replace file path for service worker
    .pipe(inject.replace(
      './sw.js',
      `${buildTargetUrlPath}sw.js`
     ))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'))
  done();
});

gulp.task('default', gulp.parallel(
  'miniJS',
  'injectHTMLSrc'
  )
);
