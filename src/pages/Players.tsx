import { useAppDispatch } from '../app/hooks';
import { useState } from 'react';
import { useGetPlayersQuery, useDeletePlayerMutation, useGetClubsQuery, useGetTeamsQuery } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddPlayerModal, openEditPlayerModal, openPlayerStatsModal } from '../features/ui/uiSlice';
import PlayerModal from '../modals/PlayerModal';
import PlayerStatsModal from '../modals/PlayerStatsModal';

export default function PlayersIndex() {
  const { data: players = [], isLoading, isError, error } = useGetPlayersQuery();
  const { data: clubs = [] } = useGetClubsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const dispatch = useAppDispatch();
  const [deletePlayer] = useDeletePlayerMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);
  const [clubFilter, setClubFilter] = useState('Guco');

  if (isLoading) {
    return <p>Loading players ...</p>
  }

  if (isError) {
    return (
      <p>Error loading players: {JSON.stringify(error)}</p>
    )
  }

  const onOpenAddModal = (() => {
    setIsOpen(true);
    dispatch(openAddPlayerModal())
  })

  const onOpenEditModal = ((player: any) => {
    setIsOpen(true);
    dispatch(openEditPlayerModal(player.id))
  })

  const onOpenPlayerStatsModal = ((player: any) => {
    setIsOpenStats(true);
    dispatch(openPlayerStatsModal(player.id))
  })

  const onCloseModal = (() => {
    setIsOpen(false);
  })

  const onCloseStatsModal = (() => {
    setIsOpenStats(false);
  })
  
  return (
    <div>
      <ul className="listContainer">
        <div>
          <button className="btn" onClick={onOpenAddModal}>
            Add Player
          </button>
          <input
            className="input"
            type="search"
            placeholder="Filter by club"
            aria-label="Filter players by club"
            value={clubFilter}
            onChange={(event) => setClubFilter(event.target.value)}
            style={{ marginLeft: '0.5rem' }}
          />
        </div>
        <div className="listHeader">
          <div className="listHeaderItem XL">Last Name</div>
          <div className="listHeaderItem L">First Name</div>
          <div className="listHeaderItem M">Date of Birth</div>
          <div className="listHeaderItem L">Actions</div>
        </div>
        {[...players]
          .filter((player) => {
            const playerTeams = teams.filter((team) => team.playerIds?.some((includedPlayer) => includedPlayer === player.id))
            const playerClubs = clubs.filter((club) => playerTeams.some((team) => team.clubId === club.id));
            const clubNames = playerClubs.map((club) => club?.name);
            const filter = clubFilter.trim().toLowerCase();
            return clubNames.some((clubName: string | undefined) =>
              (clubName ?? '').toLowerCase().includes(filter)
            );
          })
          .sort((a, b) => a.lastName.localeCompare(b.lastName))
          .map(player => (
        <li key={player.id}>
          <div className="listRow">
            <div className="listItem XL" onClick={() => onOpenEditModal(player)}>
                {player.lastName}
            </div>
            <div className="listItem L" onClick={() => onOpenEditModal(player)}>
                {player.firstName}
            </div>
            <div className="listItem M" onClick={() => onOpenEditModal(player)}>
                {player.dateOfBirth}
            </div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenEditModal(player)}>
                Edit
              </button>
              <button className="btn" onClick={() => onOpenPlayerStatsModal(player)}>
                Stats
              </button>
              <button
                className="btn"
                onClick={() => {
                  if (window.confirm(`Are you sure you want to delete ${player.firstName} ${player.lastName}?`)) {
                    deletePlayer(player.id);
                  }
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </li>
        ))}
      </ul>
      <PlayerModal 
        isOpen={isOpen}
        onClose={onCloseModal}
      />
      <PlayerStatsModal 
        isOpen={isOpenStats}
        onClose={onCloseStatsModal}
      />
    </div>
  );
};

