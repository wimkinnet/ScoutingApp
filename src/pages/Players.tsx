import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Players.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddPlayerModal, openEditPlayerModal } from '../features/ui/uiSlice';

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
      </div>
      {[...players.ids].sort((a, b) => players.entities[a].lastName.localeCompare(players.entities[b].lastName)).map(id => (
      <li key={id}>
        <div className="listRow" onClick={() => dispatch(openEditPlayerModal(players.entities[id].id))}>
          <div className="listItem">{players.entities[id].lastName}</div>
          <div className="listItem">{players.entities[id].firstName}</div>
          <div className="listItem">{players.entities[id].dateOfBirth?.toLocaleDateString()}</div>
        </div>
      </li>
      ))}
    </ul>
  );
};

