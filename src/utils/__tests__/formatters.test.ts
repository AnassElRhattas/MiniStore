import { describe, it, expect } from 'vitest';
import { formatPrice, formatCurrency, formatDate, formatDateTime } from '../formatters';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('should format price with 2 decimal places', () => {
      expect(formatPrice(10)).toBe('10.00');
      expect(formatPrice(10.5)).toBe('10.50');
      expect(formatPrice(10.99)).toBe('10.99');
      expect(formatPrice(0)).toBe('0.00');
    });

    it('should handle negative prices', () => {
      expect(formatPrice(-10)).toBe('-10.00');
      expect(formatPrice(-10.99)).toBe('-10.99');
    });

    it('should handle decimal rounding', () => {
      expect(formatPrice(10.999)).toBe('11.00');
      expect(formatPrice(10.001)).toBe('10.00');
    });
  });

  describe('formatCurrency', () => {
    it('should format currency with default DH suffix', () => {
      expect(formatCurrency(10)).toBe('10.00 DH');
      expect(formatCurrency(10.5)).toBe('10.50 DH');
      expect(formatCurrency(0)).toBe('0.00 DH');
    });

    it('should format currency with custom currency', () => {
      expect(formatCurrency(10, 'USD')).toBe('10.00 USD');
      expect(formatCurrency(10.5, 'EUR')).toBe('10.50 EUR');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-10)).toBe('-10.00 DH');
      expect(formatCurrency(-10.99, 'USD')).toBe('-10.99 USD');
    });
  });

  describe('formatDate', () => {
    it('should format date in US format', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('December 25, 2023');
    });

    it('should format different dates correctly', () => {
      const date1 = new Date('2023-01-01');
      const date2 = new Date('2023-06-15');
      const date3 = new Date('2023-12-31');
      
      expect(formatDate(date1)).toBe('January 1, 2023');
      expect(formatDate(date2)).toBe('June 15, 2023');
      expect(formatDate(date3)).toBe('December 31, 2023');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time', () => {
      const date = new Date('2023-12-25T14:30:00');
      const result = formatDateTime(date);
      
      expect(result).toContain('December 25, 2023');
      expect(result).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });

    it('should format different times correctly', () => {
      const morning = new Date('2023-12-25T09:15:00');
      const afternoon = new Date('2023-12-25T15:45:00');
      const evening = new Date('2023-12-25T20:30:00');
      
      const morningResult = formatDateTime(morning);
      const afternoonResult = formatDateTime(afternoon);
      const eveningResult = formatDateTime(evening);
      
      expect(morningResult).toContain('December 25, 2023');
      expect(afternoonResult).toContain('December 25, 2023');
      expect(eveningResult).toContain('December 25, 2023');
      
      expect(morningResult).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
      expect(afternoonResult).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
      expect(eveningResult).toMatch(/\d{1,2}:\d{2} (AM|PM)/);
    });
  });
});