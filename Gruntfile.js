/*jshint debug:true, forin:true, noarg:true, noempty:true, eqeqeq:true, loopfunc:true, bitwise:true, strict:false,
undef:true, unused:true, curly:true, browser:true, jquery:true, node:true, indent:4, maxerr:50, globalstrict:true */

module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
		},
		nodeunit: {
			all: ['tests/*.js']
		},
		docco: {
			debug: {
				src: ['examples/**/*.js'],
				options: {
					output: 'docs',
					layout: 'linear'
				}
			}
		}/*,
		'gh-pages': {
			options: {
				base: 'docs'//
			},
			src: ['**']
		}*/
	});
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-nodeunit');
	grunt.loadNpmTasks('grunt-docco');
	//grunt.loadNpmTasks('grunt-gh-pages');
	grunt.registerTask('default', ['jshint', 'nodeunit', 'docco'/*, 'gh-pages'*/]);
};