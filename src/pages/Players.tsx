import { useDispatch } from 'react-redux';
import { useGetPlayersQuery, useDeletePlayerMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddPlayerModal, openEditPlayerModal } from '../features/ui/uiSlice';

export default function PlayersIndex() {
  const { data: players = [], isLoading, isError, error } = useGetPlayersQuery();
  const dispatch = useDispatch();
  const [deletePlayer] = useDeletePlayerMutation();

  if (isLoading) {
    return <p>Loading players ...</p>
  }

  if (isError) {
    return (
      <div>
        <p>Error loading players: {JSON.stringify(error)}</p>
        <button className="btn" onClick={() => dispatch(openAddPlayerModal())}>Add Player</button>
      </div>
    )
  }

  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddPlayerModal())}>Add Player</button>
      <div className="listHeader">
        <div className="listHeaderItem">Last Name</div>
        <div className="listHeaderItem">First Name</div>
        <div className="listHeaderItem">Date of Birth</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...players].sort((a, b) => a.lastName.localeCompare(b.lastName)).map(player => (
      <li key={player.id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(player.id))}>{player.lastName}</div>
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(player.id))}>{player.firstName}</div>
          <div className="listItem" onClick={() => dispatch(openEditPlayerModal(player.id))}>{player.dateOfBirth}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditPlayerModal(player.id))}}>
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
  );
};

