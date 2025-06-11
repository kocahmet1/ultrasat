# Subcategory ID Standardization

## Overview

This document outlines the standardization of subcategory identifiers to use `kebab-case` as the canonical format throughout the application, replacing the previous numeric ID system. This change addresses format inconsistencies that were causing data mismatches and "Unknown Subcategory" errors.

## Background

Previously, the application used multiple formats for subcategory identification:

1. **Numeric IDs** (e.g., `1`, `2`, `26`) - Introduced to eliminate string format inconsistencies
2. **Kebab-case strings** (e.g., `central-ideas-details`, `area-volume`) - Used in URLs, routes, and historical data
3. **Human-readable names** (e.g., `Central Ideas and Details`, `Area and Volume`) - Used in UI displays

These multiple formats created friction points and required complex conversion logic throughout the codebase, leading to bugs and inconsistencies.

## Decision

We've standardized on **kebab-case** as the canonical identifier for subcategories because:

- It is already dominant in the database, UI routes, and existing components
- It's human-readable in the database, making debugging easier
- It avoids the need for lookup tables when moving between storage and display
- It aligns with URL conventions used in the application

## Implementation Details

### Changes Made

1. Updated `subcategoryServices.js`:
   - Modified `updateUserSubcategoryStats` to use kebab-case for document IDs
   - Refactored `getQuestionsForAdaptiveQuiz` to prioritize kebab-case matching

2. Updated `SubcategoryContext.jsx`:
   - Added `getKebabCaseSubcategory` function as the preferred way to get canonical IDs
   - Retained `getNumericSubcategoryId` for legacy compatibility
   - Updated helper methods to work with kebab-case first, falling back to numeric IDs

3. Updated `subcategoryConstants.js`:
   - Added proper deprecation notices for numeric ID functions
   - Added a new `getKebabCaseFromAnyFormat` helper
   - Documented kebab-case as the canonical format

4. Added Migration Tools:
   - Created `migrateSubcategoryStats.js` script to convert existing numeric IDs to kebab-case
   - Added `SubcategoryMigrationTool.jsx` component for admin users to run the migration

### Using the Migration Tool

Admin users can access the migration tool in the admin dashboard. It:

1. Scans the `userSubcategoryStats` collection for documents with numeric IDs
2. Creates new documents with kebab-case IDs containing the same data
3. Deletes the old numeric ID documents
4. Reports migration results

## Guidelines for Developers

### DO

- Use kebab-case as the canonical identifier for subcategories in all new code
- Use `getKebabCaseSubcategory` or `getKebabCaseFromAnyFormat` for conversions
- Store subcategory identifiers in kebab-case format in the database
- Keep document IDs for user stats as `${userId}_${kebabCaseSubcategory}`

### DON'T

- Create new code that relies on numeric IDs (use them only for legacy compatibility)
- Modify the `SUBCATEGORY_IDS` mapping (it's frozen and deprecated)
- Store numeric IDs in new database documents

### Example

Previously:
```javascript
// Numeric ID approach
const subcategoryId = getSubcategoryIdFromString(subcategory);
const docId = `${userId}_${subcategoryId}`;
```

Now:
```javascript
// Kebab-case approach
const kebabSubcategory = getKebabCaseSubcategory(subcategory);
const docId = `${userId}_${kebabSubcategory}`;
```

## Future Considerations

While we've standardized on kebab-case for subcategory identifiers, we're maintaining the numeric mapping tables for:

1. Legacy data access
2. Metadata (colors, categories, etc.)
3. Fallback for transition period

A future enhancement could be to move all metadata directly into a kebab-case keyed structure to eliminate the numeric IDs entirely.
