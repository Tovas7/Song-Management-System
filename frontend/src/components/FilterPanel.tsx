import React from 'react';
import styled from '@emotion/styled';

interface FilterPanelProps {
  selectedGenre: string | null;
  onFilterChange: (genre: string | null) => void;
}

const Container = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  font-weight: 500;
  color: #495057;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  font-size: 14px;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
  padding: 0;
  margin-left: auto;

  &:hover {
    color: #343a40;
  }
`;

const GENRES = ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Electronic', 'Country', 'Blues', 'Other'];

export const FilterPanel: React.FC<FilterPanelProps> = ({ selectedGenre, onFilterChange }) => {
  return (
    <Container>
      <Label htmlFor="genre-filter">Filter by Genre:</Label>
      <Select 
        id="genre-filter" 
        value={selectedGenre || ''} 
        onChange={(e) => onFilterChange(e.target.value || null)}
      >
        <option value="">All Genres</option>
        {GENRES.map(genre => (
          <option key={genre} value={genre}>{genre}</option>
        ))}
      </Select>
      
      {selectedGenre && (
        <ClearButton onClick={() => onFilterChange(null)}>
          Clear Filter
        </ClearButton>
      )}
    </Container>
  );
};
