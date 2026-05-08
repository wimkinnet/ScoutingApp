import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addGame, updateGame } from '../features/games/gamesSlice';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function GameModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.gameModal);
  const game = useSelector((s: RootState) => (mode === 'edit' && id) ? s.games.entities[id] : null);
  const teams = useSelector((s: RootState) => s.teams);

  const [scoutTeamId, setScoutTeamId] = useState(game?.scoutTeamId ?? '');
  const [otherTeamId, setOtherTeamId] = useState(game?.otherTeamId ?? '');
  const [date, setDate] = useState(game?.date ?? undefined);
  const [scoutHome, setScoutHome] = useState(game?.scoutHome ?? true);

  useEffect(() => {
    if (!isOpen) return;
    setScoutTeamId(game?.scoutTeamId ?? '');
    setOtherTeamId(game?.otherTeamId ?? '');
    setDate(game?.date ?? undefined);
    setScoutHome(game?.scoutHome ?? true);
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
    if (!scoutTeamId.trim()) return alert('Scout team ID is mandatory');
    if (!otherTeamId.trim()) return alert('Other team ID is mandatory');
    if (!date) return alert('Date is mandatory');
    if (scoutHome === undefined) return alert('Scout home/away is mandatory');

    const payload = {
      scoutTeamId,
      otherTeamId,
      date,
      scoutHome,
    };

    try {
      if (mode === 'add') dispatch(addGame(payload as any));
      else if (mode === 'edit' && game?.id) dispatch(updateGame({ id: game.id, changes: payload }));
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save game');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="GameModalTitle">{mode === 'add' ? 'Add Game' : 'Edit Game'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Scout Team ID</label>
              <select value={scoutTeamId} onChange={(e) => setScoutTeamId(e.target.value)}>
                <option value="">Select Team</option>
                {teams.ids.map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field"><label>Other Team ID</label>
              <select value={otherTeamId} onChange={(e) => setOtherTeamId(e.target.value)}>
                <option value="">Select Team</option>
                {teams.ids.map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field">
              <label>Date</label><input
                type="date"
                value={date ? date.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)} />
            </div>
            <div className="form-field">
              <label>Scout Home/Away</label>
              <select value={scoutHome ? 'true' : 'false'} onChange={(e) => setScoutHome(e.target.value === 'true')}>
                <option value="true">Home</option>
                <option value="false">Away</option>
              </select>
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
