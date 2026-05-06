import { Link, Outlet , useLocation} from 'react-router-dom';
import '../styles/index.css'
import '../styles/_tokens.css'
import PlayerModal from '../modals/PlayerModal';
import ClubModal from '../modals/ClubModal';
import SeasonModal from '../modals/SeasonModal';

export default function AppLayout() {
	const location = useLocation();

	return (
		<div className="app">
			<header className="app-header">
				<div className="brand">
					<span className="logo" aria-hidden>🏀</span>
					<Link to="/" className="brand-title">SCOUTING APP</Link>
				</div>
			</header>
			
			<main className="app-main">
				<aside className="app-sidebar">
					<Link className={location.pathname.startsWith("/players") ? "sidebar-link active" : "sidebar-link"} to="/players">PLAYERS</Link>
					<Link className={location.pathname.startsWith("/clubs") ? "sidebar-link active" : "sidebar-link"} to="/clubs">CLUBS</Link>
					<Link className={location.pathname.startsWith("/seasons") ? "sidebar-link active" : "sidebar-link"} to="/seasons">SEASONS</Link>
				</aside>
				<Outlet />
			</main>
			<PlayerModal />
			<ClubModal />
			<SeasonModal />
		</div>
  )
}
