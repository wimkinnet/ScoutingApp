import { useAppDispatch } from '../app/hooks';
import { useState } from 'react';
import { useGetClubsQuery, useDeleteClubMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddClubModal, openEditClubModal } from '../features/ui/uiSlice';
import ClubModal from '../modals/ClubModal';

export default function ClubsIndex() {
  const { data: clubs = [], isLoading, isError, error } = useGetClubsQuery();
  const dispatch = useAppDispatch();
  const [deleteClub] = useDeleteClubMutation();
  const [isOpen, setIsOpen] = useState(false);
  
  if (isLoading) {
    return <p>Loading clubs ...</p>
  }
  
  const onOpenAddModal = (() => {
    setIsOpen(true);
    dispatch(openAddClubModal())
  })
  
  const onOpenEditModal = ((club: any) => {
    setIsOpen(true);
    dispatch(openEditClubModal(club.id))
  })
  
  const onCloseModal = (() => {
    setIsOpen(false);
  })

  if (isError) {
    return (
      <p>Error loading clubs: {JSON.stringify(error)}</p>
    )
  }  

  return (
    <div>
      <ul className="listContainer">
        <button className="btn" onClick={() => onOpenAddModal()}>Add Club</button>
        <div className="listHeader">
          <div className="listHeaderItem">Name</div>
          <div className="listHeaderItem">Registration number</div>
          <div className="listHeaderItem">Actions</div>
        </div>
        {[...clubs].sort((a, b) => a.registrationNumber.localeCompare(b.registrationNumber)).map(club => (
        <li key={club.id}>
          <div className="listRow">
            <div className="listItem" onClick={() => onOpenEditModal(club)}>{club.name}</div>
            <div className="listItem" onClick={() => onOpenEditModal(club)}>{club.registrationNumber}</div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenEditModal(club)}>
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
      <ClubModal 
        isOpen={isOpen}
        onClose={onCloseModal}
      />
    </div>
  );
};

