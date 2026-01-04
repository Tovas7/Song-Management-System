import React from 'react';
import styled from '@emotion/styled';
import { Statistics } from '../types';

interface StatisticsPanelProps {
  statistics: Statistics | null;
  loading: boolean;
}

const PanelContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const DetailedStatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const DetailedCard = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 16px;
  color: #343a40;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 200px;
  overflow-y: auto;
`;

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f5;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  background-color: #e9ecef;
  color: #495057;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

export const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ statistics, loading }) => {
  if (loading && !statistics) {
    return <div>Loading statistics...</div>;
  }

  if (!statistics) {
    return null;
  }

  return (
    <>
      <PanelContainer>
        <StatCard>
          <StatValue>{statistics.totalSongs}</StatValue>
          <StatLabel>Total Songs</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{statistics.totalArtists}</StatValue>
          <StatLabel>Total Artists</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{statistics.totalAlbums}</StatValue>
          <StatLabel>Total Albums</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{statistics.totalGenres}</StatValue>
          <StatLabel>Total Genres</StatLabel>
        </StatCard>
      </PanelContainer>

      <DetailedStatsContainer>
        <DetailedCard>
          <CardTitle>Songs by Genre</CardTitle>
          <List>
            {Object.entries(statistics.songsByGenre).map(([genre, count]) => (
              <ListItem key={genre}>
                <span>{genre}</span>
                <Badge>{count}</Badge>
              </ListItem>
            ))}
          </List>
        </DetailedCard>

        <DetailedCard>
          <CardTitle>Songs by Artist</CardTitle>
          <List>
            {Object.entries(statistics.songsByArtist).slice(0, 10).map(([artist, count]) => (
              <ListItem key={artist}>
                <span>{artist}</span>
                <Badge>{count}</Badge>
              </ListItem>
            ))}
          </List>
        </DetailedCard>

        <DetailedCard>
          <CardTitle>Albums by Artist</CardTitle>
          <List>
            {Object.entries(statistics.albumsByArtist).slice(0, 10).map(([artist, count]) => (
              <ListItem key={artist}>
                <span>{artist}</span>
                <Badge>{count}</Badge>
              </ListItem>
            ))}
          </List>
        </DetailedCard>
      </DetailedStatsContainer>
    </>
  );
};
