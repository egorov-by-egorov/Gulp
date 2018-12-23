const gulp = require("gulp");
const sass = require("gulp-sass");
sass.compiler = require("node-sass");
const sourcemaps = require("gulp-sourcemaps");
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const del = require("del");
const browserSync = require("browser-sync").create();
const htmlmin = require("gulp-htmlmin");
const imagemin = require("gulp-imagemin");
const eslint = require("gulp-eslint");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify");
// const criticalCss = require("gulp-critical-css"); ???

// Static Server
gulp.task("serve", function() {
    browserSync.init({
    server: {
        baseDir: "./dist"
    }
    });
    gulp.watch("dist/").on("change", browserSync.reload);
});

// HTML
// copy "dev"
gulp.task("copy:html", function() {
  return gulp.src("./src/**/*.html").pipe(gulp.dest("dist/"));
});
// minify "build"
gulp.task("minifyHTML", () => {
    return gulp.src("src/*.html")
        .pipe(htmlmin({ 
            collapseWhitespace: true,
            removeComments: true
        }))
        .pipe(gulp.dest("dist/"));
});

// CLEAN
gulp.task('clean', function () {
    return del('./dist');
})

// SASS

gulp.task("sass", function() {
    return gulp.src("src/index.scss")
        .pipe(sourcemaps.init())
        .pipe(sass().on("error", sass.logError))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(cssnano())
        .pipe(gulp.dest("dist/"));
});



//JAVASCRIPT
gulp.task("js", function() {
    return gulp.src("src/index.js")
        .pipe(eslint()) // ???
        .pipe(eslint.format()) // ???
        .pipe(
            babel({
            presets: ["@babel/env"]
            })
        )
        .pipe(uglify())
        .pipe(gulp.dest("dist/"))
}); 

// Images
// copy
gulp.task("copy:images", function() {
  return gulp.src("./src/images/**/*.*").pipe(gulp.dest("dist/images/"));
});
// Compress
gulp.task('compress', function () {
    return gulp.src('./src/images/**/*.*')
        .pipe(imagemin([
            imagemin.gifsicle({ interlaced: true }),
            imagemin.jpegtran({ progressive: true }),
            imagemin.optipng({ optimizationLevel: 5 }),
            imagemin.svgo({
                plugins: [
                    { removeViewBox: true },
                    { cleanupIDs: false },
                    { removeUselessStrokeAndFill: true },
                    { removeDimensions: true }
                ]
            })
        ]))
        .pipe(gulp.dest('dist/images'))
});

// FONTS copy or ???converter???
gulp.task('copy:fonts', function () {
    return gulp.src('./src/fonts/*')
        .pipe(gulp.dest('dist/fonts/'))
})

// WATCHER
gulp.task("watch", function() {
    gulp.watch("src/**/*.html", gulp.series("copy:html"));
    gulp.watch("src/**/*.scss", gulp.series("sass"));
    gulp.watch("src/**/*.js", gulp.series("js"));
    gulp.watch("src/images/**/*.*", gulp.series("copy:images"));
    gulp.watch("src/fonts/**/*.*", gulp.series("copy:fonts"));
});

// TASKS
gulp.task(
    "dev",
    gulp.series(
    'clean',
    gulp.parallel(
        'sass',
        'js',
        'copy:html',
        'copy:images',
        'copy:fonts',
        'serve',
        'watch'
    )
));
gulp.task("build", gulp.series(
    'clean',
    gulp.parallel(
        'sass', 
        'js',
        'minifyHTML',
        'compress',
        'copy:fonts'
    )
));