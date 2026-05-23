import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddGameModal, openEditGameModal, openScoutModal } from '../features/ui/uiSlice';
import { removeGame } from '../features/games/gamesSlice';

export default function GamesIndex() {
  const games = useSelector((s: RootState) => s.games);
  const teams = useSelector((s: RootState) => s.teams);
  const clubs = useSelector((s: RootState) => s.clubs);
  const dispatch = useDispatch();


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddGameModal())}>Add Game</button>
      <div className="listHeader">
        <div className="listHeaderItem game">Scout Team</div>
        <div className="listHeaderItem game">Opponent</div>
        <div className="listHeaderItem game">Date</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...games.ids].sort((a, b) => games.entities[a].date.getTime() - games.entities[b].date.getTime()).map(id => (
      <li key={id}>
        <div className="listRow">
          <div className="listItem game" onClick={() => dispatch(openEditGameModal(games.entities[id].id))}>{clubs.entities[teams.entities[games.entities[id].homeTeamId].clubId].name} {teams.entities[games.entities[id].homeTeamId].name}</div>
          <div className="listItem game" onClick={() => dispatch(openEditGameModal(games.entities[id].id))}>{clubs.entities[teams.entities[games.entities[id].awayTeamId].clubId].name} {teams.entities[games.entities[id].awayTeamId].name}</div>
          <div className="listItem game" onClick={() => dispatch(openEditGameModal(games.entities[id].id))}>{games.entities[id].date.toLocaleDateString()}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openScoutModal(games.entities[id].id))}}>
              Open
            </button>
            <button className="btn" onClick={() => {dispatch(openEditGameModal(games.entities[id].id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {dispatch(removeGame(games.entities[id].id))}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

