import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './PlayersIndex.css';

export default function PlayersIndex() {
  const players = useSelector((s: RootState) => s.players);

  return (
    <section>
      <h2>Players</h2>
      <div>
        {players.ids.map(id => (
          <Link className="btn" to={`/players/${id}`}>{players.entities[id].lastName} {players.entities[id].firstName}</Link>
        ))}
      </div>
    </section>
  );
}