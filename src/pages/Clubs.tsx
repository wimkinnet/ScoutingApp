import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddClubModal, openEditClubModal } from '../features/ui/uiSlice';
import { removeClub } from '../features/clubs/clubsSlice';

export default function ClubsIndex() {
  const clubs = useSelector((s: RootState) => s.clubs);
  const dispatch = useDispatch();


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddClubModal())}>Add Club</button>
      <div className="listHeader">
        <div className="listHeaderItem">Name</div>
        <div className="listHeaderItem">Registration number</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...clubs.ids].sort((a, b) => clubs.entities[a].name.localeCompare(clubs.entities[b].name)).map(id => (
      <li key={id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditClubModal(clubs.entities[id].id))}>{clubs.entities[id].name}</div>
          <div className="listItem" onClick={() => dispatch(openEditClubModal(clubs.entities[id].id))}>{clubs.entities[id].registrationNumber}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditClubModal(clubs.entities[id].id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {dispatch(removeClub(clubs.entities[id].id))}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

