import { Link, Outlet , useLocation} from 'react-router-dom';
import '../styles/index.css'
import '../styles/_tokens.css'
import { useMediaQuery } from 'react-responsive';

export default function AppLayout() {
	const location = useLocation();
	const isPhone = useMediaQuery({ maxWidth: 768 });

	return (
		<div className="app">
			<header className="app-header">
				<div className="brand">
					<span className="logo" aria-hidden>🏀</span>
					<Link to="/" className="brand-title">SCOUTING APP</Link>
				</div>
			</header>
			
			{!isPhone && (<main className="app-main">
				<aside className="app-sidebar">
					<Link className={location.pathname.startsWith("/players") ? "sidebar-link active" : "sidebar-link"} to="/players">PLAYERS</Link>
					<Link className={location.pathname.startsWith("/clubs") ? "sidebar-link active" : "sidebar-link"} to="/clubs">CLUBS</Link>
					<Link className={location.pathname.startsWith("/seasons") ? "sidebar-link active" : "sidebar-link"} to="/seasons">SEASONS</Link>
					<Link className={location.pathname.startsWith("/teams") ? "sidebar-link active" : "sidebar-link"} to="/teams">TEAMS</Link>
					<Link className={location.pathname.startsWith("/games") ? "sidebar-link active" : "sidebar-link"} to="/games">GAMES</Link>
					<Link className={location.pathname.startsWith("/logs") ? "sidebar-link active" : "sidebar-link"} to="/logs">LOGS</Link>
				</aside>
				<Outlet />
			</main>
			)}
				{isPhone && (<main className="app-phone-main">
				<nav className="app-nav">
					<Link className={location.pathname.startsWith("/players") ? "nav-link active" : "nav-link"} to="/players">PLAYERS</Link>
					<Link className={location.pathname.startsWith("/clubs") ? "nav-link active" : "nav-link"} to="/clubs">CLUBS</Link>
					<Link className={location.pathname.startsWith("/seasons") ? "nav-link active" : "nav-link"} to="/seasons">SEASONS</Link>
					<Link className={location.pathname.startsWith("/teams") ? "nav-link active" : "nav-link"} to="/teams">TEAMS</Link>
					<Link className={location.pathname.startsWith("/games") ? "nav-link active" : "nav-link"} to="/games">GAMES</Link>
					<Link className={location.pathname.startsWith("/logs") ? "nav-link active" : "nav-link"} to="/logs">LOGS</Link>
				</nav>
				<Outlet />
			</main>
			)}
		</div>
	)
}
