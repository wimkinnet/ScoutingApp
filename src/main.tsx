import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { store } from './app/store'
import './styles/index.css'
import './styles/_tokens.css'
import AppLayout from './routes/AppLayout'
import PlayersIndex from './pages/PlayersIndex'
import PlayerCard from './pages/PlayerCard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<AppLayout />} >
						<Route path="players">
							<Route index element={<PlayersIndex />} />
							<Route path=":playerId" element={<PlayerCard />} />
						</Route>
					</Route>
				</Routes>
			</BrowserRouter>
    </Provider>
  </StrictMode>
)
