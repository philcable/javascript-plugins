// Get the `#main` and `#nav` elements.
const main = document.getElementById( 'main' );
const nav  = document.getElementById( 'nav' );

// Set up an object for keeping track of the `#nav` element's scroll state.
const navScrollState = {
	position: 0,
	top:      0,
};

/**
 * Ensures that the `#nav` element is properly
 * positioned while the page is being scrolled.
 */
function setNavPosition() {
	const windowTop  = window.scrollY;
	const scrollDiff = navScrollState.top - windowTop;
	const navHeight  = nav.scrollHeight;

	let position = navScrollState.position;

	navScrollState.top = windowTop;

	// If the content in `#main` is taller than the content in `#nav`,
	// maintain a top position on `#nav` to ensure predictable scrolling.
	if ( main.offsetHeight > navHeight ) {
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

		// Set the top position on the `#nav` element.
		nav.style.top = position + 'px';

		// Update the navigation scroll state position
		navScrollState.position = position;
	} else {
		// Set the top position on the `#nav` element back to 0.
		nav.style.top = '0';
	}
}

/**
 * Sets the minimum height on both the `#main` and `#nav` elements.
 */
function setMinHeight() {
	const navHeight    = nav.querySelector( 'ul' ).scrollHeight;
	const windowHeight = window.innerHeight;
	const minHeight    = ( navHeight > windowHeight )
		? navHeight + 'px'
		: windowHeight + 'px';

	main.style.minHeight = minHeight;
	nav.style.minHeight = minHeight;
}

/**
 * Toggles the `open` class for list items containing child lists.
 *
 * @param {object} event The click event object.
 */
function toggleSections( event ) {
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
	setNavPosition();
}

window.addEventListener( 'DOMContentLoaded', setMinHeight );

window.addEventListener( 'scroll', setNavPosition );

window.addEventListener( 'resize', setMinHeight );

nav.addEventListener( 'click', toggleSections, false );