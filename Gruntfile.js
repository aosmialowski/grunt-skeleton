'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    app: {
      src: '.',
      dist: './dist',
      tmp: '.tmp'
    },

    watch: {
      scripts: {
        files: ['<%= app.src %>/scripts/{,*/}*.js'],
        tasks: ['newer:eslint:all']
      },
      sass: {
        files: ['<%= app.src %>/scss/{,*/}*.scss'],
        tasks: ['sass', 'postcss:dev']
      },
      styles: {
        files: ['<%= app.src %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'postcss:dev']
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
            '<%= app.src %>/{,*/}*.html',
            '<%= app.tmp %>/styles/{,*/}*.css',
            '<%= app.src %>/images/{,*/}*',
            '<%= app.tmp %>/scripts/{,*/}*.js'
          ],
          host: '192.168.33.88',
          port: 9000,
          server: {
            baseDir: ['<%= app.tmp %>', '<%= app.src %>'],
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
          server: '<%= app.dist %>'
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
            '<%= app.tmp %>',
            '<%= app.dist %>/*',
            '!<%= app.dist %>/.git*'
          ]
        }]
      },
      server: '<%= app.tmp %>'
    },

    eslint: {
      target: [
        'Gruntfile.js',
        '<%= app.src %>/scripts/{,*/}*.js',
        '!<%= app.src %>/scripts/vendor/*'
      ]
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')({
            browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']
          })
        ]
      },
      dev: {
        files: [{
          expand: true,
          cwd: '<%= app.dist %>/styles/',
          src: '{,*/}*.css',
          dest: '<%= app.tmp %>/styles/'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app.dist %>/styles/',
          src: '{,*/}*.css',
          dest: '<%= app.dist %>/styles/'
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
          cwd: '<%= app.src %>/scss',
          src: ['*.{scss,sass}'],
          dest: '<%= app.tmp %>/styles',
          ext: '.css'
        }]
      },
      dist: {
        options: {
          outputStyle: 'compressed',
        },
        files: [{
          expand: true,
          cwd: '<%= app.src %>/scss',
          src: ['*.{scss,sass}'],
          dest: '<%= app.dist %>/styles',
          ext: '.css'
        }]
      }
    },

    requirejs: {
      main: {
        options: {
          mainConfigFile: '<%= app.src %>/scripts/main.js',
          appDir: '<%= app.src %>/scripts',
          baseUrl: '.',
          dir: '<%= app.dist %>/scripts',
          optimize: "none",
          modules: [
            {
              name: 'main',
              include: ['jquery', 'bootstrap']
            },
            {
              name: 'foobar',
              create: true,
              include: ['foo', 'bar'],
              exclude: ['main']
            },
            {
              name: 'foo',
              exclude: ['main']
            }
          ]
        }
      }
    },

    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: '<%= app.src %>/styles',
          src: ['*.css', '!*.min.css'],
          dest: '<%= app.dist %>/styles',
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
          cwd: '<%= app.dist %>/scripts',
          src: '**/*.js',
          dest: '<%= app.dist %>/scripts'
        }]
      }
    },

    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app.src %>/images',
          src: '**/*.{png,jpg,jpeg,gif}',
          dest: '<%= app.dist %>/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= app.src %>/images',
          src: '**/*.svg',
          dest: '<%= app.dist %>/images'
        }]
      }
    },

    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= app.src %>',
          dest: '<%= app.dist %>',
          src: [
            '*.{ico,txt,xml}',
            'images/**/*.{webp}',
            'styles/fonts/**/*.*',
            'fonts/**/*.*'
          ]
        }]
      }
    },

    concurrent: {
      server: [
        'sass:dev'
      ],
      dist: [
        'sass:dist',
        'imagemin',
        'svgmin'
      ]
    }
  });

  grunt.registerTask('serve', 'Start the server and preview your app', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'browserSync:dist']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'postcss:dev',
      'browserSync:livereload',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'concurrent:dist',
    'postcss:dist',
    'cssmin',
    'requirejs',
    'uglify',
    'copy:dist'
  ]);

  grunt.registerTask('default', [
    'newer:eslint',
    'build'
  ]);
};