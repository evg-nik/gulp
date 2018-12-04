var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync');

//файлы и папки
var del = require('del');
var rename = require('gulp-rename');
var fs = require('fs');

//include файлов
var rigger = require('gulp-rigger');

var sourcemaps = require('gulp-sourcemaps');

//css
var autoprefixer = require('gulp-autoprefixer');
var cleanCSS = require('gulp-clean-css');

//js
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

//картинки
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');
var cache = require('gulp-cache');

//Автоматичесоке подключение библиотек
var useref = require('gulp-useref');
var gulpif = require('gulp-if');

//deploy
var gutil = require('gulp-util');
var ftp = require('vinyl-ftp');


var path = {
    src: {
        html: 'src/template/*.html',
        sass: ['src/sass/**/*.sass', 'src/sass/**/*.scss'],
        js: 'src/js/*.js',
    },
    build: {
        html: 'build/',
        sass: 'build/css',
        js: 'build/js/',
    },
    watch: {
        html: 'src/template/**/*.html',
        sass: ['src/sass/**/*.sass', 'src/sass/**/*.scss'],
        js: 'src/js/**/*.js',
        libsJson: 'src/js/libs/libs.json',
    },
};


gulp.task('browser-sync', function () {
    browserSync({
        // proxy:"test----html.bx",
        server: {
            baseDir: 'build'
        },
        notify: false,
        // tunnel: true,
        // tunnel: "projectmane", //Demonstration page: http://projectmane.localtunnel.me
    });
});


gulp.task('html', function () {
    gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('sass', function () {
    return gulp.src(path.src.sass)
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        .pipe(sourcemaps.write()) //Инициализируем sourcemap
        .pipe(gulp.dest(path.build.sass))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('js', function () {
    gulp.src(path.src.js)
        .pipe(sourcemaps.init())//Инициализируем sourcemap
        .pipe(rigger())
        .pipe(sourcemaps.write())//Инициализируем sourcemap
        .pipe(gulp.dest(path.build.js))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('libs', function () {

    var d = del.sync("build/js/libs");

    var fileData = fs.readFileSync("src/js/libs/libs.json", 'utf8');
    var pathObj = JSON.parse(fileData);

    for (var i = 0; i < pathObj.libs.length; i++) {
        gulp.src(pathObj.libs[i].src)
            .pipe(gulp.dest(pathObj.libs[i].dest));
    }

});


gulp.task('watch', ['sass', 'libs', 'js', 'html', 'browser-sync'], function () {
    gulp.watch(path.watch.sass, ['sass']);
    gulp.watch(path.watch.js, ['js']);
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.libsJson, ['libs']);
});


gulp.task('default', ['watch']);


//******************************************** продакшен a1 ********************************************//


var a1 = {
    src: {
        html: 'src/template/*.html',
        libs: 'build/js/libs/**/*',
        sass: ['src/sass/**/*.sass', 'src/sass/**/*.scss'],
        sass_original: 'src/sass/**/*',
        js: 'src/js/*.js',
        fonts: 'build/fonts/**/*',
        img: 'build/img/**/*',
    },
    build: {
        html: 'a1/',
        libs: 'a1/js/libs',
        sass: 'a1/css',
        sass_original: 'a1/sass',
        js: 'a1/js/',
        fonts: 'a1/fonts',
        img: 'a1/img',
    },
};


gulp.task('a1_transfer', function () {

    var buildHtml = gulp.src(a1.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(a1.build.html));

    var buildLibs = gulp.src(a1.src.libs)
        .pipe(gulp.dest(a1.build.libs));

    var buildFonts = gulp.src(a1.src.fonts)
        .pipe(gulp.dest(a1.build.fonts));

    var buildSass = gulp.src(a1.src.sass_original)
        .pipe(gulp.dest(a1.build.sass_original));
});


gulp.task('a1_sass', function () {
    return gulp.src(a1.src.sass)
        .pipe(sass({outputStyle: 'expanded'}).on('error', sass.logError))
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true}))
        //.pipe(cleanCSS()) // Опционально, закомментировать при отладке
        .pipe(gulp.dest(a1.build.sass))
});


gulp.task('a1_js', function () {
    gulp.src(a1.src.js)
        .pipe(rigger())
        //.pipe(uglify())
        .pipe(gulp.dest(a1.build.js))
});


gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('a1_imagemin', function () {
    return gulp.src(a1.src.img)
        .pipe(cache(imagemin({
            interlaced: true,
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        })))
        .pipe(gulp.dest(a1.build.img));
});


gulp.task('a1', function () {

    var d = del.sync("a1");

    gulp.start('a1_imagemin');
    gulp.start('a1_transfer');
    gulp.start('a1_sass');
    gulp.start('a1_js');


});


//******************************************** end продакшен a1 ********************************************//





gulp.task('deploy', function() {

    var conn = ftp.create({
        host:      '---',
        user:      '---',
        password:  '---',
        parallel:  10,
        log: gutil.log
    });

    var globs = [
        'dist/**',
    ];
    return gulp.src(globs, {buffer: false})
        .pipe(conn.dest('---/public_html/test'));

});

































































