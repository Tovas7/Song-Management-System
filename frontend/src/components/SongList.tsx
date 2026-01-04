import React from 'react';
import styled from '@emotion/styled';
import { Song } from '../types';

interface SongListProps {
  songs: Song[];
  loading: boolean;
  onEdit: (song: Song) => void;
  onDelete: (id: string) => void;
}

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
`;

const Th = styled.th`
  text-align: left;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
  color: #495057;
  font-weight: 600;
`;

const Td = styled.td`
  padding: 16px;
  border-bottom: 1px solid #dee2e6;
  color: #212529;
`;

const ActionButton = styled.button<{ variant?: 'edit' | 'delete' }>`
  padding: 6px 12px;
  margin-right: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
  
  background-color: ${props => props.variant === 'delete' ? '#dc3545' : '#007bff'};
  color: white;

  &:hover {
    background-color: ${props => props.variant === 'delete' ? '#c82333' : '#0056b3'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: #6c757d;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-top: 20px;
`;

export const SongList: React.FC<SongListProps> = ({ songs, loading, onEdit, onDelete }) => {
  if (loading && songs.length === 0) {
    return <EmptyState>Loading songs...</EmptyState>;
  }

  if (songs.length === 0) {
    return <EmptyState>No songs found. Add one to get started!</EmptyState>;
  }

  return (
    <Table>
      <thead>
        <tr>
          <Th>Title</Th>
          <Th>Artist</Th>
          <Th>Album</Th>
          <Th>Genre</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody>
        {songs.map((song) => (
          <tr key={song._id}>
            <Td>{song.title}</Td>
            <Td>{song.artist}</Td>
            <Td>{song.album}</Td>
            <Td>{song.genre}</Td>
            <Td>
              <ActionButton onClick={() => onEdit(song)}>Edit</ActionButton>
              <ActionButton variant="delete" onClick={() => onDelete(song._id)}>Delete</ActionButton>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
