const {src, dest, watch, parallel, series} = require('gulp');

const scss = require('gulp-sass');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');

const SOURCE_DIR = './dist/';
const DEST_DIR = './public/';

function browsersync() {
    browserSync.init({
        server: {
            baseDir: DEST_DIR
        }
    });
}

function cleanDist() {
    return del(DEST_DIR);
}

async function  images() {

    return src(SOURCE_DIR + 'images/**/*')
        .pipe((await imagemin)(
            [
                imagemin.gifsicle({interlaced: true}),
                imagemin.mozjpeg({quality: 75, progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ]
        ))
        .pipe(dest(DEST_DIR + 'images/'))
        .pipe(browserSync.stream());
}

function scripts() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        SOURCE_DIR + 'js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest(DEST_DIR + 'js'))
        .pipe(browserSync.stream())
}

function styles() {
    return src(SOURCE_DIR + 'scss/style.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest(DEST_DIR + 'css'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        SOURCE_DIR + 'css/style.min.css',
        SOURCE_DIR + 'fonts/**/*',
        SOURCE_DIR + 'js/main.min.js',
        SOURCE_DIR + '*.html'
    ], {base: 'app'})
        .pipe(dest(DEST_DIR))
}

function html() {
    return src(SOURCE_DIR + '*.html')
        .pipe(dest(DEST_DIR));
}

function watching() {
    watch([SOURCE_DIR + 'scss/**/*.scss'], styles);
    watch([SOURCE_DIR + 'js/**/*.js', '!app/js/main.min.js'], scripts);
    watch([SOURCE_DIR + 'images/**/*'], images);
    watch([SOURCE_DIR + '*.html'], html).on('change', browserSync.reload);
}

exports.build = series(cleanDist, images, build);
exports.default = series(cleanDist, parallel(images, styles, scripts, html, browsersync, watching));