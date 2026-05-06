import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddSeasonModal, openEditSeasonModal } from '../features/ui/uiSlice';
import { removeSeason } from '../features/seasons/seasonsSlice';

export default function SeasonsIndex() {
  const seasons = useSelector((s: RootState) => s.seasons);
  const dispatch = useDispatch();


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddSeasonModal())}>Add Season</button>
      <div className="listHeader">
        <div className="listHeaderItem">Name</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...seasons.ids].sort((a, b) => seasons.entities[a].name.localeCompare(seasons.entities[b].name)).map(id => (
      <li key={id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditSeasonModal(seasons.entities[id].id))}>{seasons.entities[id].name}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditSeasonModal(seasons.entities[id].id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {dispatch(removeSeason(seasons.entities[id].id))}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

