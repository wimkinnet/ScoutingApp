import { useAppDispatch } from '../app/hooks';
import { useState } from 'react';
import { useGetPlayersQuery, useDeletePlayerMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddPlayerModal, openEditPlayerModal } from '../features/ui/uiSlice';
import PlayerModal from '../modals/PlayerModal';

export default function PlayersIndex() {
  const { data: players = [], isLoading, isError, error } = useGetPlayersQuery();
  const dispatch = useAppDispatch();
  const [deletePlayer] = useDeletePlayerMutation();
  const [isOpen, setIsOpen] = useState(false);

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

  const onCloseModal = (() => {
    setIsOpen(false);
  })
  
  return (
    <div>
      <ul className="listContainer">
        <button className="btn" onClick={onOpenAddModal}>
          Add Player
        </button>
        <div className="listHeader">
          <div className="listHeaderItem L">Last Name</div>
          <div className="listHeaderItem M">First Name</div>
          <div className="listHeaderItem M">Date of Birth</div>
          <div className="listHeaderItem L">Actions</div>
        </div>
        {[...players].sort((a, b) => a.lastName.localeCompare(b.lastName)).map(player => (
        <li key={player.id}>
          <div className="listRow">
            <div className="listItem L" onClick={() => onOpenEditModal(player)}>
                {player.lastName}
            </div>
            <div className="listItem M" onClick={() => onOpenEditModal(player)}>
                {player.firstName}
            </div>
            <div className="listItem M" onClick={() => onOpenEditModal(player)}>
                {player.dateOfBirth}
            </div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenEditModal(player)}>
                Edit
              </button>
              <button className="btn" onClick={() => deletePlayer(player.id)}>
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
    </div>
  );
};

