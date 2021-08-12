
/*INCLUDE GULP AND PLUGINS*/
let gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    { sync } = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    browserify = require('browserify'),
    rename = require('gulp-rename'),
    fileinclude = require('gulp-file-include');
notify = require('gulp-notify'),
    options = require('gulp-options'),
    gulpIf = require('gulp-if'),
    babelify = require('babelify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');


/*PATH*/
const path = {
    dist: {
        htmlUrl: './dist',
        styleUrl: './dist/css/',
        imageUrl: './dist/img',
        jsUrl: './dist/js/',
        fontsUrl: './dist/webfonts/',
        fontAwesomeUrl: './src/webfonts/',
        mapUrl: './'
    },
    src: {
        htmlSrc: './src/**/*.html',
        styleSrc: 'src/scss/main.scss',
        jsSrc: './src/script/',
        fontAwesomeSrc: 'node_modules/@fortawesome/fontawesome-free/webfonts/*.*',
        fontsSrc: './src/webfonts/*.*',
        imageSrc: './src/images/**/*.*',
        partials: './src/partials/'
    },
    watch: {
        htmlWatch: './src/**/*.html',
        styleWatch: './src/scss/**/*.scss',
        jsWatch: './src/script/**/*.js',
        imgWatch: './src/images/**/*.*',
        fontsWatch: './src/fonts/**/*.*',
        fontAwesomeWatch: './src/webfonts/**/*.*',
        partials: './src/partials/**/*.*'
    }
};

const jsFront = 'main.js';
const jsFiles = [jsFront];

/*SERVER*/

function browser_sync() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });
}

function reload(done) {
    browserSync.reload();
    done();
}

/*TASKS*/

//COMPILE HTML 
function html(done) {
    gulp.src(path.src.htmlSrc)
        .pipe(plumber())
        .pipe(fileinclude({
            prefix: '@@',
            basepath: path.src.partials
        }))
        .pipe(gulp.dest(path.dist.htmlUrl))
        .pipe(browserSync.stream());
    done();
}


//COMPILE CSS
function css(done) {
    gulp.src(path.src.styleSrc)
        .pipe(sourcemaps.init())
        .pipe(sass({
            errorLogToConsole: true,
            outputStyle: 'compressed'
        }))
        .on('error', console.error.bind(console))
        .pipe(autoprefixer({
            // browsers: ['last 2 versions','> 5%', 'Firefox ESR'],
            cascade: false
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write(path.dist.mapUrl))
        .pipe(gulp.dest(path.dist.styleUrl))
        .pipe(browserSync.stream());

    done();
}

//TRIGGER PLUMBER
function triggerPlumber(src_file, dest_file) {
    return gulp.src(src_file)
        .pipe(plumber())
        .pipe(gulp.dest(dest_file));
}

//FONTS MOVE
function fonts() {
    return triggerPlumber(path.src.fontsSrc, path.dist.fontsUrl);
}

//IMAGES MOVE
function images() {
    return triggerPlumber(path.src.imageSrc, path.dist.imageUrl);
}

//FONT AWESOME 5
function fontawesome() {
    return triggerPlumber(path.src.fontAwesomeSrc, path.dist.fontAwesomeUrl);
}


//JAVASCRIPT TASK
function js(done) {
    jsFiles.map(function (entry) {
        return browserify({
            entries: [path.src.jsSrc + entry]
        })
            .transform(babelify, { presets: ['@babel/preset-env'] })
            .bundle()
            .pipe(source(entry))
            .pipe(rename({ extname: '.min.js' }))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(path.dist.jsUrl))
            .pipe(browserSync.stream());
    });
    done();
}


//WATCH FILES
function watch_files() {
    gulp.watch(path.watch.htmlWatch, gulp.series(html, reload))
    gulp.watch(path.watch.styleWatch, gulp.series(css, reload));
    gulp.watch(path.watch.jsWatch, gulp.series(js, reload));
    gulp.watch(path.watch.imgWatch, gulp.series(images, reload))
    gulp.watch(path.watch.fontAwesomeWatch, gulp.series(fontawesome, reload))
    gulp.watch(path.watch.fontsWatch, gulp.series(fonts, reload))
    gulp.src(path.dist.jsUrl + 'main.min.js')
        .pipe(notify({ message: 'Gulp is Watching, Happy Coding with Positive World!' }));
}

gulp.task('html', html)
gulp.task('css', css);
gulp.task('js', js)
gulp.task('images', images)
gulp.task('fontawesome', fontawesome),
    gulp.task('fonts', fonts)

gulp.task('default', gulp.parallel(html, css, js, images, fontawesome, fonts));
gulp.task('watch', gulp.parallel(browser_sync, watch_files));

