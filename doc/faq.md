## How do I get the Validarium object after it was initialized?
Easy: `$("form").validarium();` will return it. Take care because it is a list (because your query may have multiple forms), so you most likely would want something like

```
var validarium = $("#myform").validarium()[0];
```

## My form is dynamically modified. How to update validarium checks?
Easy: 

```
var validarium = $("#myform").validarium()[0].updateElementList();
```


## How do I get my callback called on form submission?
Use `settings.submitHandler`, which is called just after validation:

```
$(form).validarium({
	invalidHandler: function(form, validarium, event) {
		....
	},
	submitHandler: function(form, validarium, event) {
		....
	},
});
```

If you have already initialized Validarium, you can do something like

```
var validarium = $('#myform').validarium()[0];
validarium.settings.submitHandler = function(form, validarium, event) { ... };
```

## How do I get a callback before validation? How to do I override validarium in certain cases?
Use `settings.preSubmitHandler`, which is called just before validation. Say you have two buttons in your form, 'Save' and 'Delete'. 'Save' should validate the form, but 'Delete' will remove the entire entry and it does not matter if some field is invalid. You can do something like this:

```
<form>
....
<input type="submit" value="Save"/>
<button class="delete">Delete</button>
</form>
<script>
$(document).ready(function () {
	var buttondelete = false;
	$(document).on('click', 'button.delete', function (event) {
		buttondelete = true;
	});
	var validarium = $('form.validate').validarium({
		preSubmitHandler = function(form, validarium, event) {
			return (buttondelete ? 'override' : true);
		}
	});
});
</script>
```