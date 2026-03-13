import { describe, it, expect } from 'vitest';
import { getDateRange } from './dateUtils';

describe('getDateRange', () => {
  it('returns valid ISO strings for "today"', () => {
    const { startDate, endDate } = getDateRange('today');
    expect(new Date(startDate).getHours()).toBe(0);
    expect(new Date(startDate).getMinutes()).toBe(0);
    expect(new Date(endDate) > new Date(startDate)).toBe(true);
  });

  it('returns valid range for "lastWeek"', () => {
    const { startDate, endDate } = getDateRange('lastWeek');
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffDays = (end - start) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThanOrEqual(7);
  });

  it('returns valid range for "thisMonth"', () => {
    const { startDate } = getDateRange('thisMonth');
    const start = new Date(startDate);
    expect(start.getDate()).toBe(1);
  });

  it('returns valid range for "yesterday"', () => {
    const { startDate, endDate } = getDateRange('yesterday');
    const start = new Date(startDate);
    const end = new Date(endDate);
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(23);
  });

  it('returns valid range for "thisQuarter"', () => {
    const { startDate } = getDateRange('thisQuarter');
    const start = new Date(startDate);
    // Quarter start month should be 0, 3, 6, or 9
    expect([0, 3, 6, 9]).toContain(start.getMonth());
    expect(start.getDate()).toBe(1);
  });

  it('throws for invalid range', () => {
    expect(() => getDateRange('invalid')).toThrow('Invalid range specified');
  });
});
