import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import { store } from './app/store'
import './styles/index.css'
import AppLayout from './routes/AppLayout'
import PlayersIndex from './pages/PlayersIndex'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route index element={<AppLayout />} >
							<Route path="players">
								<Route index element={<PlayersIndex />} />
//							<Route path=":playerId" element={<PlayerDetail />} />
							</Route>
            </Route>
          </Routes>
        </BrowserRouter>
    </Provider>
  </StrictMode>
)
