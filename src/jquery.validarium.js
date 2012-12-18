/**
 * Validarium: a jquery plugin for validating forms
 *
 * https://github.com/Corollarium/validarium
 *
 * Copyright 2012 Corollarium Tecnologia: http://www.corollarium.com
 *
 * Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
 *
 * Parts of this code from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 */

(function($) {
	$.fn.validarium = function(options) {
		var self = this;

		if (!this.length) {
			$.validarium.prototype.debug("No elements");
			return null;
		}

		var settings = $.extend({}, $.fn.validarium.defaults, options || {});

		var ret = [];
		$(this).each(function() {
			// check if validarium for this form was already created
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

	this.currentForm = $(form);

	// TODO: does not handle dynamic forms!
	this.elements = this.currentForm
		.find("input, select, textarea")
		.not(":submit, :reset, :image, [disabled]")
		.not( this.settings.ignore );

	// Add novalidate tag if HTML5.
	this.currentForm.attr('novalidate', 'novalidate');

	this.init();
};

$.extend($.validarium, {
	defaults: {
		debug: false, /// if true, print
		errorClass: "error", /// class added to invalid elements.
		validClass: "valid", /// class added to valid elements.
		errorElement: "label", /// TODO element used to display the error message
		focusInvalid: true, /// if true, focus
		onsubmit: true,
		ignore: ":hidden"
	},

	/**
	 * Add a new method to validarium list. If a method already exists it is
	 * replaced.
	 *
	 * @param string name The method name
	 * @param function callback a function(value, element, param) or function(value, element)
	 * @param string message
	 * @param string eventtype
	 * @return boolean
	 */
	addMethod: function(name, callback, message, eventtype) {
		if (!name || !$.isFunction(callback)) {
			return false;
		}
		// TODO: message

		if (eventtype == undefined) {
			eventtype = 'ontype';
		}
		else if (!eventtype in ['ontype', 'onblur', 'onsubmit']) {
			return false;
		}
		$.validarium.prototype[eventtype][name] = callback;
		return true;
	},

	/**
	 * Remove a method by name. If it does not exist, nothing happens.
	 *
	 * @param string name
	 */
	removeMethod: function(name, eventtype) {
		var types = ['ontype', 'onblur', 'onsubmit'];
		if (eventtype == undefined) {
			var retval = true;
			for (var i in types) {
				retval = this.removeMethod(name, types[i]);
				if (!retval) break;
			}
			return retval;
		}
		else if (!eventtype in types) {
			return false;
		}
		delete $.validarium.prototype[eventtype][name];
		return true;
	},

	prototype: {
		init: function() {
/*			this.currentForm
			.validateDelegate(":text, [type='password'], [type='file'], select, textarea, " +
				"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
				"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
				"[type='week'], [type='time'], [type='datetime-local'], " +
				"[type='range'], [type='color'] ",
				"focusin focusout keyup", delegate)
			.validateDelegate("[type='radio'], [type='checkbox'], select, option", "click", delegate);
*/
		},

		settings: {},

		debug: function(message) {
			if (('debug' in this.settings && this.settings.debug) || $.validarium.defaults.debug) {
				console.warn("Validarium:" + message);
			}
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
				var firstinvalid = null; // first invalid element, for focus()

				for (var i = 0; i < attributes.length; i++) {
					var name = attributes.item(i).nodeName.toLowerCase();
					var rulevalue = attributes.item(i).nodeValue;

					if (name.substr(0, 10) == "data-rules") {
						var rulename = name.substr(11);
						var method = self.getMethod(rulename);
						if (!method) {
							continue;
						}
						var value = self.elementValue(element);
						var valid = method.call(self, value, element, rulevalue);
						if (!valid) {
							$(element).removeClass(self.settings.validClass).addClass(self.settings.errorClass);
							if (!firstinvalid) {
								firstinvalid = element;
							}
						}
						else {
							$(element).removeClass(self.settings.errorClass).addClass(self.settings.validClass);
						}
						retval &= valid;
					}
				}

				if (self.settings.focusInvalid && firstinvalid) {
					firstinvalid.focus();
				}
			});

			if (!retval) {
				this.currentForm.triggerHandler("invalid-form", [this]);
			}
			return retval;
		},

		/**
		 * Returns the callback
		 *
		 * @param methodname
		 * @param eventtype
		 * @returns
		 */
		getMethod: function(methodname, eventtype) {
			switch (eventtype) {
			case undefined:
			case null:
			case 'ontype':
				if (methodname in this.ontype) return this.ontype[methodname];
			case 'onblur':
				if (methodname in this.onblur) return this.onblur[methodname];
			case 'onsubmit':
				if (methodname in this.onsubmit) return this.onsubmit[methodname];
			default:
				return null;
			}
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

		/**
		 * Methods that should be called whenever a key is typed (or clicks for some
		 * elements like select), on blur events or on submit.
		 */
		ontype: {
			required: function(value, element, param) {
				if (param.toLowerCase() != 'true') {
					return true;
				}
				if (element.nodeName.toLowerCase() === "select" ) {
					// could be an array for select-multiple or a string, both are fine this way
					var val = $(element).val();
					return val && val.length > 0;
				}
				console.log(element.nodeName, $.trim(value).length);
				return $.trim(value).length > 0;
			},

			minlength: function(value, element, param) {
				return $.trim(value).length >= param;
			},

			maxlength: function(value, element, param) {
				return $.trim(value).length <= param;
			},

			equalto: function(value, element, param) {
				return (value == $(param).val());
			},

			regexp: function(value, element, param) {
				try {
					var flags = $(element).attr('data-rules-regexp-flags');
					var grep = new RegExp(param, flags); // TODO: escaping?
					var results = grep.exec(value);
					return (results != null);
				}
				catch (e) {
					this.debug('Invalid regex');
				}
				return false;
			},

			min: function(value, element, param) {
				return parseFloat(value) >= parseFloat(param);
			},

			max: function(value, element, param) {
				return parseFloat(value) <= parseFloat(param);
			},

			email: function(value, element, param) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
				return /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
			},

			url: function(value, element, param) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
				return /^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
			},

			number: function(value, element, param) {
				return /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			},

			digits: function(value, element, param) {
				return /^\d+$/.test(value);
			},

			date: function(value, element, param) {
				 return !/Invalid|NaN/.test(new Date(value).toString());
			},

			dateISO: function(value, element, param) {
				return /^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/.test(value);
			},

			mask: function(value, element, param) {
				// TODO
			}
		},

		/**
		 * Methods that should be called only on blur events or on submit.
		 */
		onblur: {
			//Test event
		},

		/**
		 * Methods that should be called only on submit or when form() is called.
		 */
		onsubmit: {

		}
	}
});

}(jQuery));