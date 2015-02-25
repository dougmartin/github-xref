var gulp = require('gulp'),
    uglify = require('gulp-uglify');
    insert = require('gulp-insert'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    beep = require('beepbeep'),
    paths = {
      src: {
        shared: './src/shared/github-xref.js',
        chromeExtension: './src/chrome-extension/*'
      },
      bin: {
        bookmarklet: './bin/bookmarklet',
        chromeExtension: './bin/chrome-extension'
      }
    };

gulp.task('bookmarklet', function () {
  gulp.src(paths.src.shared)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'))
    .on('error', function (err) {
      beep(2, 500);
    })    
    .pipe(uglify())
    .pipe(insert.prepend('javascript:'))
    .pipe(gulp.dest(paths.bin.bookmarklet))
});

gulp.task('chrome-extension', function () {
  gulp.src([paths.src.shared, paths.src.chromeExtension])
    .pipe(gulp.dest(paths.bin.chromeExtension))
});

gulp.task('all', ['bookmarklet', 'chrome-extension']);
gulp.task('watch-all', function () {
  gulp.watch([paths.src.shared, paths.src.chromeExtension], ['all']);
});

gulp.task('default', ['all', 'watch-all']);