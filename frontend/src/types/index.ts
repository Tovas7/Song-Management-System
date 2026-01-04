export interface Song {
  _id: string;
  title: string;
  artist: string;
  album: string;
  genre: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSongDto {
  title: string;
  artist: string;
  album: string;
  genre: string;
}

export interface UpdateSongDto extends Partial<CreateSongDto> {}

export interface Statistics {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalGenres: number;
  songsByGenre: Record<string, number>;
  songsByArtist: Record<string, number>;
  albumsByArtist: Record<string, number>;
  songsByAlbum: Record<string, number>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

export interface ApiError {
  message: string;
  code: string;
  details?: any;
}