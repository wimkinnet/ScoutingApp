import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import { 
  useGetTeamByIdQuery,
  useGetPlayersQuery,
  useGetClubsQuery, 
  useGetSeasonsQuery,
  useAddTeamMutation,
  useUpdateTeamMutation
 } from '../services/ScoutingApi';
import './Modal.css';
import '../styles/index.css';
import '../styles/_tokens.css';

export default function TeamModal({ isOpen, onClose }: ModalProps) {
  const { mode, id } = useSelector((s: RootState) => s.ui.teamModal);
  const { data: team, isLoading: isLoadingTeam, isError: isTeamError } = useGetTeamByIdQuery(id ?? '', {
    skip: !isOpen || mode !== 'edit' || !id,
  });

  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });
  const { data: seasons } = useGetSeasonsQuery(undefined, { skip: !isOpen });
  const { data: players } = useGetPlayersQuery(undefined, { skip: !isOpen });

  const [addTeam, { isLoading: isAdding }] = useAddTeamMutation();
  const [updateTeam, { isLoading: isUpdating }] = useUpdateTeamMutation();

  const [name, setName] = useState('');
  const [clubId, setClubId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [playerIds, setPlayerIds] = useState<string[]>([]);

  const [availableSelection, setAvailableSelection] = useState<string[]>([]);
  const [selectedSelection, setSelectedSelection] = useState<string[]>([]);
  
  // Keep track of the last loaded team ID to avoid infinite overwrite loops
  const lastLoadedIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      // Clear tracking when closed
      lastLoadedIdRef.current = null;
      return;
    }

    // Scenario A: Add Mode - Initialize empty form once
    if (mode === 'add' && lastLoadedIdRef.current !== 'add') {
      setName('');
      setClubId('');
      setSeasonId('');
      setPlayerIds([]);
      setAvailableSelection([]);
      setSelectedSelection([]);
      lastLoadedIdRef.current = 'add';
    } 
    // Scenario B: Edit Mode - Initialize form only when the specific team payload loads
    else if (mode === 'edit' && team && lastLoadedIdRef.current !== team.id) {
      setName(team.name ?? '');
      setClubId(team.clubId ?? '');
      setSeasonId(team.seasonId ?? '');
      setPlayerIds(team.playerIds ?? []);
      setAvailableSelection([]);
      setSelectedSelection([]);
      lastLoadedIdRef.current = team.id;
    }
  }, [isOpen, mode, team]);


  const availablePlayers = players?.filter((player) => !playerIds.includes(player.id)) ?? [];
  const selectedPlayers = players?.filter((player) => playerIds.includes(player.id)) ?? [];
  
  const addSelected = () => {
  // Use functional state updates to prevent race conditions
  setPlayerIds((prev) => [...prev, ...availableSelection]);
  // Wipe out selections immediately so HTML elements reset cleanly
  setAvailableSelection([]);
};

const removeSelected = () => {
  // Always query 'prev' array states directly
  setPlayerIds((prev) => prev.filter((id) => !selectedSelection.includes(id)));
  // Wipe out selections immediately so HTML elements reset cleanly
  setSelectedSelection([]);
};

  const onSave = async () => {
    if (!name.trim()) return alert('Name is mandatory');
    if (!clubId) return alert('Club is mandatory');
    if (!seasonId) return alert('Season is mandatory');
    if (playerIds.length < 5) return alert('Add at least 5 players')
    
    const payload = {
      name,
      clubId,
      seasonId,
      playerIds,
    };

    try {
      if (mode === 'add') {
      await addTeam(payload).unwrap();
    } else if (mode === 'edit' && team?.id) {
      await updateTeam({ id: team.id, changes: payload }).unwrap();
    }
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
          {mode === 'edit' && isLoadingTeam ? (
            <p>Loading team...</p>
          ) : mode === 'edit' && isTeamError ? (
            <p>Could not load team</p>
          ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-field"><label>Club</label>
              <select value={clubId} onChange={(e) => setClubId(e.target.value)}>
                <option value="">Select Club</option>
                {clubs?.map((club) => {
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
                {seasons?.map((season) => {
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
                    {availablePlayers?.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.lastName} {player.firstName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="buttons" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <button className="btn small" onClick={addSelected} disabled={availableSelection.length === 0}>&gt; Add</button>
                  <button className="btn small" onClick={removeSelected} disabled={selectedSelection.length === 0}>&lt; Remove</button>
                </div>
                <div className="list">
                  <label>Selected Players</label>
                  <select multiple value={selectedSelection} onChange={(e) => setSelectedSelection(Array.from(e.target.selectedOptions, (o) => o.value))} style={{ width: '200px', height: '200px' }}>
                    {selectedPlayers?.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.lastName} {player.firstName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave} disabled={isAdding || isUpdating || (mode ==='edit' && isLoadingTeam)}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
