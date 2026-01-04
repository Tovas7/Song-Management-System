import { call, put, takeLatest, all } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api';
import { Song, CreateSongDto, UpdateSongDto, Statistics } from '../../types';
import {
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
} from '../slices/songsSlice';
import {
    fetchStatisticsRequest,
    fetchStatisticsSuccess,
    fetchStatisticsFailure,
} from '../slices/statisticsSlice';
import { setGenreFilter } from '../slices/filtersSlice';

// Songs Sagas
function* fetchSongsSaga(action: PayloadAction<void>) {
    try {
        const songs: Song[] = yield call(api.fetchSongs);
        yield put(fetchSongsSuccess(songs));
    } catch (error: any) {
        yield put(fetchSongsFailure(error.message || 'Failed to fetch songs'));
    }
}

function* createSongSaga(action: PayloadAction<CreateSongDto>) {
    try {
        const song: Song = yield call(api.createSong, action.payload);
        yield put(createSongSuccess(song));
        // Refresh statistics after creating a song
        yield put(fetchStatisticsRequest());
    } catch (error: any) {
        yield put(createSongFailure(error.message || 'Failed to create song'));
    }
}

function* updateSongSaga(action: PayloadAction<{ id: string; data: UpdateSongDto }>) {
    try {
        const song: Song = yield call(api.updateSong, action.payload.id, action.payload.data);
        yield put(updateSongSuccess(song));
        // Refresh statistics after updating a song
        yield put(fetchStatisticsRequest());
    } catch (error: any) {
        yield put(updateSongFailure(error.message || 'Failed to update song'));
    }
}

function* deleteSongSaga(action: PayloadAction<string>) {
    try {
        yield call(api.deleteSong, action.payload);
        yield put(deleteSongSuccess(action.payload));
        // Refresh statistics after deleting a song
        yield put(fetchStatisticsRequest());
    } catch (error: any) {
        yield put(deleteSongFailure(error.message || 'Failed to delete song'));
    }
}

// Statistics Sagas
function* fetchStatisticsSaga() {
    try {
        const statistics: Statistics = yield call(api.fetchStatistics);
        yield put(fetchStatisticsSuccess(statistics));
    } catch (error: any) {
        yield put(fetchStatisticsFailure(error.message || 'Failed to fetch statistics'));
    }
}

// Filter Sagas
function* filterSongsSaga(action: PayloadAction<string | null>) {
    try {
        if (action.payload) {
            yield put(fetchSongsRequest()); // Set loading state
            const songs: Song[] = yield call(api.filterSongsByGenre, action.payload);
            yield put(fetchSongsSuccess(songs));
        } else {
            yield put(fetchSongsRequest());
        }
    } catch (error: any) {
        yield put(fetchSongsFailure(error.message || 'Failed to filter songs'));
    }
}

// Watcher Sagas
export function* rootSaga() {
    yield all([
        takeLatest(fetchSongsRequest.type, fetchSongsSaga),
        takeLatest(createSongRequest.type, createSongSaga),
        takeLatest(updateSongRequest.type, updateSongSaga),
        takeLatest(deleteSongRequest.type, deleteSongSaga),
        takeLatest(fetchStatisticsRequest.type, fetchStatisticsSaga),
        takeLatest(setGenreFilter.type, filterSongsSaga),
    ]);
}
