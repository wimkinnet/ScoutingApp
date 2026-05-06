import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import './Lists.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { openAddTeamModal, openEditTeamModal } from '../features/ui/uiSlice';
import { removeTeam } from '../features/teams/teamsSlice';

export default function TeamsIndex() {
  const teams = useSelector((s: RootState) => s.teams);
  const clubs = useSelector((s: RootState) => s.clubs);
  const seasons = useSelector((s: RootState) => s.seasons);
  const dispatch = useDispatch();


  return (
    <ul className="listContainer">
      <button className="btn" onClick={() => dispatch(openAddTeamModal())}>Add Team</button>
      <div className="listHeader">
        <div className="listHeaderItem">Name</div>
        <div className="listHeaderItem">Club</div>
        <div className="listHeaderItem">Season</div>
        <div className="listHeaderItem">Actions</div>
      </div>
      {[...teams.ids].sort((a, b) => teams.entities[a].name.localeCompare(teams.entities[b].name)).map(id => (
      <li key={id}>
        <div className="listRow">
          <div className="listItem" onClick={() => dispatch(openEditTeamModal(teams.entities[id].id))}>{teams.entities[id].name}</div>
          <div className="listItem" onClick={() => dispatch(openEditTeamModal(teams.entities[id].id))}>{clubs.entities[teams.entities[id].clubId].name}</div>
          <div className="listItem" onClick={() => dispatch(openEditTeamModal(teams.entities[id].id))}>{seasons.entities[teams.entities[id].seasonId].name}</div>
          <div className="listAction">
            <button className="btn" onClick={() => {dispatch(openEditTeamModal(teams.entities[id].id))}}>
              Edit
            </button>
            <button className="btn" onClick={() => {dispatch(removeTeam(teams.entities[id].id))}}>
              Delete
            </button>
          </div>
        </div>
      </li>
      ))}
    </ul>
  );
};

