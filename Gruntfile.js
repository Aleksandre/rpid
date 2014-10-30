var jsToWatch = [
  'app.js',
  'core/*.js'
];

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodemon: {
      dev: {
        script: 'app.js'
      }
    },
    env: {
      dev: {
        NODE_ENV: grunt.option('environment') || 'development',
        DEST: 'temp'
      }
    },
    mochaTest: {
      src: ['./tests/*.js'],
      dest: './.test_result.out'
    },
    watch: {
      files: ['./*.js', 'tests/*.js', 'core/*.js'],
      tasks: ['jshint', 'mochaTest']
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        eqnull: true,
        browser: true,
        reporter: require('jshint-stylish'),
        globals: {
          jQuery: true
        },
      },
      all: ['Gruntfile.js', './core/*.js', './tests/*.js']
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.registerTask('test', ['env', 'jshint', 'mochaTest', 'watch']);

   grunt.registerTask('test-travis', ['env', 'mochaTest']);

  grunt.registerTask('run', ['env', 'nodemon']);
}