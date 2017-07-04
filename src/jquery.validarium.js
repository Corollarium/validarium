/**
 * Validarium: a jquery plugin for validating forms https://github.com/Corollarium/validarium
 * Parts of this code from http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 *
 *  @fileoverview Validarium: a jquery plugin for validating forms
 *  @author Corollarium Tecnologia: https://www.corollarium.com
 *  @license Licensed under the MIT license https://opensource.org/licenses/mit-license.php
 *  @copyright 2012-2017 Corollarium Tecnologia: https://www.corollarium.com
 *  @version 2.0.0
 *  @requires jQuery
 */

/**
 * See (https://jquery.com/).
 * @name $
 * @class
 * See the jQuery Library  (https://jquery.com/) for full details. This just
 * documents the function and classes that are added to jQuery by this plug-in.
 */


(function($) {

'use strict';

$.fn.validarium = function(options) {
	var self = this;

	if (!this.length)
		$.validarium.prototype.debug("No elements");

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

/**
 * @constructor
 * @memberOf $
 */
$.validarium = function( options, form ) {
	this.settings = $.extend( true, {}, $.validarium.defaults, options );

	this.currentForm = $(form);

	// Add novalidate tag if HTML5.
	this.currentForm.attr('novalidate', 'novalidate');

	this.init();
};

$.extend($.validarium, {

	/**
	 * Current lib version
	 * @memberOf $.validarium
	 * @property {string}
	 */
	version: '2.0.0',

	/**
	 * Types of events TODO
	 * @memberOf $.validarium
	 * @property {string[]}
	 */
	callbacktypes: ['ontype', 'onblur', 'onsubmit', 'onalways'],

	/**
	 * Default settings value
	 * @memberOf $.validarium
	 * @property {Object}
	 */
	defaults: {
		debug: false, /// if true, print
		errorClass: "error", /// class added to invalid elements.
		validClass: "valid", /// class added to valid elements.
		pendingClass: "pending", /// class added to elements being validated.
		errorElement: "ul", /// element used to display the error message
		focusInvalid: true, /// if true, focus on element when there is an error
		invalidHandler: null, /// a function to be called when the form is invalid
		submitHandler: null, /// a function to be called on a submit event, after validation.
		preSubmitHandler: null, /// a function to be called on submit, before validation.
		/// If it returns 'override', submit form without validation. If false, validation is considered before checking.
		/// If true, normal behavior ensues.
		ignore: ":hidden", /// selectors to ignore
		noignore: ".noignore:not([disabled])", /// selectors to don't ignore in every case
		autoRefreshElements: false, /// if true, refresh element list automatically. Use only on dynamic forms, it's slower.
		/**
		 * Time (in milliseconds) to wait before triggering a 'ontype' validation
		 */
		timeBeforeTypeValidation: 200,
		i18n: function (str) {
			return str;
		} // function for internationalization
	},

	/**
	 * @param {string} name
	 * @param {string} eventtype
	 * @param {function} callback
	 * @memberOf $.validarium
	 */
	newValidationRule: function (name, eventtype, callback) {
		this.addMethod()
	},

	/**
	 * Add a new method to validarium list. If a method already exists it is
	 * replaced.
	 *
	 * @param string name The method name
	 * @param function callback a function(value, element, param) or function(value, element)
	 * @param string message
	 * @param string|array eventtype One or more of the event types defined in this.callbacktypes
	 * @return boolean
	 * @deprecated use newValidationRule
	 * @memberOf $.validarium
	 */
	addMethod: function (name, callback, message, eventtype) {
		if (!name || !$.isFunction(callback)) {
			return false;
		}

		name = name.toLowerCase();

		if (message) {
			this.messages[name] = message;
		}

		if (eventtype == undefined) {
			eventtype = ['onalways'];
		}
		else if (typeof eventtype == "string") {
			eventtype = [eventtype];
		}
		var len = eventtype.length;
		for (var i = 0; i < len; i++) {
			if (!eventtype in this.callbacktypes) {
				return false;
			}
			$.validarium.prototype[eventtype[i]][name] = callback;
		}
		return true;
	},

	/**
	 * Remove a method by name. If it does not exist, nothing happens.
	 *
	 * @param {string} name
	 * @param {string} eventtype
	 *
	 * @memberOf $.validarium
	 */
	removeMethod: function (name, eventtype) {
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
		if (this.messages[name]) {
			delete this.messages[name];
		}
		delete $.validarium.prototype[eventtype][name];
		return true;
	},

	/**
	 * @memberOf $.validarium
	 * @property {Object}
	 */
	messages: {
		required: "This field is required.",
		minlength: "Please enter at least {minlength} characters.",
		maxlength: "Please enter no more than {maxlength} characters.",
		equalto: "Please enter the same value again.",
		regexp: "Please fill correct format: {regexp}",
		min: "Please enter a value greater than or equal to {min}.",
		cpf: "Please enter a valid CPF value.",
		cnpj: "Please enter a valid CNPJ value.",
		max: "Please enter a value less than or equal to {max}.",
		email: "Please enter a valid email address.",
		url: "Please enter a valid URL.",
		urlfillprotocol: "Please enter a valid URL.",
		number: "Please enter a valid number.",
		digits: "Please enter only digits.",
		time: "Please enter a valid time",
		date: "Please enter a valid date.",
		dateiso: "Please enter a valid date (ISO yyyy-mm-dd).",
		datetime: "Please enter a valid datetime (ISO yyyy-mm-ddThh:mm:ss)",
		inputmask: "Please fill based on mask: {inputmask}",
		remote: "Please fix this field."
	}
});

$.validarium.prototype = {

	/**
	 * @memberof $.validarium.prototype
	 * @private
	 */
	init: function() {
		var self = this;

		this.updateElementList();

		this.currentForm.on(
			'click', 'input[type="submit"], button:not(type), button[type="submit"]',
			function(event) {
				if (self.settings.debug) {
					// prevent form submit to be able to see console output
					event.preventDefault();
				}
			}
		)
		.on('submit', function(event) {
			if (self.settings.preSubmitHandler) {
				var v = self.settings.preSubmitHandler.call(self, self.currentForm[0], self, event);

				if (v === 'override') {
					return true;
				}
				else if (v == false) {
					event.preventDefault();
					event.stopPropagation();
					return;
				}
				// else just continue
			}

			var valid = self.form("onsubmit");

			if (valid && self.settings.submitHandler) {
				valid = self.settings.submitHandler.call(self, self.currentForm[0], self, event);
			}

			if (!valid) {
				event.preventDefault();
				event.stopPropagation();
			}
			return valid;
		});

		var keyupSelectors = 'select, textarea, :text, ' + [
			'password', 'file', 'number', 'search', 'tel', 'url', 'email', 'datetime',
			'date', 'month', 'week', 'time', 'datetime-local', 'range', 'color'
		].map(function(validType) {
			return 'input[type="' + validType + '"]';
		}).join(', ');

		var keyupTimer = null;
		this.currentForm.on('keyup', keyupSelectors, function() {
			var innerThis = this;
			if ($.validarium.defaults.timeBeforeTypeValidation) {
				window.clearTimeout(keyupTimer);
				keyupTimer = setTimeout(function() {
					self.elementValidate(innerThis, 'ontype');
				}.bind(this), $.validarium.defaults.timeBeforeTypeValidation);
			}
			else {
				self.elementValidate(this, 'ontype');
			}
		})
		.on("click", "input[type='radio'], input[type='checkbox'], select, option", function() {
			self.elementValidate(this, 'ontype');
		})
		.on('blur', 'input', function() {
			self.elementValidate(this, 'onblur');
		});
	},

	/**
	 * @private
	 */
	settings: {},

	/**
	 * @private
	 */
	debug: function(message) {
		if (('debug' in this.settings && this.settings.debug) || $.validarium.defaults.debug) {
			console.warn("Validarium:" + message);
		}
	},

	/**
	 * Updates the element list. Call this if you have a dynamic form
	 * and added new elements to it.
	 * @memberOf $.validarium.prototype
	 */
	updateElementList: function() {
		this.elements = this.currentForm
			.find("input, select, textarea")
			.not(":submit, :reset, :image, [disabled]")
			.not( this.settings.ignore )
			.add( this.currentForm.find(this.settings.noignore) );

		// reset states in case of a dynamic data-rules change on some element.
		this.elements.each(function() {
			$(this).data('validariumstates', null);
		});
	},

	/**
	 * Validates an event and displays an error message if invalid
	 *
	 * @param element
	 * @param eventtype
	 * @returns {Boolean}
	 * @private
	 */
	elementValidate: function(element, eventtype) {
		var self = this;
		var attributes = element.attributes;
		var finalstate = this._stateCalculate(this.getStates(element));

		for (var i = 0; i < attributes.length; i++) {
			var name = attributes.item(i).nodeName.toLowerCase();
			var rulevalue = attributes.item(i).nodeValue;

			if (name.substr(0, 10) == "data-rules") {
				var rulename = name.substr(11);
				var methods = self.getMethods(rulename, eventtype);
				var value = self.elementValue(element);
				var _errMsg = '';
				for (var j=0; j<methods.length; j++) {
					var state = false;
					var method = methods[j];
					// call the validation callback
					try {
						// state = if for backwards compatibility
						state = method.call(self, value, element, rulevalue);
					}
					catch(e) {
						_errMsg = e;
						state = false;
					}

					var errormessage = '';
					if (state !== true) {
						errormessage = 'Error';
						// TODO review this, it needs at least some documentation
						var cstmMessage = $(element).attr(name + '-message');
						if (cstmMessage) {
							errormessage = cstmMessage;
						}
						else if (_errMsg || $.validarium.messages[rulename]) {
							errormessage = _errMsg || $.validarium.messages[rulename];
							var token = '{' + rulename + '}';
							while (errormessage.indexOf(token) != -1) {
								errormessage = errormessage.replace(token, rulevalue);
							}
						}
					}

					finalstate = self.elementNotify(element, rulename, state, errormessage);

					if (finalstate === false) { // already failed, no point in making more validations (if they exist)
						break;
					}
				}
			}
		}
		return finalstate;
	},

	/**
	 * Validates the form
	 * @return boolean True if ok, false irmessages
	 * @private
	 */
	form: function(eventtype) {
		var retval = true;
		var self = this;

		if (self.autoRefreshElements) {
			self.updateElementList();
		}

		this.firstinvalid = null; // first invalid element, for focus()

		this.elements.each(function() {
			var element = this;

			var valid = self.elementValidate(element, eventtype);
			if (valid != true) {
				if (!self.firstinvalid) {
					self.firstinvalid = element;
				}
				retval = false;
			}
		});

		if (eventtype == "onsubmit" && self.settings.focusInvalid && self.firstinvalid) {
			self.firstinvalid.focus();
		}

		if (retval === false && this.settings.invalidHandler) {
			// backwards
			this.settings.invalidHandler.call(this, this.currentForm, this);
		}

		return retval;
	},

	/**
	 * Returns the element that is going to receive the error messages for validations on "element"
	 *
	 * @param element
	 * @returns {HTMLElement}
	 * @private
	 */
	elementError: function(element) {
		var $el = $(element);
		var customFn = $el.attr('data-validarium-error-fn');
		if (customFn) {
			// allow functions inside objects, ex: "MyObj.validariumRadioErrorFn"
			var fn = customFn.split('.').reduce(function(prevObj, nextStr) {
				return prevObj[nextStr];
			}, window);

			if (typeof fn === 'function') {
				return fn(this, element);
			}
			else {
				console.error('Invalid custom error function', customFn, element);
			}
		}

		var $parent = $el.parent();
		var errorel = $parent.find(this.settings.errorElement + ".validarium-error");
		if (!errorel.length) {
			errorel = $('<' + this.settings.errorElement + ' class="validarium-error"/>');
			$parent.append(errorel);
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
	 * @private
	 */
	elementNotify: function(element, rulename, newstate, message) {
		var errorel = this.elementError(element);
		var $errorEl = $(errorel);
		var $element = $(element);
		var s = this.settings;

		var states = this.getStates($element);
		states[rulename] = {'state': newstate, 'message': message};
		$element.data('validariumstates', states);

		var finalstate = this._stateCalculate(states);

		$element.removeClass(s.errorClass + " " + s.validClass + " " + s.pendingClass);
		$errorEl.find('.' + s.pendingClass).remove();
		switch (newstate) {
		case "pending":
			$errorEl.append('<li class="' + s.pendingClass + '">Validating...</li>').show();
			$element.addClass(s.pendingClass);
			break;
		case 'unchecked':
			// TODO
			break;
		case false:
			if (!message) {
				message = 'Error';
			}

			var $el = $errorEl.children('li[data-rule=' + rulename + ']');
			if (!$el.length) {
				$errorEl.append('<li data-rule="' + rulename + '">' + message + '</li>');
			}
			else {
				$el.html(message);
			}
			$errorEl.show();
			$element.addClass(s.errorClass);
			break;
		case true:
			$errorEl.find('[data-rule=' + rulename + ']').remove();
			if (!$errorEl.children().length) {
				$errorEl.hide();
				$element.addClass(s.validClass);
			}
			break;
		}
		return finalstate;
	},

	/**
	 * Calculates the current state from an array of states.
	 *
	 * @return one of [true, false, 'pending', 'unchecked']
	 * @private
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
	 * Returns the state for an element
	 *
	 * @param element
	 * @returns The current state from an array of states
	 * @private
	 */
	getStates: function (element) {
		var states = $(element).data('validariumstates');
		if (states === undefined || states === null) {
			states = [];
		}
		return states;
	},

	/**
	 * Returns validation callbacks
	 *
	 * @param methodname
	 * @param eventtype
	 * @returns Array
	 * @private
	 */
	getMethods: function(methodname, eventtype) {
		var self = this;
		return $.validarium.callbacktypes.map(function(type) {
			return eventtype === type && methodname in self[type] ? self[type][methodname] : null;
		}).concat(
			(eventtype !== 'onalways' && methodname in self.onalways ? self.onalways[methodname] : null)
		).filter(function(method) {
			return method !== null;
		});
	},

	/**
	 * Returns the value of an element, dealing with radio/checkbox/etc.
	 *
	 * @return string
	 * @private
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
	 * @private
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
				return (val != null) && (val.length > 0);
			}
			return $.trim(value).length > 0;
		},

		// https://github.com/Corollarium/validarium/wiki/minlength
		minlength: function(value, element, param) {
			var len = value.length;
			return !len || len >= param;
		},

		// https://github.com/Corollarium/validarium/wiki/maxlength
		maxlength: function(value, element, param) {
			return value.length <= param;
		},

		// https://github.com/Corollarium/validarium/wiki/equalto
		equalto: function(value, element, param) {
			return (value == $(param).val());
		},

		// https://github.com/Corollarium/validarium/wiki/regexp
		regexp: function(value, element, param) {
			if (!value) {
				return true; // If you need a false here, add "required" as well
			}
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

		// https://github.com/Corollarium/validarium/wiki/url
		url: function(value, element, param) {
			return !value ||/^(https?|s?ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i.test(value);
		},

		// https://github.com/Corollarium/validarium/wiki/url
		urlfillprotocol: function(value, element, param) {
			if (!value) {
				return true;
			}
			var hasProtocol = (value.indexOf('://', 0) !== -1);
			if (!hasProtocol) {
				value = 'http://' + value;
			}
			// contributed by Scott Gonzalez: http://projects.scottsplayground.com/iri/
			var isUrl = this.onalways.url(value, element, param);
			if (isUrl && !hasProtocol) {
				$(element).val(value);
			}
			return isUrl;
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
		 * Valid a time where hour and minutes are mandatory, seconds and miliseconds are optional
		 * Format: hour:minute:second:milisecond or hour:minute:second.milisecond
		 */
		time: function (value, element, param) {
			if (!value) {
				return true;
			}

			// regular expression to match required time format
			var re = /^(\d{1,2}):(\d{2})(:(\d{2})([:|\.](\d{1,4}))?)?$/;
			var pieces = null;
			if (pieces = value.match(re)) {
				var hour = parseInt(pieces[1], 10);
				var min = parseInt(pieces[2], 10);
				var sec = 0;
				if (pieces[4]) {
					sec = parseInt(pieces[4], 10);
				}

				return (hour >= 0 && hour < 24 && min >= 0 && min < 60 && sec >= 0 && sec < 60);
			}
			return false;
		},

		/**
		 *
		 * @param year
		 * @param month 1-12
		 * @param day
		 * @returns {Boolean}
		 */
		_datechecker: function(year, month, day) {
			var d = new Date();

			year = parseInt(year, 10);
			month = parseInt(month, 10);
			day = parseInt(day, 10);
			if (isNaN(month) || isNaN(day) || isNaN(year)) {
				return false;
			}

			d.setFullYear(year, month-1, day);
			if (/Invalid|NaN/.test(d.toString())) {
				return false;
			}

			if ((d.getMonth()+1 != month) || (d.getDate() != day) || (d.getFullYear()!= year)) {
				return false;
			}

			return true;
		},

		/**
		 * Checks if it is a valid date in format MM/DD/YYYY.
		 * https://github.com/Corollarium/validarium/wiki/date
		 */
		date: function(value, element, param) {
			var pieces = value.split('/');
			if (!value) {
				return true;
			}
			if (pieces.length !== 3) {
				return false;
			}

			return this.onalways._datechecker(pieces[2], pieces[0], pieces[1]);
		},

		/**
		 * Validates a YYYY-MM-DD or YYYY/MM/DD date.
		 * Checks if it is a valid date.
		 * https://github.com/Corollarium/validarium/wiki/dateiso
		 */
		dateiso: function(value, element, param) {
			if (!value) return true;

			var regex = /^(-?\d{1,4})[\-](\d{1,2})[\-](\d{1,2})$/;
			var match = regex.exec(value);
			if (!match) {
				return false;
			}

			return $.validarium.prototype.onalways._datechecker(match[1], match[2], match[3]);
		},

		/***
		 * Validate a datetime in ISO8601 (yyyy-mm-ddThh:mm:ss) format
		 * http://en.wikipedia.org/wiki/ISO_8601
		 */
		datetime: function (value, element, param) {
			if (!value) return true;
			if (value.indexOf('T') == -1) return false;

			var parts = value.split("T");
			if (parts.length != 2) return false;
			if ((parts[0] && !parts[1]) || (!parts[0] && parts[1])) return false;

			// optional: timezone
			var plus = parts[1].indexOf('+');
			var minus = parts[1].indexOf('-');
			var Z = parts[1].indexOf('Z');
			if (plus >= 0 && minus >= 0) return false;

			var timeparts = null;
			if (plus >= 0) {
				timeparts = parts[1].split('+');
			}
			else if (minus >= 0) {
				timeparts = parts[1].split('-');
			}
			else if (Z >= 0) {
				var zpart = parts[1].split('Z');
				if (zpart.length != 2 || zpart[1].length > 0) {
					return false;
				}
				parts[1] = zpart[0];
			}
			if (timeparts) {
				if (timeparts.length != 2) return false;
				parts[1] = timeparts[0];
				var timezone = timeparts[1].substr();
				if (/^[0-9]{4}$/.exec(timezone) ||
					/^[0-9]{2}:[0-9]{2}$/.exec(timezone) ||
					/^[0-9]{2}$/.exec(timezone)
				) {
					this.debug("ok!!");
				}
				else {
					return false;
				}
			}

			var self = $.validarium.prototype.onalways;
			return self.dateiso(parts[0], element, param) && self.time(parts[1], element, param);
		},

		domain: function (value, element, param) {
			if (!value) {
				return true;
			}
			if (value.length > 63) {
				return false;
			}
			var re = new RegExp(/^([a-zA-Z0-9]+\.)?([a-zA-Z0-9]+\.)?[a-zA-Z0-9][a-zA-Z0-9-]+\.[a-zA-Z]{2,6}?$/i);
			return (value.match(re) != null);
		},
		cpf: function(value, element, param) {
			if (!value) {
				return true;
			}

			var cpf = value.replace(/[^\d]+/g, ''),
				sum = 0,
				remainder;

			if (!cpf || cpf.length !== 11 || cpf === '00000000000') {
				return false;
			}

			for (var i=1; i<=9; i++) {
				sum = sum + parseInt(cpf.substring(i-1, i), 10) * (11 - i);
			}
			remainder = (sum * 10) % 11;

			if ((remainder === 10) || (remainder === 11)) {
				remainder = 0;
			}

			if (remainder !== parseInt(cpf.substring(9, 10), 10)) {
				return false;
			}

			sum = 0;
			for (var i = 1; i <= 10; i++) {
				sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
			}
			remainder = (sum * 10) % 11;

			if ((remainder === 10) || (remainder === 11)) {
				remainder = 0;
			}

			if (remainder !== parseInt(cpf.substring(10, 11), 10)) {
				return false;
			}

			return true;
		},
		cnpj: function(value, element, param) {
			if (!value) {
				return true;
			}

			var cnpj = value.replace(/[^\d]+/g, '');

			if(!cnpj || cnpj.length !== 14) {
				return false;
			}
			else if (
				cnpj == "00000000000000" ||
				cnpj == "11111111111111" ||
				cnpj == "22222222222222" ||
				cnpj == "33333333333333" ||
				cnpj == "44444444444444" ||
				cnpj == "55555555555555" ||
				cnpj == "66666666666666" ||
				cnpj == "77777777777777" ||
				cnpj == "88888888888888" ||
				cnpj == "99999999999999"
			) {
				return false;
			}

			var size = cnpj.length - 2;
			var numeros = cnpj.substring(0, size);
			var digits = cnpj.substring(size);
			var sum = 0;
			var pos = size - 7;
			for (var i=size; i >= 1; i--) {
			  sum += numeros.charAt(size - i) * pos--;
			  if (pos < 2)
					pos = 9;
			}
			var result = sum % 11 < 2 ? 0 : 11 - sum % 11;
			if (result != digits.charAt(0))
				return false;

			size = size + 1;
			numeros = cnpj.substring(0,size);
			sum = 0;
			pos = size - 7;

			for (var i=size; i >= 1; i--) {
			  sum += numeros.charAt(size - i) * pos--;
			  if (pos < 2)
					pos = 9;
			}

			result = sum % 11 < 2 ? 0 : 11 - sum % 11;
			if (result != digits.charAt(1)) {
				return false;
			}

			return true;
		}
	},

	/**
	 * Methods that should be called whenever a key is typed (or clicks for some
	 * elements like select), on blur events or on submit.
	 * @private
	 */
	ontype: {
		// https://github.com/Corollarium/validarium/wiki/mask
		inputmask: function(value, element, param) {
			return value === null || value === '' || $(element).inputmask('isComplete');
		}
	},

	/**
	 * Methods that should be called only on blur events or on submit.
	 * @private
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
					self.elementNotify(element, 'remote', false, $.validarium.messages.remote);
				}
			}, param));
			return "pending";
		}
	},

	/**
	 * Methods that should be called only on submit or when form() is called.
	 * @private
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
			return $.validarium.prototype.onblur.remoteblur(value, element, param);
		}
	}
};

}(jQuery));
