/**
 * Created by Tivie on 12-11-2014.
 */

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
                sourceMap: true
            },
            dist: {
                src: ['src/showdown.js', 'src/*.js'],
                dest: 'compressed/<%= pkg.name %>.js'
            },
            github_ext: {
                src: ['src/extensions/github.js'],
                dest: 'compressed/extensions/github.min.js'
            },
            prettify_ext: {
                src: ['src/extensions/prettify.js'],
                dest: 'compressed/extensions/prettify.min.js'
            },
            table_ext: {
                src: ['src/extensions/table.js'],
                dest: 'compressed/extensions/table.min.js'
            },
            twitter_ext: {
                src: ['src/extensions/twitter.js'],
                dest: 'compressed/extensions/twitter.min.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'compressed/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
                }
            },
            github_ext: {
                files: {
                    'compressed/extensions/github.min.js': ['<%= concat.github_ext.dest %>']
                }
            },
            prettify_ext: {
                files: {
                    'compressed/extensions/prettify.min.js': ['<%= concat.prettify_ext.dest %>']
                }
            },
            table_ext: {
                files: {
                    'compressed/extensions/table.min.js': ['<%= concat.table_ext.dest %>']
                }
            },
            twitter_ext: {
                files: {
                    'compressed/extensions/twitter.min.js': ['<%= concat.twitter_ext.dest %>']
                }
            }
        },
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
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

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-simple-mocha');

    // test
    grunt.registerTask('lint', ['jshint']);
    grunt.registerTask('test', ['simplemocha']);

    // build with uglify
    grunt.registerTask('build', ['concat', 'uglify']);

    // Build with closure compiler
    grunt.registerTask('build-with-closure', ['test', 'concat', 'closure-compiler']);

    // Default task(s).
    grunt.registerTask('default', []);

};
