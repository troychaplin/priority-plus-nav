/**
 * WordPress dependencies
 */
import {
	TextControl,
	__experimentalUnitControl as UnitControl,
	__experimentalToolsPanel as ToolsPanel,
	__experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * MenuStylesPanel Component
 *
 * Provides controls for dropdown container styles (border, radius, shadow).
 *
 * @param {Object}   props                - Component props
 * @param {Object}   props.styles         - Current dropdown styles
 * @param {Function} props.updateStyle    - Function to update a style property
 * @param {Function} props.hasValue       - Function to check if a property has a value
 * @param {Function} props.resetToDefault - Function to reset a property to default
 * @return {JSX.Element} Menu styles panel component
 */
export function MenuStylesPanel({
	styles,
	updateStyle,
	hasValue,
	resetToDefault,
}) {
	return (
		<ToolsPanel
			label={__('Dropdown Menu Styles', 'priority-plus-navigation')}
			resetAll={() => {
				updateStyle('borderWidth', '1px');
				updateStyle('borderRadius', '4px');
				updateStyle('boxShadow', '0 4px 12px rgba(0, 0, 0, 0.15)');
			}}
		>
			{/* Border Width */}
			<ToolsPanelItem
				hasValue={() => hasValue('borderWidth')}
				label={__('Border Width', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('borderWidth', '1px')}
				isShownByDefault
			>
				<UnitControl
					label={__('Border Width', 'priority-plus-navigation')}
					value={styles.borderWidth || '1px'}
					onChange={(value) => updateStyle('borderWidth', value)}
					units={[
						{ value: 'px', label: 'px' },
						{ value: 'rem', label: 'rem' },
						{ value: 'em', label: 'em' },
					]}
				/>
			</ToolsPanelItem>

			{/* Border Radius */}
			<ToolsPanelItem
				hasValue={() => hasValue('borderRadius')}
				label={__('Border Radius', 'priority-plus-navigation')}
				onDeselect={() => resetToDefault('borderRadius', '4px')}
				isShownByDefault
			>
				<UnitControl
					label={__('Border Radius', 'priority-plus-navigation')}
					value={styles.borderRadius || '4px'}
					onChange={(value) => updateStyle('borderRadius', value)}
					units={[
						{ value: 'px', label: 'px' },
						{ value: 'rem', label: 'rem' },
						{ value: '%', label: '%' },
					]}
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
