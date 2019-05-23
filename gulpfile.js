const gulp = require('gulp');
const inject = require('gulp-inject-string');
const minify = require('gulp-uglify');
const rename = require('gulp-rename');
const stripDebug = require('gulp-strip-debug');
const webserver = require('gulp-webserver');

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

gulp.task('injectSWPath', done => {
  gulp.src('./sw-template.js')
    .pipe(inject.replace(
      'BASE_FILE_PATH = \'./\'',
      `BASE_FILE_PATH = '${buildTargetUrlPath}'`
    ))
    .pipe(rename('./sw.js'))
    .pipe(gulp.dest('./'))
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
    // replace default scope for service worker
    .pipe(inject.replace(
      'scope: \'/\'',
      `scope: '${buildTargetUrlPath}'`
    ))
    .pipe(rename('index.html'))
    .pipe(gulp.dest('./'))
  done();
});

gulp.task('serve', () => {
  gulp.src('./')
    .pipe(webserver({
      livereload: true,
      open: true
    }))
});

gulp.task('watch', () => {
  gulp.watch('js/**', gulp.series('miniJS')),
  gulp.watch('./*.html', gulp.series('injectHTMLSrc')),
  gulp.watch('./sw.js', gulp.series('injectSWPath'));
  return
});

gulp.task('dev', gulp.parallel(
  'serve',
  'watch'
  )
);

gulp.task('default', gulp.parallel(
  'miniJS',
  'injectHTMLSrc',
  'injectSWPath'
  )
);
