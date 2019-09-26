// 获取gulp
var gulp = require('gulp')

// 获取uglify 模块 用于压缩js
var uglify = require('gulp-uglify')
// 获取minify-css模块，用于压缩css
var minifycss = require('gulp-minify-css')
// 获取imagemin模块, 用于压缩图片
var imagemin = require('gulp-imagemin')
// 获取less模块，用于编译less
var less = require('gulp-less')
// 获取 gulp-ruby-sass 模块
var sass = require('gulp-ruby-sass')

// 创建js压缩任务
gulp.task('script', function () {
    // 1. 找到文件
    gulp.src('src/js/**/*.js')
        // 2. 压缩文件
        .pipe(uglify())
        // 3. 另存压缩后的文件
        .pipe(gulp.dest('dist/js'))
})

// 压缩css文件
gulp.task('css', function () {
    gulp.src('src/css/**/*.css')
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'))
})

// 压缩图片
gulp.task('images', function () {
    gulp.src('src/img/**/*.*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'))
})

gulp.task('less', function () {
    gulp.src('src/less/**/*.less')
        .pipe(less())
        .pipe(gulp.dest('dist/less'))
})

gulp.task('sass', function () {
    return sass('src/sass/')
        .on('error', function (err) {
            console.error('Error!', err.message)
        })
        .pipe(gulp.dest('dist/sass'))
})

// 在命令行使用gulp auto 启动此任务
gulp.task('auto', function () {
    // 监听文件修改，当文件被修改则执行 script 任务
    gulp.watch('src/js/**/*.js', ['script'])
    // 监听css文件修改
    gulp.watch('src/css/**/*.css', ['css'])
    gulp.watch('src/img/**/*.*', ['images'])
    gulp.watch('src/less/**/*.less', ['less'])
    gulp.watch('src/sass/**/*.scss', ['sass'])
})

// 使用gulp.task('default')定义默认任务
// 在命令行中使用 gulp启动 script任务和 auto任务
gulp.task('default', ['script', 'auto', 'css', 'images', 'less', 'sass'])
