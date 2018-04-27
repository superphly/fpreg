var gulp = require('gulp');
var csso = require('gulp-csso');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');
var rm = require('gulp-rimraf');
var runSequence = require('run-sequence');
var cp = require('child_process');
var imagemin = require('gulp-imagemin');
var browserSync = require('browser-sync');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');

var jekyllCommand = (/^win/.test(process.platform)) ? 'jekyll.bat' : 'jekyll';

gulp.task('clean', function() {
    return gulp.src(['assets/*', '_site/*']).pipe(rm());
});

/* Compile and minify js */
gulp.task('js', function(){
	return gulp.src('src/js/*.js')
		.pipe(plumber())
		.pipe(uglify())
		.pipe(concat('main.js'))
		.pipe(gulp.dest('assets/js/'))
});

/* Grab web3 from bower */
gulp.task('web3', function() {
	return gulp.src(mainBowerFiles(), {base:'bower_components'})
		.pipe(gulp.dest('assets/js/'))
});

/* Compile and minify sass */
gulp.task('sass', function() {
	return gulp.src('src/styles/**/*.scss')
	    .pipe(plumber())
	    .pipe(sass())
	    .pipe(csso())
	    .pipe(gulp.dest('assets/css/'));
});

/* Compile fonts */
gulp.task('fonts', function() {
	return gulp.src('src/fonts/**/*.{ttf,woff,woff2}')
		.pipe(plumber())
		.pipe(gulp.dest('assets/fonts/'));
})

/* Minify images */
gulp.task('imagemin', function() {
	return gulp.src('src/img/**/*.{jpg,png,gif}')
		.pipe(plumber())
		.pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
		.pipe(gulp.dest('assets/img/'));
});

/* Build the Jekyll Site */
gulp.task('jekyll-build', function (done) {
	return cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'}).on('close', done);
});

/* Build the jekyll site and launch browser-sync */
gulp.task('browser-sync', ['jekyll-build'], function() {
	browserSync({server: {baseDir: '_site'}});
});


/* Watch for changes */
gulp.task('watch', function() {
  gulp.watch('src/styles/**/*.scss', ['sass', 'jekyll-rebuild']);
  gulp.watch('src/js/**/*.js', ['js', 'jekyll-rebuild']);
  gulp.watch('src/fonts/**/*.{tff,woff,woff2}', ['fonts', 'jekyll-rebuild']);
  gulp.watch('src/img/**/*.{jpg,png,gif}', ['imagemin', 'jekyll-rebuild']);
  gulp.watch(['*html', '_includes/*html', '_layouts/*.html'], ['jekyll-rebuild']);
});

/* Rebuild Jekyll & reload browserSync */
gulp.task('jekyll-rebuild', ['jekyll-build'], function (done) {
	cp.spawn(jekyllCommand, ['build'], {stdio: 'inherit'}).on('close', done);
	browserSync.reload();
	done();
});

gulp.task('default', function() {
	return runSequence(
		'clean',
		['js', 'sass', 'fonts', 'imagemin'],
		'browser-sync',
		'watch'
	);
});