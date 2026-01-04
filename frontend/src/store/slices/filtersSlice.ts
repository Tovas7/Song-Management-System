import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  genre: string | null;
}

const initialState: FiltersState = {
  genre: null,
};

export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setGenreFilter: (state, action: PayloadAction<string | null>) => {
      state.genre = action.payload;
    },
    clearFilters: (state) => {
      state.genre = null;
    },
  },
});

export const { setGenreFilter, clearFilters } = filtersSlice.actions;

export default filtersSlice.reducer;
