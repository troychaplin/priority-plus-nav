/**
 * WordPress dependencies
 */
import { PanelColorSettings } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import {
	DEFAULT_DROPDOWN_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
	DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
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
 * Provides color controls for dropdown menu styling.
 *
 * @param {Object}   props               - Component props
 * @param {Object}   props.attributes    - Block attributes
 * @param {Function} props.setAttributes - Function to update attributes
 * @return {JSX.Element} Color panel component
 */
export function ColorPanel({ attributes, setAttributes }) {
	const {
		priorityNavDropdownBackgroundColor,
		priorityNavDropdownItemHoverBackgroundColor,
		priorityNavDropdownItemHoverTextColor,
	} = attributes;

	return (
		<PanelColorSettings
			title={__('Priority Plus Menu Colors', 'priority-plus-navigation')}
			colorSettings={[
				{
					label: __('Background Color', 'priority-plus-navigation'),
					value: getDisplayValue(
						priorityNavDropdownBackgroundColor,
						DEFAULT_DROPDOWN_BACKGROUND_COLOR
					),
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownBackgroundColor:
								color || DEFAULT_DROPDOWN_BACKGROUND_COLOR,
						}),
					clearable: true,
				},
				{
					label: __(
						'Hover Background Color',
						'priority-plus-navigation'
					),
					value: getDisplayValue(
						priorityNavDropdownItemHoverBackgroundColor,
						DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR
					),
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownItemHoverBackgroundColor:
								color ||
								DEFAULT_DROPDOWN_ITEM_HOVER_BACKGROUND_COLOR,
						}),
					clearable: true,
				},
				{
					label: __('Hover Text Color', 'priority-plus-navigation'),
					value: getDisplayValue(
						priorityNavDropdownItemHoverTextColor,
						DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR
					),
					onChange: (color) =>
						setAttributes({
							priorityNavDropdownItemHoverTextColor:
								color || DEFAULT_DROPDOWN_ITEM_HOVER_TEXT_COLOR,
						}),
					clearable: true,
				},
			]}
		/>
	);
}
