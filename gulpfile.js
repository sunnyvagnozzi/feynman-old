/*
 * Defines common tasks used in larkSeedsnt.
 */

// javascript imports
var gulp = require('gulp')
var webpack = require('gulp-webpack')
var named = require('vinyl-named')
var gulp_ssh = require('gulp-ssh')
var install = require('gulp-install')
var shell = require('gulp-shell')
var karma = require('karma').server


/* source directory layout */

var asset_dir = './larkSeeds/assets/'

var project_paths = {
    build_dir: './larkSeeds/assets/build/',
    entries: './larkSeeds/assets/scripts/entries/*.js',
    karma_config: __dirname + '/conf/karma.conf.js',
    webpack_config: './conf/webpack.config.js'
}


/* remote host configuration */

var ssh_host = gulp_ssh({
    host: '',
    username: ''
})


/* tasks */

// build frontend entry points using webpack
gulp.task('build_frontend', function() {
    return gulp.src(project_paths.entries)
               .pipe(named())
               .pipe(webpack(require(project_paths.webpack_config)))
               .pipe(gulp.dest(project_paths.build_dir))
})


// create the local database
gulp.task('create_db', shell.task('./manage.py syncdb'))


// deploy the codebase to live server (make sure to push first)
gulp.task('deploy', ['push'], function() {
    // execute the following commands on remote server
    return ssh_host.shell([
        // navigate into directory with repository
        'cd repository',
        // pull latest version of codebase
        'gulp pull',
        // update "local" project
        'gulp update_project',
        // restart application server
        'sudo service gunicorn restart',
    ])
})


// initialize the project locally
gulp.task('init', ['create_db', 'update_project'])


// pull repository from remote server
gulp.task('pull', shell.task('git pull'))


// push repository to remote server (pull first)
gulp.task('push', ['pull'], shell.task('git push'))


// pull repository from remote server
gulp.task('server', shell.task('./manage.py runserver_plus'))


// run the test suite once
gulp.task('test', function(done) {
    karma.start({
        configFile: project_paths.karma_config,
        singleRun: true
    }, done)
})


// run the test suite once
gulp.task('tdd', function(done) {
    karma.start({
        configFile: project_paths.karma_config
    }, done)
})


// install/update local dependencies
gulp.task('update_dependencies', function() {
    // install npm dependencies
    return gulp.src('./package.json')
               .pipe(install())
               .pipe(shell(['pip install -r requirements.pip']))
})


// execute necessary commands to initialize  project locally
gulp.task('update_project', ['update-dependencies'], shell.task([
    // update database
    './manage.py migrate',
    // collect static files
    './manage.py collectstatic',
]))


// end of file
