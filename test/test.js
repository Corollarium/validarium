module("validarium");

test("Constructor", function() {
    var v1 = $("#testFormRequiredText").validarium();
    var v2 = $("#testFormRequiredText").validarium();
    equal( v1, v2, "Calling validarium() multiple times must return the same validator instance" );
    equal( v1.elements().length, 3, "validator elements" );
});

test("validarium() without elements, with non-form elements", 0, function() {
    $("#doesntexist").validarium();
});

test("required(): text", function() {
    expect( 3 );
    var form = $('#testFormRequiredText')[0];
    var v = $(form).validarium();
    ok( !v.form(), 'Invalid form' );
});
