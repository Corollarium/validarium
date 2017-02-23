module("remote");

test("remote: false", function() {
	expect(2);
	$.mockjax({
		url: '/rest/test',
		contentType: 'text/json',
		responseTime: 300,
		status: 404,
		responseText: {
			status: 'error',
			message: 'Error validing ajax'
		}
	});
	var $form = $('#testFormRemote');
	var $input = $form.find('input');
	var v = $form.validarium()[0];
	$input.val('aaweraw');
	$input.focus();
	$input.blur();
	ok(!v.form('onblur'), 'Invalid form before ajax request');
	stop();

	setTimeout(function() {
		start();
		ok(!v.form('onblur'), 'Invalid form after ajax request');
	}, 500);
});

test("remote: true", function() {
	expect(2);
	$.mockjax({
		url: '/rest/testok',
		contentType: 'text/json',
		responseTime: 300,
		status: 200,
		responseText: {
			status: 'success',
			message: 'Validing ajax'
		}
	});
	var $form = $('#testFormRemote');
	var $input = $form.find('input');
	var v = $form.validarium()[0];
	$input.val('aaweraw');
	$input.focus();
	$input.blur();
	$input.attr('data-rules-remote', '{"url": "/rest/testok"}');
	$input.focus();
	$input.blur();
	ok( !v.form('onblur'), 'Valid form before ajax request' );

	setTimeout(function() {
		start();
		ok( v.form(), 'Valid form after ajax request' );
	}, 500);
	stop();
});