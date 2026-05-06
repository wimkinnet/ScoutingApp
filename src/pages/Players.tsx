import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddPlayerModal, openEditPlayerModal } from '../features/ui/uiSlice';
import { removePlayer } from '../features/players/playersSlice';

export default function PlayersIndex() {
  const players = useSelector((s: RootState) => s.players);
  const dispatch = useDispatch();


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddPlayerModal())}>Add Player</button>
      <div className="listHeader">
        <div className="listHeaderItem">Last Name</div>
        <div className="listHeaderItem">First Name</div>
        <div className="listHeaderItem">Date of Birth</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...players.ids].sort((a, b) => players.entities[a].lastName.localeCompare(players.entities[b].lastName)).map(id => (
      <li key={id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(players.entities[id].id))}>{players.entities[id].lastName}</div>
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(players.entities[id].id))}>{players.entities[id].firstName}</div>
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(players.entities[id].id))}>{players.entities[id].dateOfBirth?.toLocaleDateString()}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditPlayerModal(players.entities[id].id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {dispatch(removePlayer(players.entities[id].id))}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

