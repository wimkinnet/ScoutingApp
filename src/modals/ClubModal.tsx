import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import { useAddClubMutation, useUpdateClubMutation, useGetClubByIdQuery } from '../services/ScoutingApi';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function ClubModal({ isOpen, onClose }: ModalProps) {
  const { mode, id } = useSelector((s: RootState) => s.ui.clubModal);
  const { data: club, isLoading: isLoadingClub, isError: isClubError } = useGetClubByIdQuery(id ?? '', {
      skip: !isOpen || mode !== 'edit' || !id,
    });

  const [addClub, { isLoading: isAdding }] = useAddClubMutation();
  const [updateClub, { isLoading: isUpdating }] = useUpdateClubMutation();
  
  const [name, setName] = useState(club?.name ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(club?.registrationNumber ?? '');
  
  useEffect(() => {
    if (!isOpen) return;

    if (mode === 'edit' && club) {
      setName(club.name ?? '');
      setRegistrationNumber(club.registrationNumber ?? '');
    } else if (mode === 'add') {
      setName('');
      setRegistrationNumber('');
    }
  }, [isOpen, mode, id, club]);

  const onSave = async () => {
    if (!name.trim()) return alert('Name is mandatory');
    if (!registrationNumber.trim()) return alert('Registration number is mandatory');

    const payload = {
      name,
      registrationNumber,
    };

    try {
      if (mode === 'add') {
        await addClub(payload).unwrap();
      } else if (mode === 'edit' && club?.id) {
        await updateClub({ id: club.id, changes: payload }).unwrap();
      }
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
          {mode === 'edit' && isLoadingClub ? (
            <p>Loading club...</p>
          ) : mode === 'edit' && isClubError ? (
            <p>Could not load club</p>
          ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-field"><label>Registration Number</label><input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} /></div>
          </div>
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave} disabled={isAdding || isUpdating || (mode ==='edit' && isLoadingClub)}>
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
        </footer>
      </div>
    </div>
  );
}
