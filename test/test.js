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
	form.find('select').val('1');
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
	$('#equalTopw1').val('awerawer');
	ok( !v.form(), 'Invalid form' );
	$('#equalTopw2').val('zwer');
	ok( !v.form(), 'Invalid form' );
	$('#equalTopw2').val('awerawer');
	ok( v.form(), 'Valid form' );
});

test("minLength: ", function() {
	expect( 3 );
	var form = $('#testFormLength');
	var v = $(form).validarium()[0];
	form.find('input').val('a');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( !v.form(), 'invalid form' );
});

test("maxLength: ", function() {
	expect( 2 );
	var form = $('#testFormLength');
	var v = $(form).validarium()[0];
	form.find('input').val('ajwiorjaiwoejraoiwjerawoiera');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer');
	ok( v.form(), 'Valid form' );
	//TODO test empty
});

test("regexp: ", function() {
	expect( 5 );
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
	form.find('input').val('');
	ok( v.form(), 'Invalid form' );
});

test("regexp: invalid regexp", function() {
	expect( 1 );
	var form = $('#testFormRegexpInvalid');
	var v = $(form).validarium()[0];
	form.find('input').val('az');
	ok( !v.form(), 'Invalid form' );
});


test("addMethod: add ", function() {
	expect( 12 );
	ok( !$.validarium.addMethod(null, function(value, element, param) {1;}), 'Invalid name');
	ok( !$.validarium.addMethod("aaa", null), 'Invalid function');

	var form = $('#testFormAddMethod');
	var v = $(form).validarium()[0];
	var ret;
	ok( v.form(), 'Valid form' );

	ret = $.validarium.addMethod("extramethod", function(value, element, param) {
		return value == 'xxx';
	}, 'extramethod message');
	ok( ret, 'Add method' );
	ok( !v.form(), 'Invalid form' );
	ok(form.find('.validarium-error').text() == 'extramethod message', 'Invalid message');
	
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
	expect( 3 );
	var form = $('#testFormMinMax');
	var v = $(form).validarium()[0];
	form.find('input').val('2');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('6');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("max: ", function() {
	expect( 3 );
	var form = $('#testFormMinMax');
	var v = $(form).validarium()[0];
	form.find('input').val('2323');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('6');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("email: ", function() {
	expect( 3 );
	var form = $('#testFormEmail');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('zwer@corollarium.com');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("url: ", function() {
	expect( 3 );
	var form = $('#testFormUrl');
	var v = $(form).validarium()[0];
	form.find('input').val('asfawer');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('http://www.corollarium.com');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
/*	form.find('input').val('www.corollarium.com');
	ok( v.form(), 'Valid form' ); */
});

test("number: ", function() {
	expect( 4 );
	var form = $('#testFormNumber');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('234234');
	ok( v.form(), 'Valid form' );
	form.find('input').val('-234234.321');
	ok( v.form(), 'Valid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("digits: ", function() {
	expect( 4 );
	var form = $('#testFormDigits');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('234234');
	ok( v.form(), 'Valid form' );
	form.find('input').val('-234234.321');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("date: ", function() {
	expect( 8 );

	var form = $('#testFormDate');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('02/20/2012');
	ok( v.form(), 'Valid form' );
	form.find('input').val('02/29/2012');
	ok( v.form(), 'Valid date 02-29-2012' );
	form.find('input').val('02-01-2012');
	ok( !v.form(), 'Invalid date 02-01-2012');
	form.find('input').val('02.30.2013');
	ok( !v.form(), 'Invalid date 02.30.2013' );
	form.find('input').val('02|30|2013');
	ok( !v.form(), 'Invalid date 02|30|2013' );
	form.find('input').val('20/20/2020');
	ok( !v.form(), 'Invalid date 20/20/2020' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("dateISO: ", function() {
	expect( 8 );

	var form = $('#testFormDateISO');
	var v = $(form).validarium()[0];
	form.find('input').val('aaweraw');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('2012/10/20');
	ok( v.form(), 'Valid form' );
	form.find('input').val('20/20/2020');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('2020/99/99');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('2012-02-29');
	ok( v.form(), 'Valid form' );
	form.find('input').val('2013.02.30');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('2013|02|30');
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('');
	ok( v.form(), 'Valid form' );
});

test("mask: ", function() {
	// TODO
});


test("remote: ", function() {
	expect(4);
	start();
	$.mockjax({
		url: '/rest/test',
		contentType: 'text/json',
		responseTime: 1000,
		status: 404,
		responseText: {
			status: 'error',
			message: 'Error validing ajax'
		}
	});
	var form = $('#testFormRemote');
	var input = form.find('input');
	var v = $(form).validarium()[0];
	input.val('aaweraw');
	input.focus(); 	input.blur();
	ok( !v.form(), 'Invalid form before ajax request' );
	stop();
	
	ok( !v.form(), 'Invalid form after ajax request' );
	
	start();
	$.mockjax({
		url: '/rest/testok',
		contentType: 'text/json',
		responseTime: 1000,
		status: 200,
		responseText: {
			status: 'success',
			message: 'Validing ajax'
		}
	});
	input.attr('data-rules-remote', '{"url": "/rest/testok"}');
	input.focus(); 	input.blur();
	ok( !v.form(), 'Valid form before ajax request' );
	stop();
	ok( v.form(), 'Valid form after ajax request' );
});


test("message: ", function() {
	expect( 7 );
	var form = $('#testFormRequiredText');
	$(form).validarium();
	var input = $(form.find('input[name="a"]'));
	input.focus(); 	input.blur();
	equal( $.validarium.messages.required, form.find('.validarium-error').text(), 'Default message input');

	var form2 = $('#testFormRequiredCheckbox');
	$(form2).validarium();
	var checkbox = $(form2.find('input[type=checkbox]'));
	checkbox.focus(); 	checkbox.blur();
	equal( $.validarium.messages.required, form2.find('.validarium-error').text(), 'Default message checkbox');

	$.validarium.messages.required = 'Test';
	input.focus(); 	input.blur();
	equal( 'Test', form.find('.validarium-error').text(), 'Change default message');

	checkbox.focus(); 	checkbox.blur();
	equal( 'Test', form2.find('.validarium-error').text(), 'Change default message checkbox');

	input.attr('data-rules-required-message', 'Specific message');
	input.focus(); 	input.blur();
	equal( 'Specific message', form.find('.validarium-error').text(), 'Especific message');

	checkbox.focus(); 	checkbox.blur();
	equal( 'Test', form2.find('.validarium-error').text(), 'Maintain default message checkbox');

	form = $('#testFormLength');
	$(form).validarium();
	input = $(form.find('input'));
	input.focus(); 	input.blur();
	var minvalue = input.attr('data-rules-minlength');
	var expected = $.validarium.messages.minlength.replace("{minlength}", minvalue);
	var found = form.find('.validarium-error').text();
	equal( expected, found, 'Customizing min message');

});

test("ignore and noignore: ", function() {
	expect( 8 );

	var form = $('#testFormIgnore');
	var v = $(form).validarium()[0];

	ok( !v.form(), 'All empty' );
	ok( form.find('[name=i1]').hasClass('error'), 'Empty require visible' );
	ok( !form.find('[name=i2]').hasClass('error'), 'Empty require invisible' );
	ok( form.find('[name=i3]').hasClass('error'), 'Empty require invisible but noignore' );

	form.find('input').val('test');
	ok( v.form(), 'All empty correct' );
	ok( !form.find('[name=i1]').hasClass('error'), 'Empty require visible correct' );
	ok( !form.find('[name=i2]').hasClass('error'), 'Empty require invisible correct' );
	ok( !form.find('[name=i3]').hasClass('error'), 'Empty require invisible but noignore correct' );
});


test("InvalidHandler and SubmitHandler: ", function() {
	expect( 5 );

	var form = $('#testFormRequiredText');
	var invalidHandler = false;
	var submitHandler = false;

	var v = $(form).validarium({
		invalidHandler: function(frm, validarium) {
			invalidHandler = true;
		},
		submitHandler: function(frm, validarium) {
			submitHandler = true;
		},
	})[0];

	var input = $(form.find('input[name="a"]'));
	input.val("");
	ok( !v.form(), 'Invalid form' );

	ok( input.hasClass('error'), 'Error class' );
	ok( invalidHandler, 'Invalid handler called');

	input.val('awerawer');
	ok( v.form(), 'Valid form' );
	form.submit();

	ok( submitHandler, 'Submit handler called');
});


test("InvalidHandlerField: ", function() {
	expect( 6 );

	var form = $('#testFormFocus');
	var v = $(form).validarium()[0];

	var qtd = 0;
	form.find('input').one('invalid-field', function (){
		qtd++;
	});

	ok( !v.form(), 'Invalid form' );
	ok( qtd == 3, 'All indiviual handlers');

	qtd = 0;
	form.find('[name=f1],[name=f2]').one('invalid-field', function (){
		qtd++;
	});
	var f1 = form.find('[name=f1]');
	f1.val('something');
	ok( !v.form(), 'Invalid form' );
	ok( f1.hasClass('valid'), 'valid field 1' );
	ok( form.find('[name=f2]').hasClass('error'), 'invalid field 2' );
	equal( qtd, 1, '1 and 2 Individual handlers');

	f1.val('');
});


test("Focus: ", function() {
	expect( 12 );

	var form = $('#testFormFocus');
	var v = $(form).validarium()[0];

	form.find('input').focus(function (){
		$(this).addClass('focus');
	}).blur(function (){
		$(this).removeClass('focus');
	});

	var f1 = form.find('[name=f1]');
	var f2 = form.find('[name=f2]');
	var f3 = form.find('[name=f3]');

	ok( !v.form(), 'Invalid form' );
	form.submit();

	ok(f1.hasClass("focus"), 'First element with focus');
	ok(!f2.hasClass("focus"), 'Second element without focus');
	ok(!f3.hasClass("focus"), 'Third element without focus');

	f2.val('something');
	ok( !v.form(), 'Invalid form' );
	ok(f1.hasClass("focus"), 'First element with focus 2');
	ok(!f2.hasClass("focus"), 'Second element without focus 2');
	ok(!f3.hasClass("focus"), 'Third element without focus 2');

	f1.val('something');
	f2.val('');
	ok( !v.form(), 'Invalid form' );
	form.submit();
	ok(!f1.hasClass("focus"), 'First element without focus');
	ok(f2.hasClass("focus"), 'Second element with focus');
	ok(!f3.hasClass("focus"), 'Third element without focus');
});

