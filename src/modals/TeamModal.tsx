import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addTeam, updateTeam } from '../features/teams/teamsSlice';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function TeamModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.teamModal);
  const team = useSelector((s: RootState) => (mode === 'edit' && id) ? s.teams.entities[id] : null);
  const clubs = useSelector((s: RootState) => s.clubs);
  const seasons = useSelector((s: RootState) => s.seasons);
  const players = useSelector((s: RootState) => s.players);

  const [name, setName] = useState(team?.name ?? '');
  const [clubId, setClubId] = useState(team?.clubId ?? '');
  const [seasonId, setSeasonId] = useState(team?.seasonId ?? '');
  const [playerIds, setPlayerIds] = useState(team?.playerIds ?? []);
  const [availableSelection, setAvailableSelection] = useState<string[]>([]);
  const [selectedSelection, setSelectedSelection] = useState<string[]>([]);

  const availablePlayers = players.ids.reduce<Array<any>>((acc, id) => {
    const player = players.entities[id];
    if (player && !playerIds.includes(player.id)) acc.push(player);
    return acc;
  }, []);

  const selectedPlayers = players.ids.reduce<Array<any>>((acc, id) => {
    const player = players.entities[id];
    if (player && playerIds.includes(player.id)) acc.push(player);
    return acc;
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setName(team?.name ?? '');
    setClubId(team?.clubId ?? '');
    setSeasonId(team?.seasonId ?? '');
    setPlayerIds(team?.playerIds ?? []);
    setAvailableSelection([]);
    setSelectedSelection([]);
  }, [isOpen, mode, id]);

  const addSelected = () => {
    setPlayerIds([...playerIds, ...availableSelection]);
    setAvailableSelection([]);
  };

  const removeSelected = () => {
    setPlayerIds(playerIds.filter(id => !selectedSelection.includes(id)));
    setSelectedSelection([]);
  };

  const onClose = () => dispatch(closeModal());
    const onSave = () => {
      if (!name.trim()) return alert('Name is mandatory');
      if (!clubId) return alert('Club is mandatory');
      if (!seasonId) return alert('Season is mandatory');
      
      const payload = {
        name,
        clubId,
        seasonId,
        playerIds,
      };
  
      try {
        if (mode === 'add') dispatch(addTeam(payload as any));
        else if (mode === 'edit' && team?.id) dispatch(updateTeam({ id: team.id, changes: payload }));
        onClose();
      } catch (err: any) {
        alert(err?.message || 'Could not save team');
      }
    };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="TeamModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="TeamModalTitle">{mode === 'add' ? 'Add Team' : 'Edit Team'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-field"><label>Club</label>
              <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
                <option value="">Select Club</option>
                {clubs.ids.map((id) => {
                  const club = clubs.entities[id];
                  return (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field"><label>Season</label>
              <select value={seasonId} onChange={(e) => setSeasonId(e.target.value)}>
                <option value="">Select Season</option>
                {seasons.ids.map((id) => {
                  const season = seasons.entities[id];
                  return (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field" style={{ gridColumn: '1 / -1' }}>
              <div className="dual-list" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div className="list">
                  <label>Available Players</label>
                  <select multiple value={availableSelection} onChange={(e) => setAvailableSelection(Array.from(e.target.selectedOptions, (o) => o.value))} style={{ width: '200px', height: '200px' }}>
                    {availablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.lastName} {player.firstName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="buttons" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <button className="btn small" onClick={addSelected} disabled={!availableSelection.length}>Add &gt;</button>
                  <button className="btn small" onClick={removeSelected} disabled={!selectedSelection.length}>&lt; Remove</button>
                </div>
                <div className="list">
                  <label>Selected Players</label>
                  <select multiple value={selectedSelection} onChange={(e) => setSelectedSelection(Array.from(e.target.selectedOptions, (o) => o.value))} style={{ width: '200px', height: '200px' }}>
                    {selectedPlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.lastName} {player.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
