import { useDispatch } from 'react-redux';
import { useGetSeasonsQuery, useDeleteSeasonMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddSeasonModal, openEditSeasonModal } from '../features/ui/uiSlice';

export default function SeasonsIndex() {
  const { data: seasons = [], isLoading, isError, error } = useGetSeasonsQuery();
    const dispatch = useDispatch();
    const [deleteSeason] = useDeleteSeasonMutation();
    
    if (isLoading) {
      return <p>Loading seasons ...</p>
    }
    
    if (isError) {
      return (
        <div>
          <p>Error loading seasons: {JSON.stringify(error)}</p>
          <button className="btn" onClick={() => dispatch(openAddSeasonModal())}>Add Season</button>
        </div>
      )
    }


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddSeasonModal())}>Add Season</button>
      <div className="listHeader">
        <div className="listHeaderItem">Name</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...seasons].sort((a, b) => a.name.localeCompare(b.name)).map(season => (
      <li key={season.id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditSeasonModal(season.id))}>{season.name}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditSeasonModal(season.id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {deleteSeason(season.id)}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

