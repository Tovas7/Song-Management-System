import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { Song, CreateSongDto } from '../types';

interface SongFormProps {
  initialData?: Song | null;
  onSubmit: (data: CreateSongDto) => void;
  onCancel: () => void;
  loading: boolean;
}

const FormContainer = styled.div`
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 20px;
  color: #343a40;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #495057;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'secondary' }>`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;

  background-color: ${props => props.variant === 'secondary' ? '#6c757d' : '#28a745'};
  color: white;

  &:hover {
    background-color: ${props => props.variant === 'secondary' ? '#5a6268' : '#218838'};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.span`
  color: #dc3545;
  font-size: 14px;
  margin-top: 4px;
  display: block;
`;

const GENRES = ['Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Electronic', 'Country', 'Blues', 'Other'];

export const SongForm: React.FC<SongFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState<CreateSongDto>({
    title: '',
    artist: '',
    album: '',
    genre: '',
  });

  const [errors, setErrors] = useState<Partial<CreateSongDto>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        artist: initialData.artist,
        album: initialData.album,
        genre: initialData.genre,
      });
    } else {
      setFormData({
        title: '',
        artist: '',
        album: '',
        genre: '',
      });
    }
    setErrors({});
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Partial<CreateSongDto> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }
    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist is required';
      isValid = false;
    }
    if (!formData.album.trim()) {
      newErrors.album = 'Album is required';
      isValid = false;
    }
    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof CreateSongDto]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <FormContainer>
      <FormTitle>{initialData ? 'Edit Song' : 'Add New Song'}</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter song title"
          />
          {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="artist">Artist</Label>
          <Input
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleChange}
            placeholder="Enter artist name"
          />
          {errors.artist && <ErrorMessage>{errors.artist}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="album">Album</Label>
          <Input
            id="album"
            name="album"
            value={formData.album}
            onChange={handleChange}
            placeholder="Enter album name"
          />
          {errors.album && <ErrorMessage>{errors.album}</ErrorMessage>}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="genre">Genre</Label>
          <Select
            id="genre"
            name="genre"
            value={formData.genre}
            onChange={handleChange}
          >
            <option value="">Select a genre</option>
            {GENRES.map(genre => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </Select>
          {errors.genre && <ErrorMessage>{errors.genre}</ErrorMessage>}
        </FormGroup>

        <ButtonGroup>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (initialData ? 'Update Song' : 'Add Song')}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};
