## Plugins
```
npm install gulp-uglify gulp-watch-path stream-combiner2 gulp-sourcemaps gulp-minify-css gulp-autoprefixer gulp-less gulp-ruby-sass gulp-imagemin gulp-util --save-dev
```
## 配置JS任务
1. gulp-uglify

检测 src/js 目录下的js文件修改后, 压缩 js/ 中所有js文件并输出到 dist/js中

src/js/**/*.js 是 glob 语法

```
var uglify = require('gulp-uglify')

gulp.task('uglifyjs', function () {
    gulp.src('src/js/**/*.js')
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'))
})
// src/js/**/*.js 是 glob 语法
gulp.task('default', function () {
    gulp.watch('src/js/**/*.js', ['uglifyjs'])
})
```
2. gulp-watch-path

此配置有个性能问题，当 gulp.watch 检测到 src/js/ 目录下的js文件有修改时会将所有文件全部编译。实际上我们只需要重新编译被修改的文件。

简单介绍 gulp.watch 第二个参数为 function 时的用法
```
gulp.watch('src/js/**/*.js', function (event) {
    console.log(event);
    /*
    当修改 src/js/a.js 文件时
    event {
        // 发生改变的类型，不管是添加，改变或是删除
        type: 'changed', 
        // 触发事件的文件路径
        path: '/Users/nimojs/Documents/code/gulp-book/demo/chapter7/src/js/a.js'
    }
    */
})
```
利用 event 给到的信息，检测到某个 js 文件被修改时，只编写当前修改的 js 文件。

可以利用 gulp-watch-path 配合 event 获取编译路径和输出路径。
```
var watchPath = require('gulp-watch-path')

gulp.task('watchjs', function () {
    gulp.watch('src/js/**/*.js', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        /*
        paths
            { srcPath: 'src/js/a.js',
              srcDir: 'src/js/',
              distPath: 'dist/js/a.js',
              distDir: 'dist/js/',
              srcFilename: 'a.js',
              distFilename: 'a.js' }
        */
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(uglify())
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('default', ['watchjs'])
```

watchPath(event, search, replace, distExt)

参数	    说明
event	gulp.watch 回调函数的 event
search	需要被替换的起始字符串
replace	第三个参数是新的的字符串
distExt	扩展名(非必填)

3. stream-combiner2 捕获错误
```
var handleError = function (err) {
    var colors = gutil.colors;
    console.log('\n')
    gutil.log(colors.red('Error!'))
    gutil.log('fileName: ' + colors.red(err.fileName))
    gutil.log('lineNumber: ' + colors.red(err.lineNumber))
    gutil.log('message: ' + err.message)
    gutil.log('plugin: ' + colors.yellow(err.plugin))
}
var combiner = require('stream-combiner2')

gulp.task('watchjs', function () {
    gulp.watch('src/js/**/*.js', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')
        /*
        paths
            { srcPath: 'src/js/a.js',
              srcDir: 'src/js/',
              distPath: 'dist/js/a.js',
              distDir: 'dist/js/',
              srcFilename: 'a.js',
              distFilename: 'a.js' }
        */
        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            uglify(),
            gulp.dest(paths.distDir)
        ])

        combined.on('error', handleError)
    })
})
```
4. gulp-sourcemap
压缩后的代码不存在换行和空白符，导致出错很难调试。使用 sourcemap 用于调试
```
var sourcemaps = require('gulp-sourcemaps')
var combined = combiner.obj([
    gulp.src(paths.srcPath),
    sourcemaps.init(),
    uglify(),
    sourcemaps.write('./'),
    gulp.dest(paths.distDir)
])
// ...
```

## 配置CSS任务
有时不想使用Less或SASS而是直接编写CSS, 但我们需要压缩CSS以提高页面加载速度
1. gulp-minify-css
按照 压缩js的方法，先编写 watchcss 任务

```
var minifycss = require('gulp-minify-css')

gulp.task('watchcss', function () {
    gulp.watch('src/css/**/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('default', ['watchjs','watchcss'])
```

2. gulp-autoprefixer

autoprefixer 解析css文件并且添加浏览器前缀到CSS规则里

在 watchcss 任务中加入 autoprefixer
```
gulp.task('watchcss', function () {
    gulp.watch('src/css/**/*.css', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(sourcemaps.init())
            .pipe(autoprefixer({
              browsers: 'last 2 versions'
            }))
            .pipe(minifycss())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})
```

有时需要一次编译所有 css 文件。可以配置 minifyss 任务

```
var less = require('gulp-less')
gulp.task('minifycss', function () {
    gulp.src('src/css/**/*.css')
        .pipe(sourcemaps.init())
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(minifycss())
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css/'))
})
```

在命令行输入 gulp minifyss 以压缩 src/css/ 下的所有 .css 文件并复制到 dist/css 目录下

## 配置Less任务

```
gulp.task('watchless', function () {
    gulp.watch('src/less/**/*.less', function (event) {
        var paths = watchPath(event, 'src/', 'dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        
        var combined = combiner.obj([
            gulp.src(paths.srcPath),
            sourcemaps.init(),
            autoprefixer({
                browsers: 'last 2 Versions'
            }),
            less(),
            minifycss(),
            sourcemaps.write('./'),
            gulp.dest(paths.distDir)
        ])
        combined.on('error', handleError)
    })
})

gulp.task('lesscss', function () {
    var combined = combiner.obj([
        gulp.src('src/less/**/*.less'),
        sourcemaps.init(),
        autoprefixer({
            browsers: 'last 2 Versions'
        }),
        less(),
        minifycss(),
        sourcemaps.write('./'),
        gulp.dest('dist/css')
    ])
    combined.on('error', handleError)
})
```

## 配置 Sass任务

```
gulp.task('watchsass',function () {
    gulp.watch('src/sass/**/*', function (event) {
        var paths = watchPath(event, 'src/sass/', 'dist/css/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)
        sass(paths.srcPath)
            .on('error', function (err) {
                console.error('Error!', err.message);
            })
            .pipe(sourcemaps.init())
            .pipe(minifycss())
            .pipe(autoprefixer({
              browsers: 'last 2 versions'
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('sasscss', function () {
        sass('src/sass/')
        .on('error', function (err) {
            console.error('Error!', err.message);
        })
        .pipe(sourcemaps.init())
        .pipe(minifycss())
        .pipe(autoprefixer({
          browsers: 'last 2 versions'
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('dist/css'))
})

gulp.task('default', ['watchjs', 'watchcss', 'watchless', 'watchsass', 'watchsass'])
```

## 配置image任务

```
var imagemin = require('gulp-imagemin')

gulp.task('watchimage', function () {
    gulp.watch('src/images/**/*', function (event) {
        var paths = watchPath(event,'src/','dist/')

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(imagemin({
                progressive: true
            }))
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('image', function () {
    gulp.src('src/images/**/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('dist/images'))
})
```

## 配置文件复制任务

复制 src/fonts/ 文件到 dist/ 中
```
gulp.task('watchcopy', function () {
    gulp.watch('src/fonts/**/*', function (event) {
        var paths = watchPath(event)

        gutil.log(gutil.colors.green(event.type) + ' ' + paths.srcPath)
        gutil.log('Dist ' + paths.distPath)

        gulp.src(paths.srcPath)
            .pipe(gulp.dest(paths.distDir))
    })
})

gulp.task('copy', function () {
    gulp.src('src/fonts/**/*')
        .pipe(gulp.dest('dist/fonts/'))
})

gulp.task('default', ['watchjs', 'watchcss', 'watchless', 'watchsass', 'watchimage', 'watchcopy'])
```
