# Priority Plus Navigation - theme.json Styling Integration

## Overview

Integrate theme.json support for Priority Plus Navigation styling, allowing users to customize dropdown menu appearance through their theme's theme.json file while maintaining plugin defaults.

## Goals

1. Enable theme.json-based styling for the Priority Plus dropdown menu
2. Strip down existing CSS to bare necessities
3. Set sensible plugin defaults that can be overridden via theme.json
4. Prepare foundation for future UI-based controls

**Note:** This is an unreleased product, so no backward compatibility considerations are needed.

## Current State Analysis

### Existing Styling (To Be Cleaned Up)

**_variables.scss** - Button-specific CSS custom properties (KEEP - already working):
- `--priority-plus-navigation--background`
- `--priority-plus-navigation--background-hover`
- `--priority-plus-navigation--color`
- `--priority-plus-navigation--color-hover`
- `--priority-plus-navigation--border-*`
- `--priority-plus-navigation--font-*`
- `--priority-plus-navigation--padding`

**style.scss** - Hardcoded dropdown styles (NEEDS CLEANUP):
- Lines 48-86: Dropdown container (background, border, border-radius, box-shadow, spacing)
- Lines 76-86: Dropdown item links (padding, hover background)
- Lines 106-108: Multi-level indentation (hardcoded 1rem)

### Block Attributes (Already Implemented)

Editor controls already exist for "More" button:
- `priorityNavMoreLabel`
- `priorityNavMoreIcon`
- `priorityNavMoreBackgroundColor`
- `priorityNavMoreBackgroundColorHover`
- `priorityNavMoreTextColor`
- `priorityNavMoreTextColorHover`
- `priorityNavMorePadding`

## Proposed theme.json Structure

### Recommended WordPress Pattern

According to WordPress documentation, custom settings use `settings.custom` which generates CSS custom properties with the `--wp--custom--` prefix. CamelCased keys are automatically converted to kebab-case.

**Reference:** [Theme.json Version 3 Reference](https://developer.wordpress.org/block-editor/reference-guides/theme-json-reference/theme-json-living/)

### Our Implementation

Users will define settings in their theme's `theme.json`:

```json
{
  "version": 3,
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "backgroundColor": "#ffffff",
          "borderColor": "#ddd",
          "borderWidth": "1px",
          "borderRadius": "4px",
          "boxShadow": "0 4px 12px rgba(0, 0, 0, 0.15)",
          "itemSpacing": "0.75rem 1rem",
          "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.05)",
          "itemHoverTextColor": "inherit",
          "multiLevelIndent": "1rem"
        }
      }
    }
  }
}
```

### Generated CSS Custom Properties

This generates the following CSS variables (automatically available):

- `--wp--custom--priority-plus-navigation--dropdown--background-color`
- `--wp--custom--priority-plus-navigation--dropdown--border-color`
- `--wp--custom--priority-plus-navigation--dropdown--border-width`
- `--wp--custom--priority-plus-navigation--dropdown--border-radius`
- `--wp--custom--priority-plus-navigation--dropdown--box-shadow`
- `--wp--custom--priority-plus-navigation--dropdown--item-spacing`
- `--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color`
- `--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color`
- `--wp--custom--priority-plus-navigation--dropdown--multi-level-indent`

## Implementation Plan

### Phase 1: Create Plugin Default theme.json

**File:** `/theme.json` (in plugin root)

WordPress supports theme.json files in plugins (since WP 6.1). This file provides default values that themes can override.

**Action:**
1. Create `theme.json` in plugin root
2. Define default values for Priority Plus dropdown styling
3. Use sensible defaults that match current hardcoded styles

**Reference:** Plugins can ship theme.json to provide defaults ([Global Settings & Styles Documentation](https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/))

### Phase 2: Refactor SCSS to Use CSS Custom Properties

**File:** `src/styles/style.scss`

**Actions:**

1. **Strip down dropdown container styles** (lines 48-86)
   - Remove hardcoded colors, borders, shadows, spacing
   - Replace with CSS custom property references using `var()`
   - Keep only structural/functional CSS (position, z-index, transitions, visibility)

2. **Update dropdown item styles** (lines 76-86)
   - Replace hardcoded padding with custom property
   - Replace hardcoded hover background with custom property
   - Add hover text color support

3. **Update multi-level accordion indentation** (lines 106-108)
   - Replace hardcoded `1rem` with custom property
   - Use CSS custom property for flexible nesting levels

**Example refactoring:**

```scss
// BEFORE (Hardcoded)
.priority-plus-navigation-dropdown {
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 4px;
}

// AFTER (CSS Custom Properties - no fallbacks needed)
.priority-plus-navigation-dropdown {
    background: var(--wp--custom--priority-plus-navigation--dropdown--background-color);
    border-width: var(--wp--custom--priority-plus-navigation--dropdown--border-width);
    border-style: solid;
    border-color: var(--wp--custom--priority-plus-navigation--dropdown--border-color);
    border-radius: var(--wp--custom--priority-plus-navigation--dropdown--border-radius);
    box-shadow: var(--wp--custom--priority-plus-navigation--dropdown--box-shadow);
}
```

### Phase 3: Remove Unnecessary CSS

**File:** `src/styles/style.scss`

**Actions:**
1. Identify and remove any extra spacing, radius, or decorative CSS not essential for core functionality
2. Keep only:
   - Positioning and layout (flexbox, absolute positioning)
   - Visibility/display states (hidden, open)
   - Transitions and transforms (animations)
   - ARIA-related display rules
   - Z-index and stacking context
3. Move all visual styling to CSS custom properties

### Phase 4: Documentation

**Files:**
- `README.md`
- `docs/README.md` or new `docs/theme-json-styling.md`

**Actions:**
1. Document the new theme.json integration
2. Provide example theme.json configuration
3. List all available custom properties
4. Explain the override hierarchy (plugin defaults → theme.json → block attributes for button)

### Phase 5: Testing

**Test Cases:**

1. **Default behavior** (no theme.json customization)
   - Dropdown displays with plugin default styles
   - Verify all CSS custom properties render correctly

2. **theme.json override**
   - Create test theme.json with custom values
   - Verify CSS custom properties are applied
   - Test all properties individually

3. **Multi-level navigation**
   - Test multi-level indentation with custom values
   - Verify nested accordions respect indentation setting

4. **Block attribute priority** (More button)
   - Verify More button block attributes still work
   - Confirm button styling is independent of dropdown styling

## File Changes Summary

### New Files
- `/theme.json` - Plugin default theme.json configuration

### Modified Files
- `src/styles/style.scss` - Refactor dropdown styles to use CSS custom properties
- `src/styles/_variables.scss` - Keep as-is (More button variables)
- `README.md` - Add theme.json documentation section
- `docs/` - Add theme.json styling guide (optional)

### No Changes Required
- `src/variation/controls.js` - Block controls stay the same (More button only)
- `classes/class-enqueues.php` - No changes needed (handles More button attributes)
- All JavaScript files - No changes needed

## CSS Custom Properties Reference

### Plugin Defaults → theme.json Overrides

| Property | Default Value | theme.json Path | CSS Variable |
|----------|---------------|-----------------|--------------|
| Dropdown Background | `#ffffff` | `settings.custom.priorityPlusNavigation.dropdown.backgroundColor` | `--wp--custom--priority-plus-navigation--dropdown--background-color` |
| Dropdown Border Color | `#dddddd` | `settings.custom.priorityPlusNavigation.dropdown.borderColor` | `--wp--custom--priority-plus-navigation--dropdown--border-color` |
| Dropdown Border Width | `1px` | `settings.custom.priorityPlusNavigation.dropdown.borderWidth` | `--wp--custom--priority-plus-navigation--dropdown--border-width` |
| Dropdown Border Radius | `4px` | `settings.custom.priorityPlusNavigation.dropdown.borderRadius` | `--wp--custom--priority-plus-navigation--dropdown--border-radius` |
| Dropdown Box Shadow | `0 4px 12px rgba(0, 0, 0, 0.15)` | `settings.custom.priorityPlusNavigation.dropdown.boxShadow` | `--wp--custom--priority-plus-navigation--dropdown--box-shadow` |
| Item Padding | `0.75rem 1rem` | `settings.custom.priorityPlusNavigation.dropdown.itemSpacing` | `--wp--custom--priority-plus-navigation--dropdown--item-spacing` |
| Item Hover Background | `rgba(0, 0, 0, 0.05)` | `settings.custom.priorityPlusNavigation.dropdown.itemHoverBackgroundColor` | `--wp--custom--priority-plus-navigation--dropdown--item-hover-background-color` |
| Item Hover Text Color | `inherit` | `settings.custom.priorityPlusNavigation.dropdown.itemHoverTextColor` | `--wp--custom--priority-plus-navigation--dropdown--item-hover-text-color` |
| Multi-level Indent | `1rem` | `settings.custom.priorityPlusNavigation.dropdown.multiLevelIndent` | `--wp--custom--priority-plus-navigation--dropdown--multi-level-indent` |

## Benefits of This Approach

1. **Standards-compliant** - Uses WordPress recommended theme.json pattern
2. **Flexible** - Theme builders can override only what they need
3. **Future-proof** - Easy to add UI controls later (read from theme.json, write to block attributes)
4. **Maintainable** - Separates concerns (plugin defaults vs. theme customization)
5. **Developer-friendly** - Clear, documented CSS custom properties
6. **Clean architecture** - No legacy code or backward compatibility hacks

## Usage for Theme Builders

Theme builders can customize the Priority Plus Navigation dropdown by adding settings to their theme's `theme.json`:

```json
{
  "version": 3,
  "settings": {
    "custom": {
      "priorityPlusNavigation": {
        "dropdown": {
          "backgroundColor": "#f0f0f0",
          "borderColor": "#999",
          "itemHoverBackgroundColor": "rgba(0, 0, 0, 0.08)"
        }
      }
    }
  }
}
```

Only the properties you want to override need to be specified. The plugin provides sensible defaults for all values.

## Future Enhancements (Post-Implementation)

Once theme.json integration is complete, future work could include:

1. **Editor UI Controls** - Add inspector controls for dropdown styling (similar to More button)
2. **Block Styles** - Register preset variations (e.g., "Minimal", "Card-style", "Bordered")
3. **Color Presets** - Integrate with theme color palette
4. **Spacing Presets** - Integrate with theme spacing scale
5. **Pattern Library** - Provide example configurations for common design systems

## Questions / Decisions Needed

- [ ] Should we support both `itemSpacing` (shorthand) and separate `itemPaddingTop`, `itemPaddingRight`, etc.?
- [ ] Should dropdown positioning (top offset, alignment) also be configurable via theme.json?
- [ ] Do we need separate properties for accordion button styling vs. regular links?
- [ ] Should the transition duration/easing be configurable?

## Success Criteria

- [ ] Plugin ships with `theme.json` providing sensible defaults
- [ ] All hardcoded dropdown styles replaced with CSS custom properties
- [ ] CSS stripped down to structural necessities only
- [ ] Theme builders can override dropdown styles via their theme.json
- [ ] Documentation clearly explains theme.json integration
- [ ] More button controls continue to work independently
- [ ] Multi-level navigation indentation is configurable
- [ ] All existing functionality preserved (no regressions)
