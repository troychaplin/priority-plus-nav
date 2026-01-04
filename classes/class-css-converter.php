<?php
/**
 * CSS value conversion utilities.
 *
 * Converts block attribute values to CSS custom property formats.
 *
 * @package PriorityPlusNavigation
 */

namespace PriorityPlusNavigation;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class CSS_Converter
 *
 * Stateless utility class for converting WordPress block attribute values
 * to CSS-ready formats (custom properties, shorthand values, etc.).
 *
 * @package PriorityPlusNavigation
 */
class CSS_Converter {

	/**
	 * Default border values used when properties are not specified.
	 *
	 * @var array
	 */
	private const BORDER_DEFAULTS = array(
		'color' => '#dddddd',
		'width' => '1px',
		'style' => 'solid',
	);

	/**
	 * Convert WordPress preset value format to CSS custom property format.
	 *
	 * WordPress stores preset values as "var:preset|spacing|30" which needs to be
	 * converted to "var(--wp--preset--spacing--30)" for CSS.
	 *
	 * @param string $value The preset value string.
	 * @return string Converted CSS custom property or original value.
	 */
	public function convert_preset_value( string $value ): string {
		// Check if value matches WordPress preset format: var:preset|spacing|30.
		if ( preg_match( '/^var:preset\|([^|]+)\|(.+)$/', $value, $matches ) ) {
			$preset_type = $matches[1];
			$preset_slug = $matches[2];
			return sprintf( 'var(--wp--preset--%s--%s)', $preset_type, $preset_slug );
		}

		// If it's already a CSS custom property, return as-is.
		if ( strpos( $value, 'var(' ) === 0 ) {
			return $value;
		}

		// Otherwise return the original value.
		return $value;
	}

	/**
	 * Convert border value to CSS custom property declarations.
	 *
	 * Handles both flat format (e.g., { color: '#ddd', width: '1px', style: 'solid' })
	 * and per-side format (e.g., { top: { color, width, style }, right: {...}, ... }).
	 *
	 * @param array $border The border value (flat or per-side).
	 * @return array Array of CSS style declarations to add to style_parts.
	 */
	public function border_to_css( array $border ): array {
		$style_parts = array();

		// Check if it's a flat border (has color, width, or style at top level).
		if ( isset( $border['color'] ) || isset( $border['width'] ) || isset( $border['style'] ) ) {
			return $this->flat_border_to_css( $border );
		}

		// Check if it's per-side format (has top, right, bottom, left).
		return $this->per_side_border_to_css( $border );
	}

	/**
	 * Convert flat border format to CSS declarations.
	 *
	 * @param array $border The flat border object with color, width, style keys.
	 * @return array Array of CSS style declarations.
	 */
	private function flat_border_to_css( array $border ): array {
		$style_parts = array();

		$color = isset( $border['color'] ) ? $border['color'] : self::BORDER_DEFAULTS['color'];
		$width = isset( $border['width'] ) ? $border['width'] : self::BORDER_DEFAULTS['width'];
		$style = isset( $border['style'] ) ? $border['style'] : self::BORDER_DEFAULTS['style'];

		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--border-color: %s',
			esc_attr( $color )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--border-width: %s',
			esc_attr( $width )
		);
		$style_parts[] = sprintf(
			'--wp--custom--priority-plus-navigation--dropdown--border-style: %s',
			esc_attr( $style )
		);

		return $style_parts;
	}

	/**
	 * Convert per-side border format to CSS declarations.
	 *
	 * @param array $border The per-side border object with top, right, bottom, left keys.
	 * @return array Array of CSS style declarations.
	 */
	private function per_side_border_to_css( array $border ): array {
		$style_parts   = array();
		$sides         = array( 'top', 'right', 'bottom', 'left' );
		$side_css_vars = array(
			'top'    => '--wp--custom--priority-plus-navigation--dropdown--border-top',
			'right'  => '--wp--custom--priority-plus-navigation--dropdown--border-right',
			'bottom' => '--wp--custom--priority-plus-navigation--dropdown--border-bottom',
			'left'   => '--wp--custom--priority-plus-navigation--dropdown--border-left',
		);

		foreach ( $sides as $side ) {
			if ( isset( $border[ $side ] ) && is_array( $border[ $side ] ) ) {
				$side_border = $border[ $side ];
				// Only add CSS var if at least one property is set.
				if ( isset( $side_border['color'] ) || isset( $side_border['width'] ) || isset( $side_border['style'] ) ) {
					$width = isset( $side_border['width'] ) ? $side_border['width'] : self::BORDER_DEFAULTS['width'];
					$style = isset( $side_border['style'] ) ? $side_border['style'] : self::BORDER_DEFAULTS['style'];
					$color = isset( $side_border['color'] ) ? $side_border['color'] : self::BORDER_DEFAULTS['color'];

					$style_parts[] = sprintf(
						'%s: %s %s %s',
						$side_css_vars[ $side ],
						esc_attr( $width ),
						esc_attr( $style ),
						esc_attr( $color )
					);
				}
			}
		}

		return $style_parts;
	}

	/**
	 * Convert border radius value to CSS string.
	 *
	 * Handles both string format (e.g., '4px') and per-corner object format
	 * (e.g., { topLeft: '4px', topRight: '0', bottomRight: '4px', bottomLeft: '0' }).
	 *
	 * @param string|array $border_radius The border radius value.
	 * @return string CSS border-radius value string.
	 */
	public function border_radius_to_css( $border_radius ): string {
		// Handle string format directly.
		if ( is_string( $border_radius ) ) {
			return $border_radius;
		}

		// Handle object format (per-corner values).
		if ( is_array( $border_radius ) ) {
			return $this->per_corner_radius_to_css( $border_radius );
		}

		return '';
	}

	/**
	 * Convert per-corner border radius to CSS string.
	 *
	 * @param array $border_radius The per-corner border radius object.
	 * @return string CSS border-radius value string.
	 */
	private function per_corner_radius_to_css( array $border_radius ): string {
		$top_left     = isset( $border_radius['topLeft'] ) ? (string) $border_radius['topLeft'] : '';
		$top_right    = isset( $border_radius['topRight'] ) ? (string) $border_radius['topRight'] : '';
		$bottom_right = isset( $border_radius['bottomRight'] ) ? (string) $border_radius['bottomRight'] : '';
		$bottom_left  = isset( $border_radius['bottomLeft'] ) ? (string) $border_radius['bottomLeft'] : '';

		// If all values are empty, return empty string.
		if ( '' === $top_left && '' === $top_right && '' === $bottom_right && '' === $bottom_left ) {
			return '';
		}

		// If all values are the same, use single value shorthand.
		if ( '' !== $top_left && $top_left === $top_right && $top_right === $bottom_right && $bottom_right === $bottom_left ) {
			return $top_left;
		}

		// Use '0' for empty corners.
		$top_left     = '' !== $top_left ? $top_left : '0';
		$top_right    = '' !== $top_right ? $top_right : '0';
		$bottom_right = '' !== $bottom_right ? $bottom_right : '0';
		$bottom_left  = '' !== $bottom_left ? $bottom_left : '0';

		// Return full border-radius: top-left top-right bottom-right bottom-left.
		return $top_left . ' ' . $top_right . ' ' . $bottom_right . ' ' . $bottom_left;
	}

	/**
	 * Convert padding/spacing object to CSS value string.
	 *
	 * @param array $padding Padding object with top, right, bottom, left keys.
	 * @return string CSS padding value string.
	 */
	public function padding_to_css( array $padding ): string {
		if ( empty( $padding ) ) {
			return '';
		}

		$top    = isset( $padding['top'] ) ? (string) $padding['top'] : '';
		$right  = isset( $padding['right'] ) ? (string) $padding['right'] : '';
		$bottom = isset( $padding['bottom'] ) ? (string) $padding['bottom'] : '';
		$left   = isset( $padding['left'] ) ? (string) $padding['left'] : '';

		// If all values are empty, return empty string.
		if ( '' === $top && '' === $right && '' === $bottom && '' === $left ) {
			return '';
		}

		// Convert preset values to CSS custom property format.
		$top    = '' !== $top ? $this->convert_preset_value( $top ) : '';
		$right  = '' !== $right ? $this->convert_preset_value( $right ) : '';
		$bottom = '' !== $bottom ? $this->convert_preset_value( $bottom ) : '';
		$left   = '' !== $left ? $this->convert_preset_value( $left ) : '';

		return $this->build_shorthand_value( $top, $right, $bottom, $left );
	}

	/**
	 * Build CSS shorthand value from four sides.
	 *
	 * Produces the most compact valid CSS shorthand for the given values.
	 *
	 * @param string $top    Top value.
	 * @param string $right  Right value.
	 * @param string $bottom Bottom value.
	 * @param string $left   Left value.
	 * @return string CSS shorthand value.
	 */
	private function build_shorthand_value( string $top, string $right, string $bottom, string $left ): string {
		// If all values are the same and not empty, use single value shorthand.
		if ( '' !== $top && $top === $right && $right === $bottom && $bottom === $left ) {
			return $top;
		}

		// For partial values, use '0' for empty sides to ensure proper CSS.
		$top    = '' !== $top ? $top : '0';
		$right  = '' !== $right ? $right : '0';
		$bottom = '' !== $bottom ? $bottom : '0';
		$left   = '' !== $left ? $left : '0';

		// Use shorthand when top/bottom are same and left/right are same.
		if ( $top === $bottom && $right === $left ) {
			return $top . ' ' . $right;
		}

		// Otherwise, return all 4 values.
		return $top . ' ' . $right . ' ' . $bottom . ' ' . $left;
	}
}
