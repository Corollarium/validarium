module("validarium");

test("Constructor", function() {
	var v1 = $("#testFormRequiredText").validarium();
	var v2 = $("#testFormRequiredText").validarium();
	console.log(v1 == v2);
	equal( v1, v2, "Calling validarium() multiple times must return the same validator instance" );
});
	
test("validarium() without elements, with non-form elements", 0, function() {
	$("#doesntexist").validarium();
});

test("required(): text", function() {
	expect( 2 );
	var form = $('#testFormRequiredText');
	var v = $(form).validarium()[0];
	ok( !v.form(), 'Invalid form' );
	form.find('input').val('awerawer');
	ok( v.form(), 'Valid form' );
});

// TODO test("required(): select", function() {});

test("sameas(): ", function() {
	expect( 3 );
	var form = $('#testFormSameas');
	var v = $(form).validarium()[0];
	$('#sameaspw1').val('awerawer');
	ok( !v.form(), 'Invalid form' );
	$('#sameaspw2').val('zwer');
	ok( !v.form(), 'Invalid form' );
	$('#sameaspw2').val('awerawer');
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