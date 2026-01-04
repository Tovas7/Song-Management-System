import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Song, Statistics } from '../../types';

interface SongsState {
  items: Song[];
  loading: boolean;
  error: string | null;
  selectedSong: Song | null;
}

const initialState: SongsState = {
  items: [],
  loading: false,
  error: null,
  selectedSong: null,
};

export const songsSlice = createSlice({
  name: 'songs',
  initialState,
  reducers: {
    fetchSongsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSongsSuccess: (state, action: PayloadAction<Song[]>) => {
      state.loading = false;
      state.items = action.payload;
    },
    fetchSongsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    createSongRequest: (state, action: PayloadAction<Omit<Song, '_id' | 'createdAt' | 'updatedAt'>>) => {
      state.loading = true;
      state.error = null;
    },
    createSongSuccess: (state, action: PayloadAction<Song>) => {
      state.loading = false;
      state.items.unshift(action.payload);
    },
    createSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateSongRequest: (state, action: PayloadAction<{ id: string; data: Partial<Song> }>) => {
      state.loading = true;
      state.error = null;
    },
    updateSongSuccess: (state, action: PayloadAction<Song>) => {
      state.loading = false;
      const index = state.items.findIndex(song => song._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
    updateSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteSongRequest: (state, action: PayloadAction<string>) => {
      state.loading = true;
      state.error = null;
    },
    deleteSongSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.items = state.items.filter(song => song._id !== action.payload);
    },
    deleteSongFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedSong: (state, action: PayloadAction<Song | null>) => {
      state.selectedSong = action.payload;
    },
  },
});

export const {
  fetchSongsRequest,
  fetchSongsSuccess,
  fetchSongsFailure,
  createSongRequest,
  createSongSuccess,
  createSongFailure,
  updateSongRequest,
  updateSongSuccess,
  updateSongFailure,
  deleteSongRequest,
  deleteSongSuccess,
  deleteSongFailure,
  setSelectedSong,
} = songsSlice.actions;

export default songsSlice.reducer;
