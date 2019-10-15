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
		breakpoint: null,
		main: null,
		nav: null,
		orientation: 'vertical',
		position: 0,
		minHeights: true,
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
		if ( !settings.minHeights ) return;

		const navHeight = settings.nav.querySelector( 'ul' ).scrollHeight;
		const windowHeight = window.innerHeight;
		const minHeight = ( navHeight > windowHeight )
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
		const windowTop = window.scrollY;
		const scrollDiff = navScrollState.top - windowTop;
		const upperBound = ( settings.nav.scrollHeight - window.innerHeight ) * -1;

		let position = navScrollState.position;

		// Within the upper bounds, calculate the position based on scroll location.
		position = position + scrollDiff;

		// If the position is greater than the default, reset it to the default.
		// This prevents scrolling too far up.
		if ( settings.position < position ) {
			position = settings.position;
		}

		// If the position is outside of the upper bound, reset it to the upper bound.
		// This prevents scrolling too far down.
		if ( position < upperBound ) {
			position = upperBound;
		}

		navScrollState.position = position;
		navScrollState.top = windowTop;

		settings.nav.style.top = position + 'px';
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
	 * @param {Object}  options             User settings.
	 * @param {Number}  options.breakpoint  Pixel width at which the navigation is styled for mobile devices. Defaults to `null`
	 * @param {Object}  options.main        The element containing the page's content. Required. Defaults to `null`.
	 * @param {Boolean} options.minHeights  Whether the plugin should set min heights on the main and nav elements. Defaults to `true`.
	 * @param {Object}  options.nav         The element containing the navigation. Required. Defaults to `null`.
	 * @param {String}  options.orientation The orientation of the navigation. Accepts `vertical` or `horizontal`. Defaults to `vertical`.
	 * @param {Number}  options.position    Initial `top` value of the navigation element from CSS, if set. Defaults to `0`.
	 */
	navigation.init = function ( options ) {

		// Check for required settings.
		if ( !options.nav || !options.main ) return;

		// Destroy any existing initializations.
		navigation.destroy();

		// Merge user options with defaults.
		settings = extendDefaults( defaults, options || {} );

		// Listen for click events on the navigation element.
		settings.nav.addEventListener( 'click', toggleSection, false );

		if ( 'vertical' === settings.orientation ) {
			document.addEventListener(
				'wheel',
				function () {
					// Stop if the window is narrower than the set breakpoint.
					if (
						settings.breakpoint && settings.breakpoint > window.innerWidth
						|| settings.main.offsetHeight < settings.nav.scrollHeight
						|| window.innerHeight > ( settings.nav.scrollHeight + settings.position )
						|| settings.position < settings.nav.getBoundingClientRect().top
					) {
						settings.nav.removeAttribute( 'style' );
						return;
					}

					requestAnimationFrame( positionNav );
				},
				{
					capture: true,
					passive: true
				}
			);


			setMinHeight();

			window.addEventListener( 'resize', setMinHeight );
		}
	};

	return navigation;

});