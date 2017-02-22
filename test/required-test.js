module("required rules");

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