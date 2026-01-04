/**
 * WordPress dependencies
 */
import {
	TextControl,
	Flex,
	FlexItem,
	RangeControl,
	__experimentalSpacer as Spacer,
	__experimentalBorderControl as BorderControl,
	__experimentalUnitControl as UnitControl,
	__experimentalParseQuantityAndUnitFromRawValue as parseQuantityAndUnitFromRawValue,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { useSetting } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Range control settings for different units
 */
const BORDER_RADIUS_RANGE_SETTINGS = {
	px: { max: 100, step: 1 },
	'%': { max: 100, step: 1 },
	em: { max: 10, step: 0.1 },
	rem: { max: 10, step: 0.1 },
};

/**
 * Available units for border radius
 */
const BORDER_RADIUS_UNITS = [
	{ value: 'px', label: 'px' },
	{ value: '%', label: '%' },
	{ value: 'em', label: 'em' },
	{ value: 'rem', label: 'rem' },
];

/**
 * BorderRadiusControl Component
 *
 * A composite control combining UnitControl and RangeControl for border radius,
 * following the same pattern as WordPress core's HeightControl.
 *
 * @param {Object}   props          - Component props
 * @param {string}   props.value    - Current border radius value (e.g., '4px')
 * @param {Function} props.onChange - Callback when value changes
 * @return {JSX.Element} Border radius control component
 */
function BorderRadiusControl({ value, onChange }) {
	// Parse the value into quantity and unit
	const [quantity, unit] = parseQuantityAndUnitFromRawValue(value);
	const selectedUnit = unit || 'px';
	const numericValue = quantity !== undefined ? quantity : 4;

	// Get range settings for current unit
	const rangeSettings = BORDER_RADIUS_RANGE_SETTINGS[selectedUnit] || {
		max: 100,
		step: 1,
	};

	// Handle slider changes
	const handleSliderChange = (newValue) => {
		onChange(`${newValue}${selectedUnit}`);
	};

	// Handle unit control changes (includes both value and unit changes)
	const handleUnitControlChange = (newValue) => {
		onChange(newValue);
	};

	return (
		<fieldset className="priority-plus-border-radius-control">
			<Flex>
				<FlexItem isBlock>
					<UnitControl
						label={__('Border Radius', 'priority-plus-navigation')}
						hideLabelFromVision
						value={value}
						onChange={handleUnitControlChange}
						units={BORDER_RADIUS_UNITS}
						min={0}
						size="__unstable-large"
					/>
				</FlexItem>
				<FlexItem isBlock>
					<Spacer marginX={2} marginBottom={0}>
						<RangeControl
							label={__(
								'Border Radius',
								'priority-plus-navigation'
							)}
							hideLabelFromVision
							value={numericValue}
							onChange={handleSliderChange}
							min={0}
							max={rangeSettings.max}
							step={rangeSettings.step}
							withInputField={false}
							__nextHasNoMarginBottom
						/>
					</Spacer>
				</FlexItem>
			</Flex>
		</fieldset>
	);
}

/**
 * MenuStylesPanel Component
 *
 * Provides controls for dropdown container styles (border, radius, shadow).
 *
 * @param {Object}   props                - Component props
 * @param {Object}   props.styles         - Current dropdown styles
 * @param {Function} props.updateStyle    - Function to update a style property
 * @param {Function} props.hasBorderValue - Function to check if border has a value
 * @param {Function} props.hasValue       - Function to check if a property has a value
 * @param {Function} props.resetToDefault - Function to reset a property to default
 * @return {JSX.Element} Menu styles panel component
 */
export function MenuStylesPanel({
	styles,
	updateStyle,
	hasBorderValue,
	hasValue,
	resetToDefault,
}) {
	// Get color palette from theme settings
	const colors = useSetting('color.palette') || [];

	// Convert individual border properties to BorderControl format
	const borderValue = {
		color: styles.borderColor,
		style: styles.borderStyle || 'solid',
		width: styles.borderWidth,
	};

	// Handle border changes from BorderControl
	const handleBorderChange = (newBorder) => {
		const updates = {};

		// Handle undefined/cleared border
		if (newBorder === undefined) {
			updates.borderColor = undefined;
			updates.borderWidth = undefined;
			updates.borderStyle = undefined;
		} else {
			if (newBorder.color !== undefined) {
				updates.borderColor = newBorder.color;
			}
			if (newBorder.width !== undefined) {
				updates.borderWidth = newBorder.width;
			}
			if (newBorder.style !== undefined) {
				updates.borderStyle = newBorder.style;
			}
		}

		// Update all border properties at once
		if (Object.keys(updates).length > 0) {
			updateStyle('border', updates);
		}
	};

	return (
		<ToolsPanel
			label={__('Dropdown Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				updateStyle('borderColor', '#dddddd');
				updateStyle('borderWidth', '1px');
				updateStyle('borderRadius', '4px');
				updateStyle('boxShadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
			}}
		>
			{/* Border */}
			<ToolsPanelItem
				hasValue={hasBorderValue}
				label={__('Border', 'priority-plus-navigation')}
				onDeselect={() => {
					resetToDefault('borderColor', '#dddddd');
					resetToDefault('borderWidth', '1px');
					resetToDefault('borderStyle', 'solid');
				}}
				isShownByDefault
			>
				<BorderControl
					label={__('Border', 'priority-plus-navigation')}
					colors={colors}
					value={borderValue}
					onChange={handleBorderChange}
					enableAlpha={true}
					enableStyle={true}
					size="__unstable-large"
					withSlider={true}
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() => hasValue('borderRadius')}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('borderRadius', '4px')}
				isShownByDefault
			>
				<BorderRadiusControl
					value={styles.borderRadius || '4px'}
					onChange={(value) => updateStyle('borderRadius', value)}
				/>
			</ToolsPanelItem>

			{/* Box Shadow */}
			<ToolsPanelItem
				hasValue={() => hasValue('boxShadow')}
				label={__('Box Shadow', 'priority-plus-navigation')}
				onDeselect={() =>
					resetToDefault(
						'boxShadow',
						'0 4px 12px rgba(0, 0, 0, 0.15)'
					)
				}
				isShownByDefault
			>
				<TextControl
					label={__('Box Shadow', 'priority-plus-navigation')}
					value={styles.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)'}
					onChange={(value) => updateStyle('boxShadow', value)}
					help={__(
						'CSS box-shadow property',
						'priority-plus-navigation'
					)}
				/>
			</ToolsPanelItem>
		</ToolsPanel>
	);
}
