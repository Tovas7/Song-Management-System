import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import songsReducer, {
  fetchSongsRequest,
  fetchSongsSuccess,
  createSongSuccess,
  updateSongSuccess,
  deleteSongSuccess
} from '../slices/songsSlice';
import { rootSaga } from '../sagas';
import * as api from '../../api';

// Mock API
jest.mock('../../api');

describe('Redux Slices and Sagas', () => {
  let store: any;
  let sagaMiddleware: any;

  beforeEach(() => {
    sagaMiddleware = createSagaMiddleware();
    store = configureStore({
      reducer: {
        songs: songsReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
    });
    sagaMiddleware.run(rootSaga);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Songs Slice', () => {
    test('should handle initial state', () => {
      const state = store.getState().songs;
      expect(state).toEqual({
        items: [],
        loading: false,
        error: null,
        selectedSong: null,
      });
    });

    test('should handle fetchSongsRequest', () => {
      // Mock API to return a pending promise so saga doesn't complete immediately
      (api.fetchSongs as jest.Mock).mockImplementation(() => new Promise(() => { }));

      store.dispatch(fetchSongsRequest());
      const state = store.getState().songs;
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('should handle fetchSongsSuccess', () => {
      const mockSongs = [
        { _id: '1', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', genre: 'Rock', createdAt: '', updatedAt: '' }
      ];
      store.dispatch(fetchSongsSuccess(mockSongs));
      const state = store.getState().songs;
      expect(state.loading).toBe(false);
      expect(state.items).toEqual(mockSongs);
    });
  });

  describe('Property 4: Real-time UI Updates', () => {
    test('should update state immediately upon successful creation', async () => {
      const newSong = { _id: '2', title: 'New Song', artist: 'Artist 2', album: 'Album 2', genre: 'Pop', createdAt: '', updatedAt: '' };

      // Simulate successful API call
      (api.createSong as jest.Mock).mockResolvedValue(newSong);
      (api.fetchStatistics as jest.Mock).mockResolvedValue({});

      // Dispatch create action (via saga) isn't directly testable here without full integration
      // But we can test the reducer response to the success action
      store.dispatch(createSongSuccess(newSong));

      const state = store.getState().songs;
      expect(state.items).toContainEqual(newSong);
      expect(state.loading).toBe(false);
    });

    test('should update state immediately upon successful update', () => {
      const initialSong = { _id: '1', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', genre: 'Rock', createdAt: '', updatedAt: '' };
      store.dispatch(fetchSongsSuccess([initialSong]));

      const updatedSong = { ...initialSong, title: 'Updated Song' };
      store.dispatch(updateSongSuccess(updatedSong));

      const state = store.getState().songs;
      expect(state.items[0].title).toBe('Updated Song');
    });

    test('should update state immediately upon successful deletion', () => {
      const initialSong = { _id: '1', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', genre: 'Rock', createdAt: '', updatedAt: '' };
      store.dispatch(fetchSongsSuccess([initialSong]));

      store.dispatch(deleteSongSuccess('1'));

      const state = store.getState().songs;
      expect(state.items).toHaveLength(0);
    });
  });
});
