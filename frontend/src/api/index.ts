import axios from 'axios';
import { Song, CreateSongDto, UpdateSongDto, Statistics, ApiResponse } from '../types';

// Handle both Vite (import.meta.env) and Jest (process.env)
// Handle both Vite (import.meta.env) and Jest (process.env)
const getApiUrl = () => {
  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }
  // @ts-ignore
  // if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
  //   // @ts-ignore
  //   return import.meta.env.VITE_API_URL;
  // }
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchSongs = async (): Promise<Song[]> => {
  const response = await api.get<ApiResponse<Song[]>>('/songs');
  return response.data.data;
};

export const createSong = async (song: CreateSongDto): Promise<Song> => {
  const response = await api.post<ApiResponse<Song>>('/songs', song);
  return response.data.data;
};

export const updateSong = async (id: string, song: UpdateSongDto): Promise<Song> => {
  const response = await api.put<ApiResponse<Song>>(`/songs/${id}`, song);
  return response.data.data;
};

export const deleteSong = async (id: string): Promise<string> => {
  await api.delete<ApiResponse<any>>(`/songs/${id}`);
  return id;
};

export const fetchStatistics = async (): Promise<Statistics> => {
  const response = await api.get<ApiResponse<Statistics>>('/statistics');
  return response.data.data;
};

export const filterSongsByGenre = async (genre: string): Promise<Song[]> => {
  const response = await api.get<ApiResponse<Song[]>>(`/songs/filter?genre=${genre}`);
  return response.data.data;
};
