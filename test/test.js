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
    expect( 1 );
    var form = $('#testFormRequiredText')[0];
    var v = $(form).validarium()[0];
    ok( !v.form(), 'Invalid form' );
});
