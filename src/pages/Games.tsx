import { useAppDispatch } from '../app/hooks';
import { useState } from 'react';
import { useGetGamesQuery, useDeleteGameMutation, useGetClubsQuery, useGetTeamsQuery } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddGameModal, openEditGameModal, openScoutModal, openGameStatsModal } from '../features/ui/uiSlice';
import GameModal from '../modals/GameModal';
import ScoutModal from '../modals/ScoutModal';
import GameStatsModal from '../modals/GameStatsModal';
import { useMediaQuery } from 'react-responsive';

export default function GamesIndex() {
  const { data: games = [], isLoading, isError, error } = useGetGamesQuery();
  const { data: clubs = [] } = useGetClubsQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const dispatch = useAppDispatch();
  const [deleteGame] = useDeleteGameMutation();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenScout, setIsOpenScout] = useState(false);
  const [isOpenStats, setIsOpenStats] = useState(false);
  const isPhone = useMediaQuery({ maxWidth: 768 });
    
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
    !isPhone ? (
      setIsOpenScout(true),
      dispatch(openScoutModal(game.id))
    ) : (
      setIsOpenStats(true),
      dispatch(openGameStatsModal(game.id))
    )
  })
  
  const onCloseModal = (() => {
    setIsOpen(false);
    setIsOpenScout(false);
    setIsOpenStats(false);
  })

  if (isError) {
    return (
      <p>Error loading games: {JSON.stringify(error)}</p>
    )
  }  

  return (
    <div>
      <ul className="listContainer">
        {!isPhone && (
          <button className="btn" onClick={() => onOpenAddModal()}>Add Game</button>
        )}
        <div className="listHeader">
          <div className="listHeaderItem XL">Scout Team</div>
          <div className="listHeaderItem XL">Opponent</div>
          <div className="listHeaderItem L">Date</div>
          <div className="listHeaderItem">Actions</div>
        </div>
        {[...games].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).map((game) => (
        <li key={game.id}>
          <div className="listRow">
            <div className="listItem XL" onClick={() => onOpenEditModal(game)}>{clubs.find((cl) => (cl.id === (teams.find((t) => (t.id === game.homeTeamId))?.clubId)))?.name} {teams.find((t) => (t.id === game.homeTeamId))?.name}</div>
            <div className="listItem XL" onClick={() => onOpenEditModal(game)}>{clubs.find((cl) => (cl.id === (teams.find((t) => (t.id === game.awayTeamId))?.clubId)))?.name} {teams.find((t) => (t.id === game.awayTeamId))?.name}</div>
            <div className="listItem L" onClick={() => onOpenEditModal(game)}>{game.date}</div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenScoutModal(game)}>
                Open
              </button>
              {!isPhone && (
                <div>
                  <button className="btn" onClick={() => onOpenEditModal(game)}>
                    Edit
                  </button>
                  <button className="btn" onClick={() => deleteGame(game.id)}>
                    Delete
                  </button>
                </div>
              )}
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
      <GameStatsModal
        isOpen={isOpenStats}
        onClose={onCloseModal}
      />
    </div>
  );
};

