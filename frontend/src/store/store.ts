import { configureStore } from '@reduxjs/toolkit'
import createSagaMiddleware from 'redux-saga'
import songsReducer from './slices/songsSlice'
import statisticsReducer from './slices/statisticsSlice'
import filtersReducer from './slices/filtersSlice'
import { rootSaga } from './sagas'

// Create the saga middleware
const sagaMiddleware = createSagaMiddleware()

// Configure store with initial setup
export const store = configureStore({
  reducer: {
    songs: songsReducer,
    statistics: statisticsReducer,
    filters: filtersReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: false, // Disable thunk since we're using saga
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(sagaMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})

// Run the root saga
sagaMiddleware.run(rootSaga)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch