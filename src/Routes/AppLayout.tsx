import { Link, Outlet, NavLink } from 'react-router-dom';
import '../styles/index.css'

export default function AppLayout() {
	return (
		<div className="app">
			<header className="app-header">
				<div className="brand">
					<span className="logo" aria-hidden>🏀</span>
					<Link to="/" className="brand-title">ScoutingApp</Link>
				</div>

				<nav className="toolbar">
				  <NavLink to="/players" className="btn">Players</NavLink>
				</nav>
			</header>

			<main className="app-main">
				<Outlet />
			</main>

		</div>
  )
}
