import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addPlayer, updatePlayer } from '../features/players/playersSlice';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function PlayerModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.playerModal);
  const player = useSelector((s: RootState) => (mode === 'edit' && id) ? s.players.entities[id] : null);

  const [lastName, setLastName] = useState(player?.lastName ?? '');
  const [firstName, setFirstName] = useState(player?.firstName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(player?.dateOfBirth ?? undefined);

  useEffect(() => {
    if (!isOpen) return;
    setLastName(player?.lastName ?? '');
    setFirstName(player?.firstName ?? '');
    setDateOfBirth(player?.dateOfBirth ?? undefined);
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
    if (!firstName.trim()) return alert('First name is mandatory');
    if (!lastName.trim()) return alert('Last name is mandatory');

    const payload = {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || undefined,
    };

    try {
      if (mode === 'add') dispatch(addPlayer(payload as any));
      else if (mode === 'edit' && player?.id) dispatch(updatePlayer({ id: player.id, changes: payload }));
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save player');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="PlayerModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="PlayerModalTitle">{mode === 'add' ? 'Add Player' : 'Edit Player'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Last name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="form-field"><label>First name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="form-field"><label>Date of birth</label><input
                type="date"
                value={dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDateOfBirth(e.target.value ? new Date(e.target.value) : undefined)}
            /></div>
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
