import { store } from '../store';

describe('Redux Store', () => {
  test('should be created with initial state', () => {
    const state = store.getState();
    expect(state).toBeDefined();
    // Verify initial state structure
    expect(state).toHaveProperty('songs');
    expect(state).toHaveProperty('statistics');
    expect(state).toHaveProperty('filters');
  });

  test('should have dispatch method', () => {
    expect(store.dispatch).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
  });
});
