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
	console.log(v);
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
	expect( 11 );
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

	ret = $.validarium.removeMethod("extramethod");
	ok( ret, 'Remove method' );
	form.find('input').val('aaa');
	ok( v.form(), 'Valid form' );
});

test("min: ", function() {
	expect( 2 );
	var form = $('#testFormMinMax');
	var v = $(form).validarium()[0];
	form.find('input').val('2');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('6');
	ok( v.form(), 'Valid form' );
});

test("max: ", function() {
	expect( 2 );
	var form = $('#testFormMinMax');
	var v = $(form).validarium()[0];
	form.find('input').val('2323');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('6');
	ok( v.form(), 'Valid form' );
});

test("email: ", function() {
	expect( 2 );
	var form = $('#testFormEmail');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer@corollarium.com');
	ok( v.form(), 'Valid form' );
});

test("url: ", function() {
	expect( 2 );
	var form = $('#testFormUrl');
	var v = $(form).validarium()[0];
	form.find('input').val('asfawer');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('http://www.corollarium.com');
	ok( v.form(), 'Valid form' );
/*	form.find('input').val('www.corollarium.com');
	ok( v.form(), 'Valid form' ); */
});

test("number: ", function() {
	expect( 3 );
	var form = $('#testFormNumber');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('234234');
	ok( v.form(), 'Valid form' );
	form.find('input').val('-234234.321');
	ok( v.form(), 'Valid form' );
});

test("digits: ", function() {
	expect( 3 );
	var form = $('#testFormDigits');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('234234');
	ok( v.form(), 'Valid form' );
	form.find('input').val('-234234.321');
	ok( !v.form(), 'Invalid form' );
});

test("date: ", function() {
	expect( 3 );
	
	var form = $('#testFormDate');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('02/20/2012');
	ok( v.form(), 'Valid form' );
	form.find('input').val('20/20/2020');
	ok( !v.form(), 'Invalid form' );
});

test("dateISO: ", function() {
	expect( 3 );
	
	var form = $('#testFormDateISO');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('2012/10/20');
	ok( v.form(), 'Valid form' );
	form.find('input').val('20/20/2020');
	ok( !v.form(), 'Invalid form' );
});

test("mask: ", function() {
	// TODO
});
