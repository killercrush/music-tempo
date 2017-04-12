var gulp = require("gulp");
var babel = require("gulp-babel");
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task("build", function () {
  return gulp.src([
        "src/FFT.js",
        "src/OnsetDetection.js",
        "src/TempoInduction.js",
        "src/Agent.js",        
        "src/BeatTracking.js",
        "src/MusicTempo.js",
    ])
    .pipe(babel())
    .pipe(gulp.dest("dist/node"))
    .pipe(concat('music-tempo.js'))
    .pipe(gulp.dest("dist/browser"))
    .pipe(uglify())
    .pipe(rename('music-tempo.min.js'))
    .pipe(gulp.dest("dist/browser"));
});