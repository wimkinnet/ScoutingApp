import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useAppDispatch } from '../app/hooks';
import { useAddPlayerMutation, useUpdatePlayerMutation, useGetPlayerByIdQuery } from '../services/ScoutingApi';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function PlayerModal() {
  const dispatch = useAppDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.playerModal);
  const { data: player, isLoading: isLoadingPlayer, isError: isPlayerError } = useGetPlayerByIdQuery(id ?? '', {
    skip: !isOpen || mode !== 'edit' || !id,
  });

  const [addPlayer, { isLoading: isAdding }] = useAddPlayerMutation();
  const [updatePlayer, { isLoading: isUpdating }] = useUpdatePlayerMutation();
  
  const [lastName, setLastName] = useState(player?.lastName ?? '');
  const [firstName, setFirstName] = useState(player?.firstName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(player?.dateOfBirth ?? undefined);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && player) {
      setLastName(player.lastName ?? '');
      setFirstName(player.firstName ?? '');
      setDateOfBirth(player.dateOfBirth ?? '');
    } else if (mode === 'add') {
      setLastName('');
      setFirstName('');
      setDateOfBirth('');
    }
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());

  const onSave = async () => {
    if (!firstName.trim()) return alert('First name is mandatory');
    if (!lastName.trim()) return alert('Last name is mandatory');

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth || undefined,
    };

    try {
      if (mode === 'add') {
        await addPlayer(payload).unwrap();
      } else if (mode === 'edit' && player?.id) {
        await updatePlayer({ id: player.id, changes: payload }).unwrap();
      }
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
          {mode === 'edit' && isLoadingPlayer ? (
            <p>Loading player...</p>
          ) : mode === 'edit' && isPlayerError ? (
            <p>Could not load player</p>
          ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Last name</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} /></div>
            <div className="form-field"><label>First name</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} /></div>
            <div className="form-field"><label>Date of birth</label><input
                type="date"
                value={dateOfBirth ? dateOfBirth : ''}
                onChange={(e) => setDateOfBirth(e.target.value)}
            /></div>
          </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave} disabled={isAdding || isUpdating || (mode ==='edit' && isLoadingPlayer)}>
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  );
}
