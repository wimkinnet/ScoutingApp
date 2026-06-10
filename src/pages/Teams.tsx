import { useState } from 'react';
import { useAppDispatch } from '../app/hooks';
import { useGetClubsQuery, useGetSeasonsQuery, useGetTeamsQuery, useDeleteTeamMutation } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css';
import '../styles/_tokens.css';
import TeamModal from '../modals/TeamModal';
import { openAddTeamModal, openEditTeamModal } from '../features/ui/uiSlice';

export default function TeamsIndex() {
  const { data: teams = [], isLoading, isError, error } = useGetTeamsQuery();
  const { data: clubs = [] } = useGetClubsQuery();
  const { data: seasons = [] } = useGetSeasonsQuery();
  const dispatch = useAppDispatch();
  const [deleteTeam] = useDeleteTeamMutation();
  const [isOpen, setIsOpen] = useState(false);
    
  if (isLoading) {
    return <p>Loading teams ...</p>
  }
    
  if (isError) {
    return (
      <p>Error loading teams: {JSON.stringify(error)}</p>
    )
  }

  const onOpenAddModal = (() => {
    setIsOpen(true);
    dispatch(openAddTeamModal())
  })
    
  const onOpenEditModal = ((team: any) => {
    setIsOpen(true);
    dispatch(openEditTeamModal(team.id))
  })
    
  const onCloseModal = (() => {
    setIsOpen(false);
  })

  return (
    <div>
      <ul className="listContainer">
        <button className="btn" onClick={onOpenAddModal}>Add Team</button>
        <div className="listHeader">
          <div className="listHeaderItem M">Name</div>
          <div className="listHeaderItem XL">Club</div>
          <div className="listHeaderItem M">Season</div>
          <div className="listHeaderItem L">Actions</div>
        </div>
        {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => (
        <li key={team.id}>
          <div className="listRow">
            <div className="listItem M" onClick={() => onOpenEditModal(team)}>{team.name}</div>
            <div className="listItem XL" onClick={() => onOpenEditModal(team)}>{clubs.find((cl) => cl.id === team.clubId)?.name}</div>
            <div className="listItem M" onClick={() => onOpenEditModal(team)}>{seasons.find((s) => s.id === team.seasonId)?.name}</div>
            <div className="listAction">
              <button className="btn" onClick={() => onOpenEditModal(team)}>
                Edit
              </button>
              <button className="btn" onClick={() => deleteTeam(team.id)}>
                Delete
              </button>
            </div>
          </div>
        </li>
        ))}
      </ul>
      <TeamModal
        isOpen={isOpen}
        onClose={onCloseModal}
      />
    </div>
  );
};

