'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    config: grunt.file.readJSON('config.json'),

    watch: {
      scripts: {
        files: ['<%= config.src %>/scripts/**/*.js'],
        tasks: ['newer:eslint:all', 'browserify:server']
      },
      sass: {
        files: ['<%= config.src %>/styles/**/*.{scss,sass}'],
        tasks: ['sass', 'postcss']
      },
      styles: {
        files: ['<%= config.src %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'postcss']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      }
    },

    browserSync: {
      options: {
        notify: false,
        background: true,
        watchOptions: {
          ignored: ''
        }
      },
      livereload: {
        options: {
          files: [
            '<%= config.src %>/{,*/}*.html',
            '<%= config.tmp %>/styles/{,*/}*.css',
            '<%= config.src %>/images/{,*/}*',
            '<%= config.tmp %>/scripts/{,*/}*.js'
          ],
          host: 'localhost',
          port: 9000,
          server: {
            baseDir: ['<%= config.tmp %>', '<%= config.src %>'],
            routes: {
              '/bower_components': './bower_components'
            }
          },
          ghostMode: {
            clicks: true,
            forms: true,
            scroll: true
          }
        }
      },
      dist: {
        options: {
          background: false,
          server: '<%= config.dist %>'
        }
      }
    },

    clean: {
      options: {
        force: true
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.tmp %>',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '<%= config.tmp %>'
    },

    eslint: {
      all: [
        'Gruntfile.js',
        '<%= config.src %>/scripts/{,*/}*.js',
        '!<%= config.src %>/scripts/vendor/*'
      ]
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR'],
            map: false
          })
        ]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.tmp %>/styles/',
          src: '{,*/}*.css',
          dest: '<%= config.tmp %>/styles/'
        }]
      }
    },

    sass: {
      options: {
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true,
        includePaths: ['.']
      },
      dev: {
        options: {
          outputStyle: 'expanded',
        },
        files: [{
          expand: true,
          cwd: '<%= config.src %>/styles',
          src: ['*.{scss,sass}'],
          dest: '<%= config.tmp %>/styles',
          ext: '.css'
        }]
      },
      dist: {
        options: {
          outputStyle: 'compressed',
          sourceMap: false,
          sourceMapEmbed: false,
          sourceMapContents: false
        },
        files: [{
          expand: true,
          cwd: '<%= config.src %>/styles',
          src: ['*.{scss,sass}'],
          dest: '<%= config.dist %>/styles',
          ext: '.css'
        }]
      }
    },

    browserify: {
      options: {
        keepAlive: false,
        watch: false
      },
      server: {
        files: '<%= config.scripts.server %>'
      },
      dist: {
        files: '<%= config.scripts.dist %>'
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/styles',
          src: ['*.css', '!*.min.css'],
          dest: '<%= config.dist %>/styles',
          ext: '.css'
        }]
      }
    },

    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.dist %>/scripts',
          src: '**/*.js',
          dest: '<%= config.dist %>/scripts'
        }]
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.src %>/images',
          src: '**/*.svg',
          dest: '<%= config.dist %>/images'
        }]
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.src %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,txt,xml}',
            'images/**/*.webp',
            '{,*/}*.html',
            'styles/fonts/**/*.*',
            'fonts/**/*.*'
          ]
        }]
      },
      files: {
        files: '<%= config.files %>'
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.src %>/styles',
        dest: '<%= config.tmp %>/styles/',
        src: '{,*/}*.css'
      }
    },

    concurrent: {
      server: [
        'copy:files',
        'sass:dev'
      ],
      dist: [
        'copy:files',
        'sass:dist',
        'imagemin',
        'svgmin'
      ]
    }
  });

  grunt.registerTask('serve', 'Start the server and preview your app', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['dist', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'browserify:server',
      'postcss',
      'browserSync:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('dist', [
    'clean:dist',
    'concurrent:dist',
    'postcss',
    'cssmin',
    'browserify:dist',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'newer:eslint',
    'dist'
  ]);
};