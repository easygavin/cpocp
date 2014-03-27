/**
 * Created by Gavin on 14-03-11.
 */
module.exports = function (grunt) {

    // 项目配置
    grunt.initConfig({
        pkg:grunt.file.readJSON('package.json'),
        /* requirejs */
        requirejs:{
            compile:{
                options:{
                    baseUrl:"js",
                    mainConfigFile:"js/main.js",
                    dir:'dist/js/',
                    done:function (done, output) {
                        var duplicates = require('rjs-build-analysis').duplicates(output);

                        if (duplicates.length > 0) {
                            grunt.log.subhead('Duplicates found in requirejs build:');
                            grunt.log.warn(duplicates);
                            done(new Error('r.js built duplicate modules, please check the excludes option.'));
                        }

                        done();
                    }
                }
            }
        },
        /* concat */
        concat:{
            options:{
                separator:';'
            },
            build:{
                src:[],
                dest:''
            }
        },
        /* uglify */
        uglify:{
            options:{
                banner:'/*! ' +
                    'Author: Gavin ' +
                    'Date: <%= grunt.template.today("yyyy-mm-dd") %> */'
            },
            files:{
                expand:true, //启用动态扩展
                cwd:'js/', //批匹配相对js目录的src来源
                src:'**/*.js', //实际的匹配模式
                dest:'dist/js/', //目标路径前缀
                ext:'.js' //目标文件路径中文件的扩展名.
            }
        },
        /* cssmin */
        cssmin:{
            minify:{
                options:{
                    banner:'/*! ' +
                        'Author: Gavin ' +
                        'Date: <%= grunt.template.today("yyyy-mm-dd") %> */'
                },
                files:[
                    {
                        expand:true, //启用动态扩展
                        cwd:'css/', //批匹配相对css目录的src来源
                        src:'**/*.css', //实际的匹配模式
                        dest:'dist/css/', //目标路径前缀
                        ext:'.css' //目标文件路径中文件的扩展名.
                    }
                ]
            },
            combine:{
                options:{
                    banner:'/*! ' +
                        'Author: Gavin ' +
                        'Date: <%= grunt.template.today("yyyy-mm-dd") %> */'
                },
                files:[
                    {'dist/css/phone.css':['css/base.css', 'css/phone.css']},
                    {'dist/css/tablet.css':['css/base.css', 'css/tablet.css']},
                    {'dist/css/media.css':['css/media.css']}
                ]
            }
        },
        /* imagemin */
        imagemin:{
            dynamic:{
                options:{
                    optimizationLevel:3 //定义 PNG 图片优化水平
                },
                files:[
                    {
                        expand:true,
                        cwd:'images/',
                        src:['**/*.{png,jpg,gif}'],
                        dest:'dist/images/'
                    }
                ]
            }
        },
        /* htmlmin */
        htmlmin:{
            options:{
                removeComments:true,
                collapseWhitespace:true
            },
            files:{
                expand:true, //启用动态扩展
                cwd:'views/', //批匹配相对views目录的src来源
                src:'**/*.html', //实际的匹配模式
                dest:'dist/views/' //目标路径前缀
            }
        },
        /* jst */
        jst:{
            compile:{
                options:{
                    templateSettings:{
                        interpolate:/\{\{(.+?)\}\}/g
                    }
                },
                files:{
                    'dist/compiled/templates.js':['dist/views/**/*.html']
                }
            }
        },
        /* jshint */
        jshint:{
            files:['Gruntfile.js', 'js/**/*.js'],
            options:{
                // options here to override JSHint defaults
                globals:{
                    jQuery:true,
                    console:true,
                    module:true,
                    document:true
                }
            }
        },
        /* clean */
        clean:{
            foo:{
                src:['dist/**/*'],
                filter:'isFile'
            }
        },
        /* watch */
        watch:{
            files:['<%= jshint.files %>'],
            tasks:['jshint']
        }
    });
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-jst');

    // 默认任务
    grunt.registerTask('default', ['clean', 'requirejs', 'cssmin:minify', 'htmlmin', 'imagemin']);
    grunt.registerTask('image', ['imagemin']);
    grunt.registerTask('check', ['jshint']);

};