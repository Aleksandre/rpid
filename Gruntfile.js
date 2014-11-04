module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodemon: {
      dev: {
        script: './app.js'
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
      files: ['./*.js', 'tests/*.js', 'lib/*.js'],
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
    },
    exec :{
      run_ui: 'nodemon --exec "python" ./ui/main.py'
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.loadNpmTasks('grunt-exec');

  grunt.registerTask('test', ['env', 'jshint', 'mochaTest', 'watch']);
  grunt.registerTask('test-travis', ['env', 'mochaTest']);
  grunt.registerTask('test-rpi', ['env','mochaTest'])
  grunt.registerTask('run', ['env', 'nodemon']);
  grunt.registerTask('run-ui', ['env','exec:run_ui'])

}