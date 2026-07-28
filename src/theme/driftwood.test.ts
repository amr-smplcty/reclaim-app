import {
  darkColors,
  fontFamilies,
  getPalette,
  lightColors,
  resolveScheme,
  space,
  radius,
  typography,
} from '@/theme/tokens';

// Guards the Driftwood token structure introduced in Epic 15 (DESIGN_SYSTEM.md).
describe('Driftwood tokens', () => {
  describe('palette completeness', () => {
    it('light and dark palettes expose an identical set of keys', () => {
      expect(Object.keys(lightColors).sort()).toEqual(Object.keys(darkColors).sort());
    });

    it('includes every DESIGN_SYSTEM §2 token', () => {
      const required = [
        'surface',
        'surfaceRaised',
        'surfaceSunken',
        'textPrimary',
        'textSecondary',
        'textPlaceholder',
        'textDisabled',
        'accent',
        'accentPressed',
        'accentMuted',
        'accentSubtle',
        'success',
        'caution',
        'cautionSubtle',
        'cautionText',
        'destructive',
        'border',
        'borderStrong',
        'overlay',
        'onAccent',
      ];
      for (const key of required) {
        expect(lightColors).toHaveProperty(key);
        expect(darkColors).toHaveProperty(key);
      }
    });

    it('every color value is a non-empty color string', () => {
      for (const palette of [lightColors, darkColors]) {
        for (const value of Object.values(palette)) {
          expect(typeof value).toBe('string');
          expect(value).toMatch(/^#|^rgba?\(/);
        }
      }
    });

    it('drops the pre-Driftwood alias names (bg / danger / accentTint)', () => {
      for (const removed of ['bg', 'danger', 'accentTint']) {
        expect(lightColors).not.toHaveProperty(removed);
        expect(darkColors).not.toHaveProperty(removed);
      }
    });
  });

  describe('scheme resolution — dark is designed-first', () => {
    it('resolves an explicit light scheme to light', () => {
      expect(resolveScheme('light')).toBe('light');
      expect(getPalette('light')).toBe(lightColors);
    });

    it.each([['dark'], [null], [undefined], ['weird']])(
      'resolves %s to dark (the designed-first default)',
      (input) => {
        expect(resolveScheme(input as string | null | undefined)).toBe('dark');
        expect(getPalette(input as string | null | undefined)).toBe(darkColors);
      }
    );
  });

  describe('typography (DESIGN_SYSTEM §3)', () => {
    it('exposes the full scale', () => {
      for (const step of [
        'display',
        'title1',
        'title2',
        'title3',
        'body',
        'callout',
        'subhead',
        'footnote',
        'caption',
      ]) {
        expect(typography).toHaveProperty(step);
      }
    });

    it('uses serif for reading (body) and ceremony (display), sans elsewhere', () => {
      expect(typography.body.fontFamily).toBe(fontFamilies.serif);
      expect(typography.display.fontFamily).toBe(fontFamilies.serif);
      expect(typography.title1.fontFamily).toBe(fontFamilies.ui);
      expect(typography.callout.fontFamily).toBe(fontFamilies.ui);
      expect(typography.subhead.fontFamily).toBe(fontFamilies.ui);
    });

    it('matches the spec sizes for the key reading + title steps', () => {
      expect(typography.body.fontSize).toBe(17);
      expect(typography.body.lineHeight).toBe(26);
      expect(typography.title1.fontSize).toBe(28);
      expect(typography.display.fontSize).toBe(34);
    });
  });

  describe('spacing + radius scales (DESIGN_SYSTEM §4)', () => {
    it('spacing follows the 4pt scale', () => {
      expect(space).toMatchObject({
        xxs: 2,
        xs: 4,
        sm: 8,
        md: 12,
        base: 16,
        lg: 20,
        xl: 24,
        xxl: 32,
        xxxl: 48,
      });
    });

    it('radius matches r-xs…r-full', () => {
      expect(radius).toMatchObject({ xs: 6, sm: 10, md: 14, lg: 20, xl: 28, full: 999 });
    });
  });
});
