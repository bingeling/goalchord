module.exports = function(grunt){
    "use strict";

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        cssmin: {
            build: {
                src: ['assets/css/**/*.css'],
                dest: 'build/<%= pkg.name %>.css'
            }
        },
        concat: {
            dist: {
                src: ['assets/js/libs/underscore-min.js', 'assets/js/libs/d3/d3.js', 'assets/js/*.js'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            build: {
                files: {
                    'build/<%= pkg.name %>.min.js': ['build/<%= pkg.name %>.js']
                }
            }
        },
        htmlhint: {
            options: {
                'tag-pair': true,
                'tagname-lowercase': true,
                'attr-lowercase': true,
                'attr-value-double-quotes': true,
                'doctype-first': true,
                'spec-char-escape': true,
                'id-unique': true
            },
            build: {
                src: ['index.html']
            }
        },
        watch: {
            html: {
                files: ['index.html'],
                tasks: ['htmlhint']
            },
            js: {
                files: ['assets/js/base.js'],
                tasks: ['uglify']
            },
            css: {
                files: ['assets/css/**/*.css'],
                tasks: ['cssmin']
            }
        }
    });

    grunt.loadNpmTasks("grunt-htmlhint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask('default', ['htmlhint', 'concat', 'uglify', 'cssmin']);

};