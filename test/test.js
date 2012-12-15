module("validarium");

test("Constructor", function() {
	var v1 = $("#testFormRequiredText").validarium();
	var v2 = $("#testFormRequiredText").validarium();
	equal( v1[0], v2[0], "Calling validarium() multiple times must return the same validator instance" );
});

test("validarium() without elements, with non-form elements", 0, function() {
	$("#doesntexist").validarium();
});

test("required(): text", function() {
	expect( 6 );
	var form = $('#testFormRequiredText');
	var v = $(form).validarium()[0];
	var input = $(form.find('input[name="a"]'));
	ok( !v.form(), 'Invalid form' );
	ok( input.hasClass('error'), 'Error class' );
	ok( !input.hasClass('valid'), 'Valid class' );
	input.val('awerawer');
	ok( v.form(), 'Valid form' );
	ok( !input.hasClass('error'), 'Error class' );
	ok( input.hasClass('valid'), 'Valid class' );
});

test("required(): select", function() {
	expect( 2 );
	var form = $('#testFormRequiredOption');
	var v = $(form).validarium()[0];
	ok( !v.form(), 'Invalid form' );
	form.find('select option[value="1"]').attr('selected', 'selected');
	ok( v.form(), 'Valid form' );
});

test("required(): checkbox", function() {
	expect( 2 );
	var form = $('#testFormRequiredCheckbox');
	var v = $(form).validarium()[0];
	ok( !v.form(), 'Invalid form' );
	form.find('input').attr('checked','checked');
	ok( v.form(), 'Valid form' );
});

test("equalTo(): ", function() {
	expect( 3 );
	var form = $('#testFormequalTo');
	var v = $(form).validarium()[0];
	console.log($('#equalTopw1'));
	console.log($('#equalTopw2'));
	$('#equalTopw1').val('awerawer');
	ok( !v.form(), 'Invalid form' );
	$('#equalTopw2').val('zwer');
	ok( !v.form(), 'Invalid form' );
	$('#equalTopw2').val('awerawer');
	ok( v.form(), 'Valid form' );
});

test("minLength: ", function() {
	expect( 2 );
	var form = $('#testFormLength');
	var v = $(form).validarium()[0];
	form.find('input').val('a');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer');
	ok( v.form(), 'Valid form' );
});

test("maxLength: ", function() {
	expect( 2 );
	var form = $('#testFormLength');
	var v = $(form).validarium()[0];
	form.find('input').val('ajwiorjaiwoejraoiwjerawoiera');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer');
	ok( v.form(), 'Valid form' );
});

test("regexp: ", function() {
	expect( 4 );
	var form = $('#testFormRegexp');
	var v = $(form).validarium()[0];
	form.find('#regexnoflags').val('az');
	form.find('#regexflags').val('az');
	ok( !v.form(), 'Invalid form' );
	form.find('#regexnoflags').val('zwe93');
	form.find('#regexflags').val('zwe93');
	ok( v.form(), 'Valid form' );
	form.find('#regexflags').val('ZWE93');
	ok( v.form(), 'Valid form' );
	form.find('#regexnoflags').val('ZWE93');
	ok( !v.form(), 'Invalid form' );
});

test("regexp: invalid regexp", function() {
	expect( 1 );
	var form = $('#testFormRegexpInvalid');
	var v = $(form).validarium()[0];
	form.find('input').val('az');
	ok( !v.form(), 'Invalid form' );
});


test("addMethod: add ", function() {
	expect( 10 );
	ok( !$.validarium.addMethod(null, function(value, element, param) {1;}), 'Invalid name');
	ok( !$.validarium.addMethod("aaa", null), 'Invalid function');

	var form = $('#testFormAddMethod');
	var v = $(form).validarium()[0];
	var ret;
	ok( v.form(), 'Valid form' );

	ret = $.validarium.addMethod("extramethod", function(value, element, param) {
		return value == 'xxx';
	});
	ok( ret, 'Add method' );
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('xxx');
	ok( v.form(), 'Valid form' );

	// replace and don't set param
	ret = $.validarium.addMethod("extramethod", function(value, element) {
		return value == 'yyy';
	});
	ok( ret, 'Replace method' );
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('yyy');
	ok( v.form(), 'Valid form' );

	$.validarium.removeMethod("extramethod");
	form.find('input').val('aaa');
	ok( v.form(), 'Valid form' );
});

test("min: ", function() {
	// TODO
});

test("max: ", function() {
	// TODO
});

test("email: ", function() {
	// TODO
});

test("url: ", function() {
	// TODO
});

test("number: ", function() {
	// TODO
});

test("digits: ", function() {
	// TODO
});

test("date: ", function() {
	// TODO
});

test("dateISO: ", function() {
	// TODO
});

test("mask: ", function() {
	// TODO
});
