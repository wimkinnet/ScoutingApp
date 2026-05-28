import { useDispatch } from 'react-redux';
import { useGetClubsQuery, useDeleteClubMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddClubModal, openEditClubModal } from '../features/ui/uiSlice';

export default function ClubsIndex() {
  const { data: clubs = [], isLoading, isError, error } = useGetClubsQuery();
  const dispatch = useDispatch();
  const [deleteClub] = useDeleteClubMutation();
  
  if (isLoading) {
    return <p>Loading clubs ...</p>
  }
  
  if (isError) {
    return (
      <div>
        <p>Error loading clubs: {JSON.stringify(error)}</p>
        <button className="btn" onClick={() => dispatch(openAddClubModal())}>Add Club</button>
      </div>
    )
  }  

  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddClubModal())}>Add Club</button>
      <div className="listHeader">
        <div className="listHeaderItem">Name</div>
        <div className="listHeaderItem">Registration number</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...clubs].sort((a, b) => a.name.localeCompare(b.name)).map(club => (
      <li key={club.id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditClubModal(club.id))}>{club.name}</div>
          <div className="listItem" onClick={() => dispatch(openEditClubModal(club.id))}>{club.registrationNumber}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditClubModal(club.id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {deleteClub(club.id)}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

