import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SongList } from '../SongList';
import { SongForm } from '../SongForm';
import { StatisticsPanel } from '../StatisticsPanel';
import { Song, Statistics } from '../../types';

describe('UI Components', () => {
  const mockSong: Song = {
    _id: '1',
    title: 'Test Song',
    artist: 'Test Artist',
    album: 'Test Album',
    genre: 'Rock',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01'
  };

  describe('Property 6: UI Data Display Completeness', () => {
    test('should display all required song fields in SongList', () => {
      render(
        <SongList 
          songs={[mockSong]} 
          loading={false} 
          onEdit={() => {}} 
          onDelete={() => {}} 
        />
      );

      expect(screen.getByText('Test Song')).toBeInTheDocument();
      expect(screen.getByText('Test Artist')).toBeInTheDocument();
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('Rock')).toBeInTheDocument();
    });
  });

  describe('Property 7: Edit Form Population', () => {
    test('should populate form with song data when editing', () => {
      render(
        <SongForm 
          initialData={mockSong} 
          onSubmit={() => {}} 
          onCancel={() => {}} 
          loading={false} 
        />
      );

      expect(screen.getByDisplayValue('Test Song')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Artist')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Album')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Rock')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    test('should display statistics correctly', () => {
      const mockStats: Statistics = {
        totalSongs: 10,
        totalArtists: 5,
        totalAlbums: 3,
        totalGenres: 2,
        songsByGenre: { 'Rock': 6, 'Pop': 4 },
        songsByArtist: { 'Artist 1': 6, 'Artist 2': 4 },
        albumsByArtist: { 'Artist 1': 2, 'Artist 2': 1 },
        songsByAlbum: { 'Album 1': 6, 'Album 2': 4 }
      };

      render(<StatisticsPanel statistics={mockStats} loading={false} />);

      expect(screen.getByText('10')).toBeInTheDocument(); // Total Songs
      expect(screen.getByText('5')).toBeInTheDocument();  // Total Artists
      expect(screen.getByText('3')).toBeInTheDocument();  // Total Albums
      
      const twos = screen.getAllByText('2');
      expect(twos.length).toBeGreaterThan(0);
      
      expect(screen.getByText('Rock')).toBeInTheDocument();
      // '6' appears multiple times (Rock count, Artist 1 count, Album 1 count)
      const sixes = screen.getAllByText('6');
      expect(sixes.length).toBeGreaterThan(0);
    });
  });
});
