import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './PlayersIndex.css';
import '../styles/index.css';

export default function PlayersIndex() {
	const players = useSelector((s: RootState) => s.players);

	return (
		<section className="content cabinets-index">
			<h2>Players</h2>
			<div className="cabinets-list">
				{players.ids.map(id => (
					<div key={id} className="cabinet-card">
						<h3>{players.entities[id].lastName}</h3>
						<p className="meta">ID: {id}</p>
						<div className="actions">
							<Link className="btn" to={`/players/${id}`}>Open</Link>
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
