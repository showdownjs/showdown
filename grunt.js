
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    lint: {
      all: ['src/**/*.js', 'test/**/*.js']
    },
    jshint: {
      options: {
        browser: true
      }
    },
    simplemocha: {
      all: {
        src: 'test/run.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          ui: 'bdd'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-simple-mocha');

  grunt.registerTask('default', ['simplemocha', 'lint']);
};
