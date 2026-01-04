import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import App from '../App';
import songsReducer from '../store/slices/songsSlice';
import statisticsReducer from '../store/slices/statisticsSlice';
import filtersReducer from '../store/slices/filtersSlice';
import { rootSaga } from '../store/sagas';
import * as api from '../api';

// Mock API
jest.mock('../api');

const createTestStore = () => {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      songs: songsReducer,
      statistics: statisticsReducer,
      filters: filtersReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(rootSaga);
  return store;
};

describe('App Integration', () => {
  const mockSongs = [
    { _id: '1', title: 'Song 1', artist: 'Artist 1', album: 'Album 1', genre: 'Rock', createdAt: '', updatedAt: '' }
  ];

  const mockStats = {
    totalSongs: 1,
    totalArtists: 1,
    totalAlbums: 1,
    totalGenres: 1,
    songsByGenre: { 'Rock': 1 },
    songsByArtist: { 'Artist 1': 1 },
    albumsByArtist: { 'Artist 1': 1 },
    songsByAlbum: { 'Album 1': 1 }
  };

  beforeEach(() => {
    (api.fetchSongs as jest.Mock).mockResolvedValue(mockSongs);
    (api.fetchStatistics as jest.Mock).mockResolvedValue(mockStats);
    (api.filterSongsByGenre as jest.Mock).mockResolvedValue(mockSongs);
  });

  test('should render main layout and fetch initial data', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    expect(screen.getByText('Song Management')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Song 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Songs')).toBeInTheDocument();
  });

  test('should open add song form when button is clicked', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    fireEvent.click(screen.getByText('+ Add Song'));

    expect(screen.getByText('Add New Song')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
  });

  test('should filter songs when genre is selected', async () => {
    const store = createTestStore();
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    const filterSelect = screen.getByLabelText('Filter by Genre:');
    fireEvent.change(filterSelect, { target: { value: 'Rock' } });

    // Verify filter action was dispatched (indirectly via saga call)
    await waitFor(() => {
      expect(api.filterSongsByGenre).toHaveBeenCalledWith('Rock');
    });
  });
});
