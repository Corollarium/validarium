(function($) {
	$.fn.validarium = function(options) {
		var self = this;

		var settings = $.extend({}, $.fn.validarium.defaults, options || {});

		return $(this).each(function() {
			var $settings = jQuery.extend(true, {}, settings);

			var elements = $(this)
				.find("input, select, textarea")
				.not(":submit, :reset, :image, [disabled]")
				.not( $settings.ignore );
				
			elements.each(function() {
				var element = this;
				for (var i in element.attributes) {
					if (i.substr(0, 10) == "data-rules") {
						var rulename = i.substr(11);
						if (rulename in self.methods) {
							var value = self.elementValue(element);
							self.methods[rulename].call(self, value, element, this.attributes[i])
						}
					}
				}
			});
		});
	};
	
	$.fn.validarium.elementValue = function( element ) {
		var type = $(element).attr('type'),
			val = $(element).val();

		if ( type === 'radio' || type === 'checkbox' ) {
			return $('input[name="' + $(element).attr('name') + '"]:checked').val();
		}

		if ( typeof val === 'string' ) {
			return val.replace(/\r/g, "");
		}
		return val;
	};
	
	$.fn.validarium.defaults = {
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		onsubmit: true,
		ignore: ":hidden"
	};
	
	$.fn.validarium.methods = {
		required: function(value, element, param) {
			if (element.nodeName.toLowerCase() === "select" ) {
				// could be an array for select-multiple or a string, both are fine this way
				var val = $(element).val();
				return val && val.length > 0;
			}
			return $.trim(value).length > 0;
		},	

		minlength: function(value, element, param) {
			// TODO
			return $.trim(value).length >= param;
		},

		maxlength: function(value, element, param) {
			// TODO
			return $.trim(value).length <= param;
		},

		sameas: function(value, element, param) {
			// TODO
			return (value == $(param).val());
		},
		
		regex: function(value, element, param) {
			// TODO
		},
		
		email: function(value, element, param) {
			
		}
	};
		
}(jQuery));
