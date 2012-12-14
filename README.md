Validarium
==========

A JQuery validation plugin: practical, simple and extensible. Validates your existing forms in HTML without headaches.

Some ideas and code borrowed from jquery-validate (https://github.com/jzaefferer/jquery-validation/).

## Getting Started

Include jQuery and Validarium. Then apply Validarium to the form.

```html
<form>
	....
</form>
<script src="jquery.js"></script>
<script src="jquery.validarium.js"></script>
<script>
$(document).ready(function() {
	$("form").validarium();
});
</script>
```

## Examples

### Required fields

```html
<form>
	<input type="text" data-rules-required="true" />
</form>
```

### Minlength, maxlength

```html
<form>
	<input type="text" data-rules-minlength="5" data-rules-maxlength="10" />
</form>
```

### Two fields must match
```html
<form>
	<input type="password" id="pw1" data-rules-sameas="#pw2"/>
	<input type="password" id="pw2" data-rules-sameas="#pw1"/>
</form>
```

### Field must obey a regex
```html
<form>
	<input type="text" data-rules-regex="([a-zA-Z]{5})" />
</form>
```


## License
Copyright (c) 2012 Corollarium Tecnologia http://www.corollarium.com
Licensed under the MIT license.
