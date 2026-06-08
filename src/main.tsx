import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { store } from './app/store'
import './styles/index.css'
import './styles/_tokens.css'
import AppLayout from './Routes/AppLayout'
import Players from './pages/Players'
import Clubs from './pages/Clubs'
import Seasons from './pages/Seasons'
import Teams from './pages/Teams'
import Games from './pages/Games'
import Logs from './pages/Logs'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
		<BrowserRouter basename="/ScoutingApp/">
			<Routes>
				<Route path="/" element={<AppLayout />} >
					<Route path="players" element={<Players />} ></Route>
					<Route path="clubs" element={<Clubs />} ></Route>
					<Route path="seasons" element={<Seasons />} ></Route>
					<Route path="teams" element={<Teams />} ></Route>
					<Route path="games" element={<Games />} ></Route>
					<Route path="logs" element={<Logs />} ></Route>
				</Route>
			</Routes>
		</BrowserRouter>
    </Provider>
  </StrictMode>
)
