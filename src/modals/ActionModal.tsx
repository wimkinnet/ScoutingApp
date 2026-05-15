import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { closeActionModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function ActionModal() {
  const dispatch = useDispatch();
  const { isOpen , player, posX} = useSelector((s: RootState) => s.ui.actionModal);

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

  const isLeft = (posX ? posX < 14 : false) 

  if (!isOpen) return null;

  return (
    <div className="modal action" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="SeasonModalTitle">
      <div className="modal-backdrop action" onClick={onClose} />
      <div className={isLeft ? "modal-content left" : "modal-content right"}>
        <header className="modal-header">
          <div id="ActionModalTitle">Select Action for {players.entities[player?.playerId ? player.playerId : 0].firstName} {players.entities[player?.playerId ? player.playerId : 0].lastName} # {player?.shirtNumber}</div>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>
      </div>
    </div>
  );
}
