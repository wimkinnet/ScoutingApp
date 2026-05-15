import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { closeActionModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function SeasonModal() {
  const dispatch = useDispatch();
  const { isOpen , playerId} = useSelector((s: RootState) => s.ui.actionModal);

  const players = useSelector((s: RootState) => s.players);
  
  useEffect(() => {
    if (!isOpen) return;
  }, [isOpen]);

  const onClose = () => dispatch(closeActionModal());
  /*const onSave = () => {
    if (!name.trim()) return alert('Name is mandatory');

    const payload = {
      name,
    };

    try {
      if (mode === 'add') dispatch(addSeason(payload as any));
      else if (mode === 'edit' && season?.id) dispatch(updateSeason({ id: season.id, changes: payload }));
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save season');
    }
  };*/

  if (!isOpen) return null;

  return (
    <div className="modal action" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="SeasonModalTitle">
      <div className="modal-backdrop action" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="SeasonModalTitle">Select Action for {players.entities[playerId ? playerId : 0].lastName}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>
      </div>
    </div>
  );
}
