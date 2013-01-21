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

	// Add novalidate tag if HTML5.
	this.currentForm.attr('novalidate', 'novalidate');

	this.init();
};

$.extend($.validarium, {
	callbacktypes: ['ontype', 'onblur', 'onsubmit', 'onalways'],

	defaults: {
		debug: false, /// if true, print
		errorClass: "error", /// class added to invalid elements.
		validClass: "valid", /// class added to valid elements.
		pendingClass: "pending", /// class added to elements being validated.
		errorElement: "label", /// element used to display the error message
		focusInvalid: true, /// if true, focus on element when there is an error
		invalidHandler: null, /// a function to be called when the form is invalid
		submitHandler: null, /// a function to be called on a submit event.
		ignore: ":hidden", /// selectors to ignore
		noignore: ".noignore", /// selectors to don't ignore in every case
		i18n: function(str) { return str; } // function for internationalization
	},

	/**
	 * Add a new method to validarium list. If a method already exists it is
	 * replaced.
	 *
	 * @param string name The method name
	 * @param function callback a function(value, element, param) or function(value, element)
	 * @param string message
	 * @param string eventtype One of the event types defined in this.callbacktypes
	 * @return boolean
	 */
	addMethod: function(name, callback, message, eventtype) {
		if (!name || !$.isFunction(callback)) {
			return false;
		}
		// TODO: message

		name = name.toLowerCase();

		if (eventtype == undefined) {
			eventtype = 'onalways';
		}
		else if (!eventtype in this.callbacktypes) {
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
		name = name.toLowerCase();
		if (eventtype == undefined) {
			var retval = true;
			for (var i in this.callbacktypes) {
				retval = this.removeMethod(name, this.callbacktypes[i]);
				if (!retval) break;
			}
			return retval;
		}
		else if (!eventtype in this.callbacktypes) {
			return false;
		}
		delete $.validarium.prototype[eventtype][name];
		return true;
	},

	messages: {
		required: "This field is required.",
		minlength: "Please enter at least {minlength} characters.",
		maxlength: "Please enter no more than {maxlength} characters.",
		equalto: "Please enter the same value again.",
		regexp: "Please fill correct format: {regexp}",
		min: "Please enter a value greater than or equal to {min}.",
		max: "Please enter a value less than or equal to {max}.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		date: "Please enter a valid date.",
		dateISO: "Please enter a valid date (ISO).",
		mask: "Please fill based on mask: {mask}",
		remote: "Please fix this field."
	},

	prototype: {
		init: function() {
			var self = this;

			this.updateElementList();

			this.currentForm.delegate(":submit", "click", function(event){
				if (self.settings.debug) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
			});

			this.currentForm.bind("submit", function(event) {
				var valid = self.form("onsubmit");

				if (valid && self.settings.submitHandler) {
					valid = self.settings.submitHandler.call(self, self.currentForm[0], event);
				}

				if (!valid) {
					event.preventDefault();
					event.stopPropagation();
				}
				return valid;
			});

			this.currentForm
			.delegate(":text, [type='password'], [type='file'], select, textarea, " +
				"[type='number'], [type='search'] ,[type='tel'], [type='url'], " +
				"[type='email'], [type='datetime'], [type='date'], [type='month'], " +
				"[type='week'], [type='time'], [type='datetime-local'], " +
				"[type='range'], [type='color'] ",
				"keyup", function() { self.elementValidate(this, 'onalways'); self.elementValidate(this, 'ontype'); })
			.delegate("[type='radio'], [type='checkbox'], select, option", "click",
				function() { self.elementValidate(this, 'onalways'); self.elementValidate(this, 'ontype'); });

			this.currentForm.delegate('input', 'blur',
				function() {
				self.elementValidate(this, 'onalways'); self.elementValidate(this, 'onblur'); });

			if (this.settings.invalidHandler) {
				$(this.currentForm).bind("invalid-form", this.settings.invalidHandler);
			}
		},

		settings: {},

		debug: function(message) {
			if (('debug' in this.settings && this.settings.debug) || $.validarium.defaults.debug) {
				console.warn("Validarium:" + message);
			}
		},

		/**
		 * Updates the element list. Call this if you have a dynamic form
		 * and added new elements to it.
		 */
		updateElementList: function() {
			this.elements = this.currentForm
				.find("input, select, textarea")
				.not(":submit, :reset, :image, [disabled]")
				.not( this.settings.ignore )
				.add( this.currentForm.find(this.settings.noignore) );
		},

		/**
		 * Validates an event and displays an error message if invalid
		 *
		 * @param element
		 * @param eventtype
		 * @returns {Boolean}
		 */
		elementValidate: function(element, eventtype) {
			var self = this;
			var attributes = element.attributes;

			for (var i = 0; i < attributes.length; i++) {
				var name = attributes.item(i).nodeName.toLowerCase();
				var rulevalue = attributes.item(i).nodeValue;

				if (name.substr(0, 10) == "data-rules") {
					var rulename = name.substr(11);
					var method = self.getMethod(rulename, eventtype);
					if (!method) {
						continue;
					}
					var value = self.elementValue(element);
					var state = method.call(self, value, element, rulevalue);

					var errormessage = "Error";
					if ($(element).attr(name + '-message')) {
						errormessage = $(element).attr(name + '-message');
					}
					else if ($.validarium.messages[rulename]) {
						errormessage = $.validarium.messages[rulename];
						token = "{" + rulename + "}";
						while (errormessage.indexOf(token) != -1) {
							errormessage = errormessage.replace(token, rulevalue);
						}
					}
					self.elementNotify(element, rulename, state, errormessage);
					if (state == false) {
						return false;
					}
				}
			}
			return true;
		},

		/**
		 * Validates the form
		 * @return boolean True if ok, false ir
		 */
		form: function(eventtype) {
			var retval = true;
			var self = this;

			var firstinvalid = null; // first invalid element, for focus()
			this.elements.each(function() {
				var element = this;

				var valid = self.elementValidate(element, eventtype);
				if (!valid && !firstinvalid) {
					firstinvalid = element;
				}
				retval &= valid;

				if (eventtype != 'onalways') {
					valid = self.elementValidate(element, 'onalways');
					if (!valid) {
						firstinvalid = element;
					}
					retval &= valid;
				}
			});

			if (eventtype == "onsubmit" && self.settings.focusInvalid && firstinvalid) {
				firstinvalid.focus();
			}

			if (!retval) {
				this.currentForm.triggerHandler("invalid-form", [this]);
			}
			return retval;
		},

		/**
		 * Returns the an element, associated with the parameter, that is used to
		 * print the error message.
		 *
		 * @param element
		 * @returns
		 */
		elementError: function(element) {
			var parent = $(element).parent();
			var errorel = parent.find(this.settings.errorElement + ".validarium-error");
			if (!errorel.length) {
				errorel = $('<' + this.settings.errorElement + ' class="validarium-error"/>');
				parent.append(errorel);
				return errorel;
			}
			return errorel[0];
		},

		/**
		 *
		 * @param element The element being checked
		 * @param rulename
		 * @param state one of [true, false, pending, unchecked]
		 * @param string message The error message, if any.
		 */
		elementNotify: function(element, rulename, newstate, message) {
			var errorel = this.elementError(element);
			element = $(element);
			var s = this.settings;

			var states = element.data('validariumstates');
			if (states == undefined) {
				states = [];
			}
			states[rulename] = {'state': newstate, 'message': message};
			$.data(element, 'validariumstates', states);

			var finalstate = this._stateCalculate(states);

			element.removeClass(s.errorClass + " " + s.validClass + " " + s.pendingClass);
			switch (finalstate) {
			case "pending":
				$(errorel).html('Validating...').show();
				element.addClass(s.pendingClass);
				break;
			case 'unchecked':
				// TODO
				break;
			case false:
				if (!message) message = 'Error';
				$(errorel).html(message).show();
				element.addClass(s.errorClass);
				$(element).triggerHandler("invalid-field", [element, this]);
				break;
			case true:
				$(errorel).html('').hide();
				element.addClass(s.validClass);
				break;
			}
		},

		/**
		 * Calculates the current state from an array of states.
		 *
		 * @return one of [true, false, 'pending', 'unchecked']
		 */
		_stateCalculate: function(states) {
			var finalstate = true;
			for (var r in states) {
				var o = states[r];
				switch (o['state']) {
				case true:
					// do nothing, this is what we expect. Anything else overrides this.
					break;
				case false:
					if (finalstate == true || finalstate == 'unchecked') {
						// we don't want to override pending. Wait until it is finished first.
						finalstate = false;
					}
					break;
				case 'pending':
					finalstate = 'pending';
					break;
				case 'unchecked':
					if (finalstate == true) {
						finalstate = 'unchecked';
					}
					break;
				}
			}
			return finalstate;
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
			case 'onalways':
				if (methodname in this.onalways) return this.onalways[methodname];
				break;
			case 'onsubmit':
				if (methodname in this.onsubmit) return this.onsubmit[methodname];
				break;
			case 'onblur':
				if (methodname in this.onblur) return this.onblur[methodname];
				break;
			case 'ontype':
				if (methodname in this.ontype) return this.ontype[methodname];
				break;
			default:
				return null;
			}
			return null;
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
		onalways: {
			// https://github.com/Corollarium/validarium/wiki/required
			required: function(value, element, param) {
				if (param.toLowerCase() != 'true') {
					return true;
				}
				if (element.nodeName.toLowerCase() === "select" ) {
					// could be an array for select-multiple or a string, both are fine this way
					var val = $(element).val();
					return val && val.length > 0;
				}
				return $.trim(value).length > 0;
			},

			// https://github.com/Corollarium/validarium/wiki/minlength
			minlength: function(value, element, param) {
				return $.trim(value).length >= param;
			},

			// https://github.com/Corollarium/validarium/wiki/maxlength
			maxlength: function(value, element, param) {
				return $.trim(value).length <= param;
			},

			// https://github.com/Corollarium/validarium/wiki/equalto
			equalto: function(value, element, param) {
				return (value == $(param).val());
			},

			// https://github.com/Corollarium/validarium/wiki/regexp
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

			// https://github.com/Corollarium/validarium/wiki/min
			min: function(value, element, param) {
				return !value || (parseFloat(value) >= parseFloat(param));
			},

			// https://github.com/Corollarium/validarium/wiki/max
			max: function(value, element, param) {
				return !value || (parseFloat(value) <= parseFloat(param));
			},

			// https://github.com/Corollarium/validarium/wiki/email
			email: function(value, element, param) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/email_address_validation/
				return !value || /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i.test(value);
			},

			// https://github.com/Corollarium/validarium/wiki/url
			url: function(value, element, param) {
				// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
				return !value ||/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
			},

			// https://github.com/Corollarium/validarium/wiki/number
			number: function(value, element, param) {
				return !value ||/^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/.test(value);
			},

			// https://github.com/Corollarium/validarium/wiki/digits
			digits: function(value, element, param) {
				return !value ||/^\d+$/.test(value);
			},

			/**
			 * Checks if it is a valid date.
			 * https://github.com/Corollarium/validarium/wiki/date
			 */
			date: function(value, element, param) {
				 return !value || !/Invalid|NaN/.test(new Date(value).toString());
			},

			/**
			 * Validates a YYYY-MM-DD or YYYY/MM/DD date.
			 * Checks if it is a valid date.
			 * https://github.com/Corollarium/validarium/wiki/dateiso
			 */
			dateiso: function(value, element, param) {
				if (!value) return true;

				var regex = /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/;
				var match = regex.exec(value);
				if (!match) { return false; }

				return this.onalways.date(match[2] + '/' + match[3] + '/' + match[1], element, param);
			}
		},

		/**
		 * Methods that should be called whenever a key is typed (or clicks for some
		 * elements like select), on blur events or on submit.
		 */
		ontype: {
			// https://github.com/Corollarium/validarium/wiki/mask
			mask: function(value, element, param) {
				// TODO
			}
		},

		/**
		 * Methods that should be called only on blur events or on submit.
		 */
		onblur: {
			/**
			 * Remote validation through ajax
			 *
			 * @param value
			 * @param element
			 * @param string|json param
			 * @returns {String}
			 */
			remote: function(value, element, param) {
				var self = this;
				// parse param. If it is a string, consider it the url.
				// otherwise it is an object.
				try {
					param = $.parseJSON(param);
				}
				catch (e) {
					// TODO: message: invalid
					// self.elementNotify(element, 'remote', false, self.settings.i18("Invalid argument"));
					return false;
				}
				if (typeof param === 'string') {
					param = {'url': param};
				}

				var data = {}; data[element.name] = value;
				data = $.extend(true, data, ('data' in param ? param['data'] : {}));

				$.ajax($.extend(true, {
					dataType: "json",
					data: data,
					url: param['url'],
					success: function(data) {
						self.elementNotify(element, 'remote', true);
					},
					error: function(data) {
						self.elementNotify(element, 'remote', false, self.settings.i18("Invalid value"));
					}
				}, param));
				return "pending";
			}
		},

		/**
		 * Methods that should be called only on submit or when form() is called.
		 */
		onsubmit: {
			/**
			 * Remote validation through ajax
			 *
			 * @param value
			 * @param element
			 * @param string|json param
			 * @returns {String}
			 */
			remoteonsubmit: function(value, element, param) {
				return this.onblur.remoteblur(value, element, param);
			}
		}
	}
});

}(jQuery));
