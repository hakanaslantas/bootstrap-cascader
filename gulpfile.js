'use strict';

var gulp = require('gulp'), pump = require('pump');
var $ = require('gulp-load-plugins')({DEBUG: true});

var name = 'bootstrap-cascader', siteDir = './site', distDir = './dist', srcDir = './src', paths = {
  html: {src: [srcDir + '/**/*.html']},
  js: {src: [srcDir + '/**/*.js']},
  sass: {src: [srcDir + '/**/*.scss']}
};

var sassTask = function (usemin) {
  var tasks = [gulp.src(paths.sass.src), $.sass({outputStyle: 'compressed'}),
    $.sourcemaps.init(), $.autoprefixer({browsers: ['last 2 versions', 'ie 6-8']}),
    $.replace(/iconfont\.([a-z]{3})/g, name + '.$1'),
    $.replace(/font-family:\s*\"iconfont\"/g, 'font-family: "' + name + '"'),
    $.rename({suffix: '.min'}), $.rev(), $.sourcemaps.write('./')];
  return usemin ? tasks : tasks.concat([gulp.dest(siteDir), $.connect.reload()]);
};

var jsTask = function (usemin, path) {
  var tasks = [gulp.src(path || paths.js.src), $.sourcemaps.init(), $.uglify({ie8: true}),
    $.rename({suffix: '.min'}), $.rev(), $.sourcemaps.write('./')];
  return usemin ? tasks : tasks.concat([gulp.dest(siteDir), $.connect.reload()]);
};

gulp.task('clean-site', function (cb) {
  pump([gulp.src(siteDir, {read: false}), $.clean()], cb);
});

gulp.task('clean-dist', function (cb) {
  pump([gulp.src(distDir, {read: false}), $.clean()], cb);
});

gulp.task('html', function (cb) {
  pump([gulp.src(paths.html.src),
    $.usemin({
      scss: sassTask(true), vendorCss: sassTask(true),
      html: [$.htmlmin({collapseWhitespace: false})],
      js: jsTask(true), vendorJs: jsTask(true), demoJs: jsTask(true)
    }), gulp.dest(siteDir), $.connect.reload()], cb);
});

gulp.task('sass', function (cb) {
  pump(sassTask(), cb);
});

gulp.task('js', function (cb) {
  pump(jsTask(), cb);
});

gulp.task('fonts', function (cb) {
  pump([gulp.src('bower_components/bootstrap/fonts/*'),
    gulp.dest(siteDir + '/fonts'),

    gulp.src('resources/iconfont/*.{eot,svg,ttf,woff}'),
    $.rename(function (path) {
      path.basename = name;
    }),
    gulp.dest(siteDir + '/css')], cb);
});

gulp.task('watch', ['site'], function () {
  gulp.watch(paths.html.src, ['html']);
  gulp.watch(paths.sass.src, ['sass', 'html']);
  gulp.watch([paths.js.src, 'gulpfile.js'], ['js', 'html']);
});

gulp.task('server', ['watch'], function () {
  var server = $.connect.server({root: siteDir, livereload: true});
  return gulp.src('.').pipe($.open({uri: 'http://' + server.host + ':' + server.port}));
});

gulp.task('site', ['clean-site'], function () {
  gulp.start(['sass', 'fonts', 'js', 'html']);
});

gulp.task('dist', ['clean-dist'], function (cb) {
  pump([gulp.src(paths.sass.src.concat(['resources/**/iconfont.css'])),
    $.sass({outputStyle: 'compressed'}),
    $.sourcemaps.init(),
    $.concat(name + '.css'),
    $.autoprefixer({browsers: ['last 2 versions', 'ie 6-8']}),
    $.replace(/iconfont\.([a-z]{3})/g, name + '.$1'),
    $.replace(/font-family:\s*\"iconfont\"/g, 'font-family: "' + name + '"'),
    $.rename({suffix: '.min'}),
    $.rev(),
    $.sourcemaps.write('./'),
    gulp.dest(distDir + '/css'),

    gulp.src('src/**/' + name + '.js'),
    $.sourcemaps.init(),
    $.uglify({ie8: true}),
    $.rename({suffix: '.min'}),
    $.rev(),
    $.sourcemaps.write('./'),
    gulp.dest(distDir),

    gulp.src('resources/iconfont/*.{eot,svg,ttf,woff}'),
    $.rename(function (path) {
      path.basename = name;
    }),
    gulp.dest(distDir + '/css')], cb);

});

gulp.task('default', ['dist']);