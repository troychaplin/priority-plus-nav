/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_MENU_BACKGROUND_COLOR,
	DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
	DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
} from '../../constants';

/**
 * Check if a color value differs from its default.
 * Returns the value if it's different, undefined otherwise.
 * This allows PanelColorSettings to correctly show reset as available.
 *
 * @param {string} value        - Current color value
 * @param {string} defaultValue - Default color value
 * @return {string|undefined} Value if different from default, undefined otherwise
 */
function getDisplayValue(value, defaultValue) {
	if (!value || value === defaultValue) {
		return undefined;
	}
	return value;
}

/**
 * ColorPanel Component
 *
 * Provides color controls for menu styling.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Color panel component
 */
export function ColorPanel({ attributes, setAttributes }) {
	const {
		priorityPlusMenuBackgroundColor,
		priorityPlusMenuItemHoverBackground,
		priorityPlusMenuItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value: getDisplayValue(
						priorityPlusMenuBackgroundColor,
						DEFAULT_MENU_BACKGROUND_COLOR
					),
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuBackgroundColor:
								color || DEFAULT_MENU_BACKGROUND_COLOR,
						}),
					clearable: true,
				},
				{
					label: __(
						'Item Hover Background',
						'priority-plus-navigation'
					),
					value: getDisplayValue(
						priorityPlusMenuItemHoverBackground,
						DEFAULT_MENU_ITEM_HOVER_BACKGROUND
					),
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverBackground:
								color || DEFAULT_MENU_ITEM_HOVER_BACKGROUND,
						}),
					clearable: true,
				},
				{
					label: __(
						'Item Hover Text Color',
						'priority-plus-navigation'
					),
					value: getDisplayValue(
						priorityPlusMenuItemHoverTextColor,
						DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR
					),
					onChange: (color) =>
						setAttributes({
							priorityPlusMenuItemHoverTextColor:
								color || DEFAULT_MENU_ITEM_HOVER_TEXT_COLOR,
						}),
					clearable: true,
				},
			]}
		/>
	);
}
