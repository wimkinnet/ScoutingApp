import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { store } from './app/store'
import './styles/index.css'
import './styles/_tokens.css'
import AppLayout from './routes/AppLayout'
import Players from './pages/Players'
import Clubs from './pages/Clubs'
import Seasons from './pages/Seasons'
import Teams from './pages/Teams'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<AppLayout />} >
						<Route path="players" element={<Players />} ></Route>
						<Route path="clubs" element={<Clubs />} ></Route>
						<Route path="seasons" element={<Seasons />} ></Route>
						<Route path="teams" element={<Teams />} ></Route>
					</Route>
				</Routes>
			</BrowserRouter>
    </Provider>
  </StrictMode>
)
