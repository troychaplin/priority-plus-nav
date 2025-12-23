/**
 * DOM utility functions for PriorityNav
 */

/**
 * Check if an element is visible and has dimensions
 * @param {HTMLElement} element - Element to check
 * @return {boolean} True if element is visible
 */
export function isElementVisible( element ) {
	if ( ! element ) {
		return false;
	}

	const styles = window.getComputedStyle( element );
	const rect = element.getBoundingClientRect();

	return (
		styles.display !== 'none' &&
		styles.visibility !== 'hidden' &&
		rect.width > 0 &&
		rect.height > 0
	);
}

/**
 * Get the visible width of an element
 * @param {HTMLElement} element - Element to measure
 * @return {number} Width in pixels, or 0 if not visible
 */
export function getElementWidth( element ) {
	if ( ! isElementVisible( element ) ) {
		return 0;
	}
	return element.getBoundingClientRect().width;
}

/**
 * Check if the navigation list is measurable (visible and has dimensions)
 * @param {HTMLElement} list - List element to check
 * @return {boolean} True if measurable
 */
export function isMeasurable( list ) {
	return isElementVisible( list );
}

/**
 * Check if navigation is in hamburger/responsive mode
 * Returns true if the menu container is hidden or in responsive overlay mode
 * @param {HTMLElement} responsiveContainer - Responsive container element
 * @param {HTMLElement} list                - Navigation list container
 * @return {boolean} True if in hamburger mode
 */
export function isInHamburgerMode( responsiveContainer, list ) {
	// Check if responsive container exists and is hidden
	if (
		responsiveContainer &&
		( ! isElementVisible( responsiveContainer ) ||
			responsiveContainer.getAttribute( 'aria-hidden' ) === 'true' )
	) {
		return true;
	}

	// Check if the main list container is hidden (fallback detection)
	if ( list && ! isElementVisible( list ) ) {
		return true;
	}

	return false;
}
