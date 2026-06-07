import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import { useAddSeasonMutation, useUpdateSeasonMutation, useGetSeasonByIdQuery } from '../services/ScoutingApi';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function SeasonModal({ isOpen, onClose }: ModalProps) {
  const { mode, id } = useSelector((s: RootState) => s.ui.seasonModal);
  const { data: season, isLoading: isLoadingSeason, isError: isSeasonError } = useGetSeasonByIdQuery(id ?? '', {
    skip: !isOpen || mode !== 'edit' || !id,
  });
  
  const [addSeason, { isLoading: isAdding }] = useAddSeasonMutation();
  const [updateSeason, { isLoading: isUpdating }] = useUpdateSeasonMutation();

  const [name, setName] = useState(season?.name ?? '');
  
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && season) {
      setName(season.name ?? '');
    } else if (mode === 'add') {
      setName('');
    }
  }, [isOpen, mode, id, season]);

  const onSave = async () => {
    if (!name.trim()) return alert('Name is mandatory');

    const payload = {
      name,
    };

    try {
      if (mode === 'add') {
        await addSeason(payload).unwrap();
      } else if (mode === 'edit' && season?.id) {
        await updateSeason({ id: season.id, changes: payload }).unwrap();
      }
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save season');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="SeasonModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="SeasonModalTitle">{mode === 'add' ? 'Add Season' : 'Edit Season'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          {mode === 'edit' && isLoadingSeason ? (
            <p>Loading season...</p>
          ) : mode === 'edit' && isSeasonError ? (
            <p>Could not load season</p>
          ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
          </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave} disabled={isAdding || isUpdating || (mode ==='edit' && isLoadingSeason)}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
