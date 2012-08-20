/*global define,window */
/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
// modified by Thomas Scheffler to work with jslint
define("Class", [ "jquery" ], function(jQuery) {
	"use strict";
	var initializing = false, Class;

	// The base Class implementation (does nothing)
	/** @class allows to make object oriented class hierarchies */
	Class = function() {
	};

	// Create a new Class that inherits from this class
	/**  @memberOf Class
	 *   @param {Object} prop Object with properties attached to prototype
	 *   @see <a href="http://ejohn.org/blog/simple-javascript-inheritance/">authors site</a> */
	Class.extend = function extend(prop) {
		var _super = this.prototype, Constructor = this, prototype, name;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		prototype = new Constructor();
		initializing = false;

		// Copy the properties over onto the new prototype
		jQuery.each(prop, function(name, value) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof value === "function"
					&& typeof _super[name] === "function" ? function() {
				var tmp = this._super, ret;

				// Add a new ._super() method that is the same
				// method
				// but on the super-class
				this._super = _super[name];

				// The method only need to be bound temporarily, so
				// we
				// remove it when we're done executing
				ret = value.apply(this, arguments);
				this._super = tmp;

				return ret;
			} : value;
		});

		/** @description The dummy class constructor*/
		function Class() {
			// All construction is actually done in the init method
			if (!initializing && this.init) {
				this.init.apply(this, arguments);
			}
		}

		// Populate our constructed prototype object
		Class.prototype = prototype;

		// Enforce the constructor to be what we expect
		Class.prototype.constructor = Class;

		// And make this class extendable
		Class.extend = extend;

		return Class;
	};
	return Class;
});