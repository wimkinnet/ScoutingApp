import { Link, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './PlayersIndex.css';

export default function PlayersIndex() {
  const players = useSelector((s: RootState) => s.players);
  const location = useLocation();

  return (
    <section className="content">
      <div className="playersIndex">
        <div className="namesList">
          {[...players.ids].sort((a, b) => players.entities[a].lastName.localeCompare(players.entities[b].lastName)).map(id => (
          <Link className={location.pathname === `/players/${id}` ? "playerMiniCard active" : "playerMiniCard"} to={`/players/${id}`}>
            {players.entities[id].lastName} {players.entities[id].firstName}<br />
            {players.entities[id].dateOfBirth?.toLocaleDateString()}
          </Link>
          ))}
        </div>
      </div>
      <Outlet />
    </section>
  );
};

