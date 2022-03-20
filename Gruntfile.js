/**
 * Created by Tivie on 12-11-2014.
 */

module.exports = function (grunt) {

  if (grunt.option('q') || grunt.option('quiet')) {
    require('quiet-grunt');
  }

  // Project configuration.
  var config = {
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      dist: {
        options: {
          sourceMap: true,
          banner: ';/*! <%= pkg.name %> v <%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */\n(function(){\n',
          footer: '}).call(this);\n'
        },
        src: [
          'src/options.js',
          'src/showdown.js',
          'src/helpers.js',
          'src/subParsers/makehtml/*.js',
          'src/subParsers/makemarkdown/*.js',
          'src/converter.js',
          'src/loader.js'
        ],
        dest: 'dist/<%= pkg.name %>.js'
      },
      cli: {
        src: [
          'src/cli/cli.js'
        ],
        dest: 'bin/showdown.js'
      },
      test: {
        src: '<%= concat.dist.src %>',
        dest: '.build/<%= pkg.name %>.js',
        options: {
          sourceMap: false
        }
      }
    },

    clean: ['.build/'],

    uglify: {
      dist: {
        options: {
          sourceMap: true,
          banner: '/*! <%= pkg.name %> v <%= pkg.version %> - <%= grunt.template.today("dd-mm-yyyy") %> */'
        },
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      },
      cli: {
        options: {
          sourceMap: false,
          banner: '#!/usr/bin/env node'
        },
        files: {
          'bin/showdown.js': ['<%= concat.cli.dest %>']
        }
      }
    },

    endline: {
      dist: {
        files: {
          'dist/<%= pkg.name %>.js': 'dist/<%= pkg.name %>.js',
          'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.min.js'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      files: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    eslint: {
      options: {
        overrideConfigFile: '.eslintrc.json'
      },
      target: [
        'Gruntfile.js',
        'src/**/*.js',
        'test/**/*.js'
      ]
    },

    conventionalChangelog: {
      options: {
        changelogOpts: {
          preset: 'angular'
        }
      },
      release: {
        src: 'CHANGELOG.md'
      }
    },

    conventionalGithubReleaser: {
      release: {
        options: {
          auth: {
            type: 'oauth',
            token: process.env.GH_TOEKN
          },
          changelogOpts: {
            preset: 'angular'
          }
        }
      }
    },

    simplemocha: {
      functional: {
        src: 'test/functional/**/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: true,
          reporter: 'spec'
        }
      },
      unit: {
        src: 'test/unit/**/*.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: true,
          reporter: 'spec'
        }
      },
      single: {
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          reporter: 'spec'
        }
      },
      cli: {
        src: 'test/unit/cli.js',
        options: {
          globals: ['should'],
          timeout: 3000,
          ignoreLeaks: false,
          reporter: 'spec'
        }
      }
    }
  };

  grunt.initConfig(config);

  /**
   * Load common tasks for legacy and normal tests
   */
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-endline');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  /**
   * Generate Changelog
   */
  grunt.registerTask('generate-changelog', function () {
    'use strict';
    grunt.loadNpmTasks('grunt-conventional-changelog');
    grunt.loadNpmTasks('grunt-conventional-github-releaser');
    grunt.task.run('conventionalChangelog');
  });

  /**
   * Lint tasks
   */
  grunt.registerTask('lint', function () {
    'use strict';
    grunt.loadNpmTasks('grunt-eslint');
    grunt.task.run('jshint', 'eslint');
  });

  /**
   * Performance task
   */
  grunt.registerTask('performancejs', function () {
    'use strict';
    var perf = require('./test/performance/performance.js');
    perf.runTests();
    perf.generateLogs();
  });

  /**
   * Run a single test
   */
  grunt.registerTask('single-test', function (file) {
    'use strict';
    grunt.config.merge({
      simplemocha: {
        single: {
          src: file
        }
      }
    });

    grunt.task.run(['lint', 'concat:test', 'simplemocha:single', 'clean']);
  });

  /**
   * Tasks
   */
  grunt.registerTask('test', ['clean', 'lint', 'concat:test', 'simplemocha:unit', 'simplemocha:functional', 'clean']);
  grunt.registerTask('test-functional', ['concat:test', 'simplemocha:functional', 'clean']);
  grunt.registerTask('test-unit', ['concat:test', 'simplemocha:unit', 'clean']);
  grunt.registerTask('test-cli', ['clean', 'lint', 'concat:test', 'simplemocha:cli', 'clean']);

  grunt.registerTask('performance', ['concat:test', 'performancejs', 'clean']);
  grunt.registerTask('build', ['test', 'concat:dist', 'concat:cli', 'uglify:dist', 'uglify:cli', 'endline']);
  grunt.registerTask('build-without-test', ['concat:dist', 'uglify', 'endline']);
  grunt.registerTask('prep-release', ['build', 'performance', 'generate-changelog']);

  // Default task(s).
  grunt.registerTask('default', ['test']);
};
