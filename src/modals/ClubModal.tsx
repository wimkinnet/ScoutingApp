import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addClub, updateClub } from '../features/clubs/clubsSlice';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function ClubModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.clubModal);
  const club = useSelector((s: RootState) => (mode === 'edit' && id) ? s.clubs.entities[id] : null);

  const [name, setName] = useState(club?.name ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(club?.registrationNumber ?? '');
  
  useEffect(() => {
    if (!isOpen) return;
    setName(club?.name ?? '');
    setRegistrationNumber(club?.registrationNumber ?? '');
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
    if (!name.trim()) return alert('Name is mandatory');
    if (!registrationNumber.trim()) return alert('Registration number is mandatory');

    const payload = {
      name,
      registrationNumber,
    };

    try {
      if (mode === 'add') dispatch(addClub(payload as any));
      else if (mode === 'edit' && club?.id) dispatch(updateClub({ id: club.id, changes: payload }));
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save club');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="ClubModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="ClubModalTitle">{mode === 'add' ? 'Add Club' : 'Edit Club'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-field"><label>Registration Number</label><input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} /></div>
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
