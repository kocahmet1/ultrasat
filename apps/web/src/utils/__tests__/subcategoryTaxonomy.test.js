/**
 * Regression tests for the canonical subcategory taxonomy (Phase 0, AI Coach).
 * Guards against the historical bug where subcategoryUtils and subcategoryConstants
 * disagreed on numeric ids 7-12 and 16-18, corrupting progress attribution.
 */

import {
  SUBCATEGORIES,
  ALL_KEBAB_IDS,
  toCanonicalSubcategoryId,
  getSection,
  getDisplayName,
} from '../subcategoryTaxonomy';
import {
  SUBCATEGORY_KEBAB_CASE,
  SUBCATEGORY_NAMES,
  SUBCATEGORY_SUBJECTS,
  getSubcategorySubject,
  getKebabCaseFromAnyFormat,
  getSubcategoriesArray,
} from '../subcategoryConstants';
import { normalizeSubcategoryName, getHumanReadableSubcategory } from '../subcategoryUtils';

describe('canonical taxonomy', () => {
  test('has exactly 29 unique subcategories with numeric ids 1..29', () => {
    expect(SUBCATEGORIES).toHaveLength(29);
    expect(new Set(ALL_KEBAB_IDS).size).toBe(29);
    const nums = SUBCATEGORIES.map((s) => s.numericId).sort((a, b) => a - b);
    expect(nums).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
  });

  test('resolver handles every representation', () => {
    expect(toCanonicalSubcategoryId(7)).toBe('rhetorical-synthesis');
    expect(toCanonicalSubcategoryId('7')).toBe('rhetorical-synthesis');
    expect(toCanonicalSubcategoryId('boundaries')).toBe('boundaries');
    expect(toCanonicalSubcategoryId('Rhetorical Synthesis')).toBe('rhetorical-synthesis');
    expect(toCanonicalSubcategoryId('form_structure_sense')).toBe('form-structure-sense');
    expect(toCanonicalSubcategoryId('Linear equations')).toBe('linear-equations-one-variable');
    expect(toCanonicalSubcategoryId('totally-unknown-tag')).toBeNull();
    expect(toCanonicalSubcategoryId(null)).toBeNull();
  });

  test('sections are correct', () => {
    expect(getSection('inferences')).toBe('reading-writing');
    expect(getSection('circles')).toBe('math');
    expect(getSection(24)).toBe('math'); // inference-statistics — historically misfiled as R&W by keyword matchers
  });
});

describe('historically-conflicted numeric ids (the corruption bug)', () => {
  const authoringIntent = {
    7: 'rhetorical-synthesis',
    8: 'transitions',
    9: 'boundaries',
    10: 'form-structure-sense',
    11: 'linear-equations-one-variable',
    12: 'linear-functions',
    16: 'nonlinear-functions',
    17: 'nonlinear-equations',
    18: 'equivalent-expressions',
  };

  test.each(Object.entries(authoringIntent))('numeric %s resolves to %s everywhere', (num, kebab) => {
    expect(SUBCATEGORY_KEBAB_CASE[Number(num)]).toBe(kebab);
    expect(normalizeSubcategoryName(num)).toBe(kebab); // was WRONG before Phase 0
    expect(toCanonicalSubcategoryId(Number(num))).toBe(kebab);
  });

  test('utils and constants can never disagree again (full 1..29 sweep)', () => {
    for (let n = 1; n <= 29; n++) {
      expect(normalizeSubcategoryName(String(n))).toBe(SUBCATEGORY_KEBAB_CASE[n]);
      expect(getKebabCaseFromAnyFormat(n)).toBe(SUBCATEGORY_KEBAB_CASE[n]);
    }
  });
});

describe('legacy export surfaces still behave', () => {
  test('constants maps are populated and consistent', () => {
    expect(Object.keys(SUBCATEGORY_NAMES)).toHaveLength(29);
    expect(SUBCATEGORY_NAMES[7]).toBe('Rhetorical Synthesis');
    expect(SUBCATEGORY_SUBJECTS[10]).toBe(1);
    expect(SUBCATEGORY_SUBJECTS[11]).toBe(2);
    expect(getSubcategoriesArray()[0]).toMatchObject({ id: 1, section: 'reading' });
  });

  test('getSubcategorySubject now also accepts kebab ids (fixes results-page section split)', () => {
    expect(getSubcategorySubject('boundaries')).toBe(1);
    expect(getSubcategorySubject('linear-functions')).toBe(2);
    expect(getSubcategorySubject(9)).toBe(1);
  });

  test('normalizeSubcategoryName fixes display-name inputs containing hyphens', () => {
    // Old code returned "Cross-Text Connections" unchanged because it contained a hyphen.
    expect(normalizeSubcategoryName('Cross-Text Connections')).toBe('cross-text-connections');
  });

  test('unknown kebab-ish strings still pass through (legacy behavior)', () => {
    expect(normalizeSubcategoryName('some-custom-tag')).toBe('some-custom-tag');
  });

  test('human-readable names use canonical display names', () => {
    expect(getHumanReadableSubcategory('form-structure-sense')).toBe('Form, Structure, and Sense');
    expect(getDisplayName('one-variable-data')).toBe('One-Variable Data');
  });
});
