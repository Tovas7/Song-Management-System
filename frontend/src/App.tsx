import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { RootState } from './store/store';
import {
  fetchSongsRequest,
  createSongRequest,
  updateSongRequest,
  deleteSongRequest,
  setSelectedSong
} from './store/slices/songsSlice';
import {
  fetchStatisticsRequest
} from './store/slices/statisticsSlice';
import { setGenreFilter } from './store/slices/filtersSlice';
import { SongList } from './components/SongList';
import { SongForm } from './components/SongForm';
import { StatisticsPanel } from './components/StatisticsPanel';
import { FilterPanel } from './components/FilterPanel';
import { Song, CreateSongDto } from './types';

const GlobalStyles = css`
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f5f7fa;
    color: #212529;
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #343a40;
  margin: 0;
`;

const AddButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #0056b3;
  }
`;

const MainContent = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
`;

function App() {
  const dispatch = useDispatch();
  const { items: songs, loading: songsLoading, error: songsError, selectedSong } = useSelector((state: RootState) => state.songs);
  const { data: statistics, loading: statsLoading } = useSelector((state: RootState) => state.statistics);
  const { genre: genreFilter } = useSelector((state: RootState) => state.filters);

  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchSongsRequest());
    dispatch(fetchStatisticsRequest());
  }, [dispatch]);

  const handleCreateSong = (data: CreateSongDto) => {
    dispatch(createSongRequest(data));
    setIsFormOpen(false);
  };

  const handleUpdateSong = (data: CreateSongDto) => {
    if (selectedSong) {
      dispatch(updateSongRequest({ id: selectedSong._id, data }));
      dispatch(setSelectedSong(null));
      setIsFormOpen(false);
    }
  };

  const handleDeleteSong = (id: string) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      dispatch(deleteSongRequest(id));
    }
  };

  const handleEditClick = (song: Song) => {
    dispatch(setSelectedSong(song));
    setIsFormOpen(true);
  };

  const handleAddClick = () => {
    dispatch(setSelectedSong(null));
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    dispatch(setSelectedSong(null));
    setIsFormOpen(false);
  };

  const handleFilterChange = (genre: string | null) => {
    dispatch(setGenreFilter(genre));
  };

  return (
    <AppContainer>
      <Global styles={GlobalStyles} />
      <Header>
        <Title>Song Management</Title>
        <AddButton onClick={handleAddClick}>+ Add Song</AddButton>
      </Header>

      <StatisticsPanel statistics={statistics} loading={statsLoading} />

      <MainContent>
        {isFormOpen && (
          <SongForm
            initialData={selectedSong}
            onSubmit={selectedSong ? handleUpdateSong : handleCreateSong}
            onCancel={handleFormCancel}
            loading={songsLoading}
          />
        )}

        <div>
          <FilterPanel 
            selectedGenre={genreFilter} 
            onFilterChange={handleFilterChange} 
          />

          {songsError && <div style={{ color: 'red', marginBottom: '20px' }}>Error: {songsError}</div>}
          
          <SongList
            songs={songs}
            loading={songsLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteSong}
          />
        </div>
      </MainContent>
    </AppContainer>
  );
}

export default App;