import { useAppDispatch } from '../app/hooks';
import { useState } from 'react';
import { useGetGamesQuery, useDeleteGameMutation, useGetClubsQuery, useGetTeamsQuery } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddGameModal, openEditGameModal, openScoutModal } from '../features/ui/uiSlice';
import GameModal from '../modals/GameModal';
import ScoutModal from '../modals/ScoutModal';

export default function GamesIndex() {
  const { data: games = [], isLoading, isError, error } = useGetGamesQuery();
  const { data: clubs = [] } = useGetClubsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const dispatch = useAppDispatch();
  const [deleteGame] = useDeleteGameMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenScout, setIsOpenScout] = useState(false);
    
  if (isLoading) {
    return <p>Loading games ...</p>
  }
  
  const onOpenAddModal = (() => {
    setIsOpen(true);
    dispatch(openAddGameModal())
  })
  
  const onOpenEditModal = ((game: any) => {
    setIsOpen(true);
    dispatch(openEditGameModal(game.id))
  })

  const onOpenScoutModal = ((game: any) => {
    setIsOpenScout(true);
    dispatch(openScoutModal(game.id))
  })
  
  const onCloseModal = (() => {
    setIsOpen(false);
    setIsOpenScout(false);
  })

  if (isError) {
    return (
      <p>Error loading games: {JSON.stringify(error)}</p>
    )
  }  

  return (
    <div>
      <ul className="listContainer">
        <button className="btn" onClick={() => onOpenAddModal()}>Add Game</button>
        <div className="listHeader">
          <div className="listHeaderItem XL">Scout Team</div>
          <div className="listHeaderItem XL">Opponent</div>
          <div className="listHeaderItem XL">Date</div>
          <div className="listHeaderItem">Actions</div>
        </div>
        {[...games].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map((game) => (
        <li key={game.id}>
          <div className="listRow">
            <div className="listItem XL" onClick={() => onOpenEditModal(game)}>{clubs.find((cl) => (cl.id === (teams.find((t) => (t.id === game.homeTeamId))?.clubId)))?.name} {teams.find((t) => (t.id === game.homeTeamId))?.name}</div>
            <div className="listItem XL" onClick={() => onOpenEditModal(game)}>{clubs.find((cl) => (cl.id === (teams.find((t) => (t.id === game.awayTeamId))?.clubId)))?.name} {teams.find((t) => (t.id === game.awayTeamId))?.name}</div>
            <div className="listItem XL" onClick={() => onOpenEditModal(game)}>{game.date}</div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenScoutModal(game)}>
                Open
              </button>
              <button className="btn" onClick={() => onOpenEditModal(game)}>
                Edit
              </button>
              <button className="btn" onClick={() => deleteGame(game.id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
        ))}
      </ul>
      <GameModal
        isOpen={isOpen}
        onClose={onCloseModal}
      />
      <ScoutModal
        isOpen={isOpenScout}
        onClose={onCloseModal}
      />
    </div>
  );
};

