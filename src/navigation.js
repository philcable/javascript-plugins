(function (root, factory) {
	if ( typeof define === 'function' && define.amd ) {
		define([], factory);
	} else if ( typeof exports === 'object' ) {
		module.exports = factory();
	} else {
		root.navigation = factory();
	}
})(typeof self !== 'undefined' ? self : this, function () {

	'use strict';

	// Object for public APIs.
	const navigation = {};

	// Placeholder for defaults merged with user settings.
	let settings;

	// Default settings.
	const defaults = {
		main: false,
		nav: false,
		orientation: 'vertical',
		position: 0
	};

	// Object for keeping track of the `nav` element's scroll state.
	const navScrollState = {
		position: 0,
		top: 0,
	};

	/**
	 * Sets the minimum height on both the `main` and `nav` elements.
	 * @private
	 */
	const setMinHeight = function () {
		const navHeight    = settings.nav.querySelector( 'ul' ).scrollHeight;
		const windowHeight = window.innerHeight;
		const minHeight    = ( navHeight > windowHeight )
			? navHeight + 'px'
			: windowHeight + 'px';

		settings.main.style.minHeight = minHeight;
		settings.nav.style.minHeight = minHeight;
	}

	/**
	 * Toggles the `open` class for list items containing child lists.
	 * @private
	 * @param {Event} event The click event.
	 */
	const toggleSection = function ( event ) {
		const target = event.target;

		// Bail if the click isn't on an anchor.
		if ( !( target instanceof HTMLAnchorElement ) ) {
			return;
		}

		// Bail if the anchor doesn't have any siblings.
		// A quick and dirty way to determine if the nav item has a child list.
		if ( !target.parentNode.children[1] ) {
			return;
		}

		// Don't follow the link.
		event.preventDefault();

		// Toggle the `open` class in the anchors parent li.
		target.parentNode.classList.toggle( 'open' );

		setMinHeight();
		positionNav();
	};

	/**
	 * Ensures proper positioning of the navigation when the page scrolled.
	 * @private
	 */
	const positionNav = function () {
		const windowTop  = window.scrollY;
		const scrollDiff = navScrollState.top - windowTop;
		const navHeight  = settings.nav.scrollHeight;

		let position = navScrollState.position;

		navScrollState.top = windowTop;

		// If the content in the main element is taller than the navgiation,
		// maintain a top position on the navigation to ensure predictable scrolling.
		if ( settings.main.offsetHeight > navHeight ) {
			const upperBound = ( navHeight - window.innerHeight ) * -1;

			// Wthin the upper bounds, calculate the position based on scroll location.
			position = position + scrollDiff;

			// If the position is greater than 0, reset it to 0.
			// This prevents scrolling too far up.
			if ( position > 0 ) {
				position = 0;
			}

			// If the position is outside of the upper bound, reset it to the upper bound.
			// This prevents scrolling too far down.
			if ( position < upperBound ) {
				position = upperBound;
			}

			// Set the top position on the navigation.
			settings.nav.style.top = position + 'px';

			// Update the navigation scroll state position
			navScrollState.position = position;
		} else {
			// Set the top position on the navigation back to 0.
			settings.nav.style.top = '0';
		}
	};

	/**
	 * Merge any user options with the default settings.
	 * @private
	 * @param {Object} defaults Default settings.
	 * @param {Object} options  User settings.
	 */
	const extendDefaults = function( defaults, options ) {
		var property;

		for ( property in options ) {
			if ( Object.prototype.hasOwnProperty.call( options, property ) ) {
				defaults[ property ] = options[ property ];
			}
		}

		return defaults;
	}

	/**
	 * Destroy the current initialization.
	 * @public
	 */
	navigation.destroy = function () {

		// If plugin isn't already initialized, stop.
		if ( !settings ) return;

		// Remove event listeners.
		settings.element.removeEventListener( 'click', toggleSection, false );

		if ( 'vertical' === settings.orientation ) {
			document.removeEventListener( 'wheel', positionNav, {
				capture: true,
				passive: true
			} );
		}

		// Reset variables.
		settings = null;

	};

	/**
	 * Initialize Plugin.
	 *
	 * @public
	 * @param {Object} options User settings.
	 */
	navigation.init = function ( options ) {

		// Check for required settings.
		if ( !options.nav || !options.main ) return;

		// Destroy any existing initializations.
		navigation.destroy();

		// Merge user options with defaults.
		settings = extendDefaults( defaults, options || {} );

		// Listen for click events.
		settings.nav.addEventListener( 'click', toggleSection, false );

		if ( 'vertical' === settings.orientation ) {
			document.addEventListener( 'scroll', positionNav );
		}

	};

	return navigation;

});