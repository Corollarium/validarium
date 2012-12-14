(function($) {
	$.fn.validarium = function(options) {
		var self = this;

		if (!this.length) {
			$.validarium.debug("No elements");
			return;
		}
		
		var settings = $.extend({}, $.fn.validarium.defaults, options || {});

		// check if validarium for this form was already created
		// TODO: if applied to multiple items?

		var ret = [];
		$(this).each(function() {
			var instance = $.data(this, 'validarium');
			if (!instance) {
				instance = new $.validarium(settings, this);
				$.data(this, 'validarium', instance);
			}
			ret.push(instance);
		});
		return ret;
	};
	
$.validarium = function( options, form ) {
	this.settings = $.extend( true, {}, $.validarium.defaults, options );
	this.elements = $(form)
		.find("input, select, textarea")
		.not(":submit, :reset, :image, [disabled]")
		.not( this.settings.ignore );

	// Add novalidate tag if HTML5.
	$(form).attr('novalidate', 'novalidate');
};

$.extend($.validarium, {
	defaults: {
		debug: false,
		errorClass: "error",
		validClass: "valid",
		errorElement: "label",
		focusInvalid: true,
		onsubmit: true,
		ignore: ":hidden"
	},

	debug: function(message) {
		if (this.debug) {
			console.warn("Validarium:" + message);
		}
	},

	prototype: {
		init: function() {
			
		},
		
		/**
		 * Validates the form
		 * @return boolean True if ok, false ir
		 */
		form: function() {
			var retval = true;
			var self = this;

			this.elements.each(function() {
				var element = this;
				var attributes = element.attributes;
				for (var i = 0; i < attributes.length; i++) {
					var name = attributes.item(i).nodeName;
					var rulevalue = attributes.item(i).nodeValue;
					
					if (name.substr(0, 10) == "data-rules") {
						var rulename = name.substr(11);
						if (rulename in self.methods) {
							var value = self.elementValue(element);
							var valid = self.methods[rulename].call(self, value, element, rulevalue);
							if (!valid) {
								$(element).addClass(self.settings.errorClass);
							}
							retval &= valid;
						}
					}
				}
			});
			return retval;
		},
		
		/**
		 * Returns the value of an element, dealing with radio/checkbox/etc.
		 * 
		 * @return string
		 */
		elementValue: function(element) {
			var type = $(element).attr('type'),
				val = $(element).val();
	
			if ( type === 'radio' || type === 'checkbox' ) {
				return $('input[name="' + $(element).attr('name') + '"]:checked').val();
			}
	
			if ( typeof val === 'string' ) {
				return val.replace(/\r/g, "");
			}
			return val;
		},
			
		methods: {
			required: function(value, element, param) {
				if (element.nodeName.toLowerCase() === "select" ) {
					// could be an array for select-multiple or a string, both are fine this way
					var val = $(element).val();
					return val && val.length > 0;
				}
				return $.trim(value).length > 0;
			},	
	
			minlength: function(value, element, param) {
				return $.trim(value).length >= param;
			},
	
			maxlength: function(value, element, param) {
				return $.trim(value).length <= param;
			},
	
			sameas: function(value, element, param) {
				// TODO
				return (value == $(param).val());
			},
			
			regexp: function(value, element, param) {
				try {
					var grep = new RegExp(param); // TODO: escaping, modifiers
					var results = grep.exec(value);
					return (results != null);
				}
				catch (e) {
					this.debug('Invalid regex');
				}
				return false;
			},
			
			email: function(value, element, param) {
				
			}
		}
	}
});

}(jQuery));
