import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { openEditPlayerModal } from '../features/ui/uiSlice';

export default function PlayerCard() {
  const { playerId } = useParams();
  const player = useSelector((s: RootState) => playerId ? s.players.entities[playerId] : null);
  const dispatch = useDispatch();

  if (!player) return <div className="content">Player not found</div>;

  return (
    <section>
      <div>
        <h3>Details</h3>
        <p>Last Name: {player.lastName}</p>
        <p>First Name: {player.firstName}</p>
        {player.dateOfBirth && <p>Date of Birth: {player.dateOfBirth}</p>}
      </div>

      <div style={{ display:'flex', gap: 12}}>
        <button className="btn" onClick={() => dispatch(openEditPlayerModal(player.id))}>Edit</button>
      </div>
    </section>
  );
}