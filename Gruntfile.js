module.exports = function (grunt) {
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jshint: {
			all: ['*.js', 'src/*.js', 'test/*.js']
		},
		qunit: {
			all: ['test/index.html']
		},
		jsdoc : {
			dist : {
				src: ['src/jquery.validarium.js'],
				options: {
					destination: 'out'
				}
			}
		}
	});

	grunt.registerTask('test', ['qunit']);
	grunt.registerTask('doc', ['jsdoc']);
	grunt.registerTask('default', ['test']);
};