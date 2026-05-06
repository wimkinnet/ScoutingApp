import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { closeModal } from '../features/ui/uiSlice';
import { addSeason, updateSeason } from '../features/seasons/seasonsSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function SeasonModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.seasonModal);
  const season = useSelector((s: RootState) => (mode === 'edit' && id) ? s.seasons.entities[id] : null);

  const [name, setName] = useState(season?.name ?? '');
  
  useEffect(() => {
    if (!isOpen) return;
    setName(season?.name ?? '');
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
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
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
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
