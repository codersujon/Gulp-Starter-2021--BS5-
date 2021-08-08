
const gulp = require('gulp');

//CSS RELATED PLUGINS
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const {sync} = require('gulp-sass');

// UTILITY PLUGINS
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const options = require('gulp-options');
const gulpIf = require('gulp-if');

//JS RELATED PLUGINS
const uglify = require('gulp-uglify');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');

//BROWSER RELATED PLUGINS
const browserSync = require('browser-sync').create();
// const reload = browserSync.reload;


//JS VARIABLES



const jsSrc = './src/script/';
const jsFront = 'main.js';
const jsFiles = [jsFront];
const jsUrl = './dist/js/';

//Use for fontawesome fonts
const fontAwesomeSrc = 'node_modules/@fortawesome/fontawesome-free/webfonts/*.*';
const fontAwesomeUrl = './src/webfonts/';

//For also use Custom Fonts
const fontsSrc = './src/webfonts/*.*';
const fontsUrl = './dist/webfonts/';

const imageSrc = './src/images/**/*.*';
const imageUrl = './dist/img/';

const styleSrc = 'src/scss/main.scss';
const styleUrl = './dist/css/';
const mapUrl = './';

const htmlSrc = './src/**/*.html';
const htmlUrl = './dist';





//WATCH VARIABLES
const styleWatch = './src/scss/**/*.scss';
const jsWatch = './src/script/**/*.js';
const imgWatch = './src/images/**/*.*';
const fontsWatch = './src/fonts/**/*.*';
const htmlWatch = './src/**/*.html';


function browser_sync() {
    browserSync.init({
        server: {
            baseDir: './dist/'
        }
    });
}

function reload(done){
    browserSync.reload();
    done();
}

//CSS TASK
function css(done) {
    gulp.src(styleSrc)
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
        .pipe(sourcemaps.write(mapUrl))
        .pipe(gulp.dest(styleUrl))
        .pipe(browserSync.stream());

    done();
}

function triggerPlumber( src_file, dest_file){
    return gulp.src(src_file)
    .pipe(plumber())
    .pipe(gulp.dest(dest_file));
}




//JAVASCRIPT TASK
function js(done) {
    jsFiles.map(function (entry) {                   //browserify
        return browserify({
            entries: [jsSrc+ entry]
        })
        .transform( babelify, {presets: ['@babel/preset-env']})   //babelify
        .bundle()                                   
        .pipe(source(entry))
        .pipe(rename({extname: '.min.js'}))
        .pipe(buffer())                           
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())                             //uglify uses replace of sass compressed
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(jsUrl))
        .pipe(browserSync.stream());
    });
    done();
}

//FONT AWESOME 5
function fontawesome(){
    return triggerPlumber(fontAwesomeSrc, fontAwesomeUrl);
}
//FONTS 
function fonts(){
    return triggerPlumber( fontsSrc, fontsUrl);
}
//IMAGES 
function images(){
    return triggerPlumber( imageSrc, imageUrl);
}
//HTML 
function html(){
    return triggerPlumber( htmlSrc, htmlUrl);
}

//WATCH FILES
function watch_files() {
    gulp.watch(styleWatch, gulp.series(css, reload));
    gulp.watch(jsWatch, gulp.series(js, reload));
    gulp.watch(imgWatch, gulp.series(images, reload))
    gulp.watch(htmlWatch, gulp.series(html, reload))
    gulp.watch(htmlWatch, gulp.series(fonts, reload))
    gulp.src(jsUrl + 'main.min.js')
        .pipe(notify({message: 'Gulp is Watching, Happy Coding with Positive World!'}));
}

gulp.task('css', css);
gulp.task('js', js)
gulp.task('images', images)
gulp.task('html', html)
gulp.task('fontawesome', fontawesome),
gulp.task('fonts', fonts)


gulp.task('default', gulp.parallel(css, js, images, html, fontawesome, fonts));
gulp.task('watch', gulp.parallel(browser_sync, watch_files));


// gulp-strip-debug