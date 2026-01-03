# Dropdown Styles Migration - Implementation Plan

## Overview

Migrate dropdown styling from theme.json to block attributes with a visual customizer interface. This provides per-block customization and better UX for non-technical users.

## Goals

1. Remove theme.json dependency entirely
2. Add visual dropdown customizer with live preview
3. Store styles as block attributes (per-block customization)
4. Maintain existing default values for consistency
5. Use WordPress native components for better UX

## Design Decisions

###  Confirmed Approach

- **Storage**: Block attributes (`priorityNavDropdownStyles`)
- **UI Pattern**: Modal with two-column layout (controls + preview)
- **Properties**: All 9 existing dropdown properties
- **Defaults**: Same as current theme.json/SCSS defaults
- **Theme.json**: Remove entirely (unreleased product, no migration needed)
- **PHP Rendering**: Extend existing `inject_priority_attributes()` method

### Key Benefits

- Per-block customization (header vs footer can differ)
- Better UX than editing theme.json
- Portable - styles travel with block
- Version controlled in post revisions
- Consistent with existing More button pattern

## Implementation Phases

### Phase 1: Backend Foundation (Attributes + PHP Rendering)

**Goal**: Set up block attributes and CSS generation without UI

#### 1.1 Add Block Attribute

**File**: `src/variation/block.js`

Add new attribute to the `registerBlockVariation` and `addFilter` sections:

```javascript
// In registerBlockVariation (line 21)
attributes: {
  className: 'is-style-priority-plus-navigation',
  overlayMenu: 'never',
  priorityNavEnabled: true,
  priorityNavMoreLabel: 'More',
  priorityNavMoreBackgroundColor: undefined,
  priorityNavMoreBackgroundColorHover: undefined,
  priorityNavMoreTextColor: undefined,
  priorityNavMoreTextColorHover: undefined,

  // NEW: Dropdown styles
  priorityNavDropdownStyles: {
    backgroundColor: '#ffffff',
    borderColor: '#dddddd',
    borderWidth: '1px',
    borderRadius: '4px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    itemSpacing: '0.75rem 1.25rem',
    itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
    itemHoverTextColor: 'inherit',
    multiLevelIndent: '1.25rem',
  },
},

// In addFilter - blocks.registerBlockType (line 41)
attributes: {
  ...settings.attributes,
  priorityNavEnabled: { type: 'boolean', default: false },
  priorityNavMoreLabel: { type: 'string', default: 'More' },
  // ... existing attributes ...

  // NEW: Dropdown styles attribute
  priorityNavDropdownStyles: {
    type: 'object',
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#dddddd',
      borderWidth: '1px',
      borderRadius: '4px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      itemSpacing: '0.75rem 1.25rem',
      itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
      itemHoverTextColor: 'inherit',
      multiLevelIndent: '1.25rem',
    },
  },
},
```

#### 1.2 PHP: Extend render_block Method

**File**: `classes/class-enqueues.php`

Modify the `render_block()` method to extract dropdown styles:

```php
public function render_block( string $block_content, array $block ): string {
  // ... existing code ...

  // After line 152, add:
  $dropdown_styles = $this->get_priority_attr( $block, 'priorityNavDropdownStyles', array() );

  // Pass to injection method (update line 155):
  return $this->inject_priority_attributes(
    $block_content,
    $more_label,
    $more_icon,
    $more_background_color,
    $more_background_color_hover,
    $more_text_color,
    $more_text_color_hover,
    $more_padding,
    $overlay_menu,
    $dropdown_styles  // NEW parameter
  );
}
```

#### 1.3 PHP: Add Dropdown Styles to inject_priority_attributes

**File**: `classes/class-enqueues.php`

Update method signature and add dropdown CSS custom properties:

```php
private function inject_priority_attributes(
  string $block_content,
  string $more_label,
  string $more_icon,
  string $more_background_color = '',
  string $more_background_color_hover = '',
  string $more_text_color = '',
  string $more_text_color_hover = '',
  array $more_padding = array(),
  string $overlay_menu = 'never',
  array $dropdown_styles = array()  // NEW parameter
): string {
  // ... existing code ...

  // After the More button custom properties (around line 369), add:

  // Add dropdown style CSS custom properties
  if ( ! empty( $dropdown_styles ) ) {
    $property_map = array(
      'backgroundColor' => '--wp--custom--priority-plus-navigation--dropdown--background-color',
      'borderColor' => '--wp--custom--priority-plus-navigation--dropdown--border-color',
      'borderWidth' => '--wp--custom--priority-plus-navigation--dropdown--border-width',
      'borderRadius' => '--wp--custom--priority-plus-navigation--dropdown--border-radius',
      'boxShadow' => '--wp--custom--priority-plus-navigation--dropdown--box-shadow',
      'itemSpacing' => '--wp--custom--priority-plus-navigation--dropdown--item-spacing',
      'itemHoverBackgroundColor' => '--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color',
      'itemHoverTextColor' => '--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color',
      'multiLevelIndent' => '--wp--custom--priority-plus-navigation--dropdown--multi-level-indent',
    );

    foreach ( $property_map as $attr_key => $css_var_name ) {
      if ( isset( $dropdown_styles[ $attr_key ] ) && '' !== $dropdown_styles[ $attr_key ] ) {
        $style_parts[] = sprintf(
          '%s: %s',
          $css_var_name,
          esc_attr( $dropdown_styles[ $attr_key ] )
        );
      }
    }
  }

  // ... rest of existing code ...
}
```

**Testing Phase 1:**
- Manually set `priorityNavDropdownStyles` attribute in browser console
- Verify CSS custom properties are injected into nav wrapper
- Verify styles override :root defaults from _variables.scss
- Check that frontend dropdown appearance changes

---

### Phase 2: Modal UI Structure

**Goal**: Create modal that opens/closes with basic two-column layout

#### 2.1 Add "Customize Dropdown" Button to Inspector

**File**: `src/variation/controls.js`

Add state and button after existing ToolsPanels (around line 269):

```javascript
import { useState } from '@wordpress/element';

// Inside withPriorityNavControls component, after line 103:
const [isDropdownCustomizerOpen, setIsDropdownCustomizerOpen] = useState(false);

// Add new ToolsPanel after the "Priority Plus Button" panel (after line 269):
<ToolsPanel
  label={__('Dropdown Styles', 'priority-plus-navigation')}
  resetAll={() => {
    setAttributes({
      priorityNavDropdownStyles: {
        backgroundColor: '#ffffff',
        borderColor: '#dddddd',
        borderWidth: '1px',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        itemSpacing: '0.75rem 1.25rem',
        itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
        itemHoverTextColor: 'inherit',
        multiLevelIndent: '1.25rem',
      },
    });
  }}
>
  <ToolsPanelItem
    hasValue={() => {
      const { priorityNavDropdownStyles } = attributes;
      return !!priorityNavDropdownStyles && Object.keys(priorityNavDropdownStyles).length > 0;
    }}
    label={__('Customize Dropdown', 'priority-plus-navigation')}
    onDeselect={() =>
      setAttributes({
        priorityNavDropdownStyles: undefined,
      })
    }
    isShownByDefault
  >
    <Button
      variant="secondary"
      onClick={() => setIsDropdownCustomizerOpen(true)}
      style={{ width: '100%' }}
    >
      {__('Customize Dropdown Styles', 'priority-plus-navigation')}
    </Button>
  </ToolsPanelItem>
</ToolsPanel>

{/* Render modal conditionally */}
{isDropdownCustomizerOpen && (
  <DropdownCustomizerModal
    attributes={attributes}
    setAttributes={setAttributes}
    onClose={() => setIsDropdownCustomizerOpen(false)}
  />
)}
```

#### 2.2 Create Modal Component File

**File**: `src/variation/components/dropdown-customizer-modal.js` (NEW)

```javascript
/**
 * WordPress dependencies
 */
import { Modal, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './dropdown-customizer-modal.scss';

export function DropdownCustomizerModal({ attributes, setAttributes, onClose }) {
  const { priorityNavDropdownStyles = {} } = attributes;

  return (
    <Modal
      title={__('Customize Dropdown Styles', 'priority-plus-navigation')}
      onRequestClose={onClose}
      className="priority-plus-dropdown-customizer"
      size="large"
      isDismissible={true}
    >
      <div className="dropdown-customizer-layout">
        <div className="dropdown-customizer-controls">
          <p>{__('Controls will go here', 'priority-plus-navigation')}</p>
        </div>

        <div className="dropdown-customizer-preview">
          <p>{__('Preview will go here', 'priority-plus-navigation')}</p>
        </div>
      </div>

      <div className="dropdown-customizer-footer">
        <Button variant="primary" onClick={onClose}>
          {__('Done', 'priority-plus-navigation')}
        </Button>
      </div>
    </Modal>
  );
}
```

#### 2.3 Create Modal Styles

**File**: `src/variation/components/dropdown-customizer-modal.scss` (NEW)

```scss
.priority-plus-dropdown-customizer {
  // Override default modal content padding
  .components-modal__content {
    padding: 0;
    display: flex;
    flex-direction: column;
    min-height: 600px;
  }

  .dropdown-customizer-layout {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
    flex: 1;
    overflow: hidden;
  }

  .dropdown-customizer-controls {
    overflow-y: auto;
    padding-right: 1rem;

    // Spacing between ToolsPanels
    .components-tools-panel {
      margin-bottom: 1.5rem;
    }
  }

  .dropdown-customizer-preview {
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    border-radius: 4px;
    padding: 2rem;
    position: sticky;
    top: 0;
    overflow-y: auto;
  }

  .dropdown-customizer-footer {
    padding: 1rem 2rem;
    border-top: 1px solid #ddd;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
  }

  // Responsive: stack on smaller screens
  @media (max-width: 960px) {
    .dropdown-customizer-layout {
      grid-template-columns: 1fr;
    }

    .dropdown-customizer-preview {
      position: static;
      min-height: 300px;
    }
  }
}
```

#### 2.4 Import Modal in controls.js

**File**: `src/variation/controls.js`

Add import at the top:

```javascript
import { DropdownCustomizerModal } from './components/dropdown-customizer-modal';
```

**Testing Phase 2:**
- Button appears in Inspector under "Dropdown Styles" panel
- Modal opens/closes correctly
- Two-column layout displays properly
- Modal is responsive on smaller screens
- ESC key closes modal

---

### Phase 3: Control Components

**Goal**: Add all 9 property controls with proper input types

#### 3.1 Import Required Components

**File**: `src/variation/components/dropdown-customizer-modal.js`

Update imports:

```javascript
import {
  Modal,
  Button,
  ColorPicker,
  TextControl,
  __experimentalUnitControl as UnitControl,
  __experimentalBoxControl as BoxControl,
  __experimentalToolsPanel as ToolsPanel,
  __experimentalToolsPanelItem as ToolsPanelItem,
} from '@wordpress/components';
```

#### 3.2 Add Helper Functions

**File**: `src/variation/components/dropdown-customizer-modal.js`

Add these helper functions before the component:

```javascript
/**
 * Parse spacing value string to BoxControl format
 * e.g., "0.75rem 1.25rem" -> { top: '0.75rem', right: '1.25rem', bottom: '0.75rem', left: '1.25rem' }
 */
function parseSpacingValue(value) {
  if (!value || typeof value !== 'string') {
    return { top: '0', right: '0', bottom: '0', left: '0' };
  }

  const parts = value.trim().split(/\s+/);

  if (parts.length === 1) {
    return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
  } else if (parts.length === 2) {
    return { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] };
  } else if (parts.length === 3) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[1] };
  } else if (parts.length === 4) {
    return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
  }

  return { top: '0', right: '0', bottom: '0', left: '0' };
}

/**
 * Format BoxControl value to spacing string
 * e.g., { top: '0.75rem', right: '1.25rem', bottom: '0.75rem', left: '1.25rem' } -> "0.75rem 1.25rem"
 */
function formatSpacingValue(values) {
  if (!values) {
    return '';
  }

  const { top = '0', right = '0', bottom = '0', left = '0' } = values;

  // All same
  if (top === right && right === bottom && bottom === left) {
    return top;
  }

  // Top/bottom same, left/right same
  if (top === bottom && right === left) {
    return `${top} ${right}`;
  }

  // All different
  return `${top} ${right} ${bottom} ${left}`;
}
```

#### 3.3 Add Update Helper Methods

**File**: `src/variation/components/dropdown-customizer-modal.js`

Inside the component:

```javascript
export function DropdownCustomizerModal({ attributes, setAttributes, onClose }) {
  const { priorityNavDropdownStyles = {} } = attributes;

  // Helper to update a single style property
  const updateStyle = (key, value) => {
    setAttributes({
      priorityNavDropdownStyles: {
        ...priorityNavDropdownStyles,
        [key]: value,
      },
    });
  };

  // Helper to check if a property has a value
  const hasValue = (key) => {
    return !!priorityNavDropdownStyles[key];
  };

  // Helper to reset a property to default
  const resetToDefault = (key, defaultValue) => {
    updateStyle(key, defaultValue);
  };

  // ... rest of component
}
```

#### 3.4 Implement All Controls

**File**: `src/variation/components/dropdown-customizer-modal.js`

Replace the controls placeholder with full implementation. See the full code in the continuation of this plan (this section is too long to include inline - refer to the detailed code examples in the original PLAN.md Phase 3 section for all 9 controls).

Key controls to implement:
1. Background Color (ColorPicker)
2. Border Color (ColorPicker)
3. Border Width (UnitControl)
4. Border Radius (UnitControl)
5. Box Shadow (TextControl)
6. Item Spacing (BoxControl)
7. Item Hover Background Color (ColorPicker)
8. Item Hover Text Color (ColorPicker)
9. Multi-level Indent (UnitControl)

#### 3.5 Add Control Styles

**File**: `src/variation/components/dropdown-customizer-modal.scss`

Add styles for controls:

```scss
.dropdown-customizer-control {
  margin-bottom: 1rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    font-size: 11px;
    text-transform: uppercase;
    color: #1e1e1e;
  }

  .components-color-picker {
    margin-top: 0.5rem;
  }
}

.components-tools-panel-item {
  margin-bottom: 0;
}
```

**Testing Phase 3:**
- All 9 controls render in modal
- Changing values updates `priorityNavDropdownStyles` attribute
- Color pickers support alpha channel
- UnitControl shows proper unit options
- BoxControl allows individual side spacing
- ToolsPanelItem reset (X button) works
- Values persist when closing/reopening modal

---

### Phase 4: Live Preview Component

**Goal**: Create visual preview that updates in real-time

#### 4.1 Create Preview Component

**File**: `src/variation/components/dropdown-preview.js` (NEW)

```javascript
/**
 * WordPress dependencies
 */
import { useMemo } from '@wordpress/element';

/**
 * Internal dependencies
 */
import './dropdown-preview.scss';

export function DropdownPreview({ styles }) {
  // Compute preview CSS custom properties from styles
  const previewStyles = useMemo(() => {
    return {
      '--preview-bg': styles.backgroundColor || '#ffffff',
      '--preview-border-color': styles.borderColor || '#dddddd',
      '--preview-border-width': styles.borderWidth || '1px',
      '--preview-border-radius': styles.borderRadius || '4px',
      '--preview-box-shadow': styles.boxShadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
      '--preview-item-spacing': styles.itemSpacing || '0.75rem 1.25rem',
      '--preview-item-hover-bg': styles.itemHoverBackgroundColor || 'rgba(0, 0, 0, 0.05)',
      '--preview-item-hover-color': styles.itemHoverTextColor || 'inherit',
      '--preview-multi-indent': styles.multiLevelIndent || '1.25rem',
    };
  }, [styles]);

  return (
    <div className="dropdown-preview-wrapper" style={previewStyles}>
      <div className="dropdown-preview-label">
        Preview
      </div>
      <div className="dropdown-preview-menu">
        <div className="dropdown-preview-item">
          Home
        </div>
        <div className="dropdown-preview-item">
          About Us
        </div>
        <div className="dropdown-preview-item dropdown-preview-item-hover">
          Services
          <span className="dropdown-preview-arrow">¼</span>
        </div>
        <div className="dropdown-preview-submenu">
          <div className="dropdown-preview-item dropdown-preview-item-nested">
            Web Design
          </div>
          <div className="dropdown-preview-item dropdown-preview-item-nested">
            Development
            <span className="dropdown-preview-arrow">¼</span>
          </div>
          <div className="dropdown-preview-submenu dropdown-preview-submenu-nested">
            <div className="dropdown-preview-item dropdown-preview-item-nested-2">
              WordPress
            </div>
            <div className="dropdown-preview-item dropdown-preview-item-nested-2">
              React
            </div>
          </div>
          <div className="dropdown-preview-item dropdown-preview-item-nested">
            Consulting
          </div>
        </div>
        <div className="dropdown-preview-item">
          Portfolio
        </div>
        <div className="dropdown-preview-item">
          Contact
        </div>
      </div>
    </div>
  );
}
```

#### 4.2 Create Preview Styles

**File**: `src/variation/components/dropdown-preview.scss` (NEW)

```scss
.dropdown-preview-wrapper {
  width: 100%;
  max-width: 320px;
}

.dropdown-preview-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #757575;
  margin-bottom: 1rem;
  letter-spacing: 0.5px;
}

.dropdown-preview-menu {
  background: var(--preview-bg);
  border-width: var(--preview-border-width);
  border-style: solid;
  border-color: var(--preview-border-color);
  border-radius: var(--preview-border-radius);
  box-shadow: var(--preview-box-shadow);
  list-style: none;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.dropdown-preview-item {
  padding: var(--preview-item-spacing);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease, color 0.2s ease;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  &:first-child {
    border-top: none;
  }

  &.dropdown-preview-item-hover {
    background: var(--preview-item-hover-bg);
    color: var(--preview-item-hover-color);
  }

  &.dropdown-preview-item-nested {
    padding-left: calc(var(--preview-multi-indent) + 1rem);
  }

  &.dropdown-preview-item-nested-2 {
    padding-left: calc((var(--preview-multi-indent) * 2) + 1rem);
  }

  // Hover effect for non-hover items
  &:not(.dropdown-preview-item-hover):hover {
    background: var(--preview-item-hover-bg);
    color: var(--preview-item-hover-color);
  }
}

.dropdown-preview-arrow {
  font-size: 0.7em;
  opacity: 0.6;
  margin-left: 0.5rem;
}

.dropdown-preview-submenu {
  background: transparent;
}
```

#### 4.3 Import and Use Preview in Modal

**File**: `src/variation/components/dropdown-customizer-modal.js`

Add import:

```javascript
import { DropdownPreview } from './dropdown-preview';
```

Replace preview placeholder:

```javascript
<div className="dropdown-customizer-preview">
  <DropdownPreview styles={priorityNavDropdownStyles} />
</div>
```

**Testing Phase 4:**
- Preview renders in right column
- Preview updates in real-time as controls change
- Preview accurately reflects all 9 style properties
- Nested navigation items show proper indentation
- Hover state is visually indicated
- Preview matches actual dropdown appearance on frontend

---

### Phase 5: Polish & UX Enhancements

**Goal**: Add helpful features and improve usability

#### 5.1 Add Reset to Defaults Button

**File**: `src/variation/components/dropdown-customizer-modal.js`

Update footer section:

```javascript
<div className="dropdown-customizer-footer">
  <Button
    variant="tertiary"
    isDestructive
    onClick={() => {
      setAttributes({
        priorityNavDropdownStyles: {
          backgroundColor: '#ffffff',
          borderColor: '#dddddd',
          borderWidth: '1px',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          itemSpacing: '0.75rem 1.25rem',
          itemHoverBackgroundColor: 'rgba(0, 0, 0, 0.05)',
          itemHoverTextColor: 'inherit',
          multiLevelIndent: '1.25rem',
        },
      });
    }}
  >
    {__('Reset to Defaults', 'priority-plus-navigation')}
  </Button>

  <Button variant="primary" onClick={onClose}>
    {__('Done', 'priority-plus-navigation')}
  </Button>
</div>
```

#### 5.2 Add Help Text to Controls

Add help prop to controls that need clarification:

```javascript
// Example:
<UnitControl
  label={__('Border Width', 'priority-plus-navigation')}
  value={priorityNavDropdownStyles.borderWidth || '1px'}
  onChange={(value) => updateStyle('borderWidth', value)}
  help={__('Thickness of the dropdown border', 'priority-plus-navigation')}
  units={[...]}
/>
```

**Testing Phase 5:**
- "Reset to Defaults" button works
- Help text is clear and helpful
- Modal is keyboard accessible
- All controls have proper labels

---

### Phase 6: Theme.json Removal & Documentation

**Goal**: Clean up theme.json support and update documentation

#### 6.1 Remove :root CSS Variables

**File**: `src/styles/_variables.scss`

Remove lines 7-17 (the dropdown CSS custom properties) entirely:

```scss
// CSS custom properties for Priority Plus Navigation

// More button styles (controlled via block attributes, not theme.json)
.is-style-priority-plus-navigation {
  --priority-plus-navigation--background: transparent;
  // ... rest stays ...
}
```

#### 6.2 Update Documentation

**Files to update:**
- `docs/styling.md` - Replace with new documentation (see detailed version in plan)
- `README.md` - Update Configuration section to mention Dropdown Customizer

**Testing Phase 6:**
- Build plugin and verify :root variables are removed
- Check that blocks work with default styles
- Documentation is accurate
- No console or PHP errors

---

## File Structure Summary

```
priority-plus-navigation/
   src/
      variation/
         block.js (modified)
         controls.js (modified)
         components/
             dropdown-customizer-modal.js (NEW)
             dropdown-customizer-modal.scss (NEW)
             dropdown-preview.js (NEW)
             dropdown-preview.scss (NEW)
      styles/
          _variables.scss (modified)
   classes/
      class-enqueues.php (modified)
   docs/
      styling.md (modified)
   README.md (modified)
```

## Success Criteria

- [ ] Users can customize all 9 dropdown properties without code
- [ ] Live preview accurately represents final appearance
- [ ] Modal UX feels polished and professional
- [ ] Performance is smooth (no lag)
- [ ] Code is maintainable and well-documented
- [ ] Fully accessible (keyboard and screen reader)
- [ ] Theme.json support fully removed
- [ ] Documentation complete and clear

## Future Enhancements (Post-MVP)

1. Preset style templates
2. Copy/paste styles between blocks
3. Visual box-shadow builder
4. Import/export styles as JSON
5. Block style variations with pre-configured styles
