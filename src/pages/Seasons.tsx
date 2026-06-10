import { useState } from 'react';
import { useAppDispatch } from '../app/hooks';
import { useGetSeasonsQuery, useDeleteSeasonMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css';
import '../styles/_tokens.css';
import SeasonModal from '../modals/SeasonModal';
import { openAddSeasonModal, openEditSeasonModal } from '../features/ui/uiSlice';

export default function SeasonsIndex() {
  const { data: seasons = [], isLoading, isError, error } = useGetSeasonsQuery();
  const dispatch = useAppDispatch();
  const [deleteSeason] = useDeleteSeasonMutation();
  const [isOpen, setIsOpen] = useState(false);
    
  if (isLoading) {
    return <p>Loading seasons ...</p>
  }
    
  if (isError) {
    return (
      <p>Error loading seasons: {JSON.stringify(error)}</p>
    )
  }

  const onOpenAddModal = (() => {
    setIsOpen(true);
    dispatch(openAddSeasonModal())
  })

  const onOpenEditModal = ((season: any) => {
    setIsOpen(true);
    dispatch(openEditSeasonModal(season.id))
  })

  const onCloseModal = (() => {
    setIsOpen(false);
  })

  return (
    <div>
      <ul className="listContainer">
        <button className="btn" onClick={onOpenAddModal}>Add Season</button>
        <div className="listHeader">
          <div className="listHeaderItem M">Name</div>
          <div className="listHeaderItem L">Actions</div>
        </div>
        {[...seasons].sort((a, b) => a.name.localeCompare(b.name)).map(season => (
        <li key={season.id}>
          <div className="listRow">
            <div className="listItem M" onClick={() => onOpenEditModal(season)}>{season.name}</div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenEditModal(season)}>
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
      <SeasonModal
        isOpen={isOpen}
        onClose={onCloseModal}
      />
    </div>
  );
};

