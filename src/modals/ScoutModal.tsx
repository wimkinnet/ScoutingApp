import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addPlayer, updatePlayer } from '../features/players/playersSlice';
import { closeModal } from '../features/ui/uiSlice';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function ScoutModal() {
  const dispatch = useDispatch();
  const { isOpen, id } = useSelector((s: RootState) => s.ui.scoutModal);
  const game = useSelector((s: RootState) => (id) ? s.games.entities[id] : null);
  const teams = useSelector((s: RootState) => s.teams);
  const clubs = useSelector((s: RootState) => s.clubs);

  const HomeTeam = game ? (game.scoutHome ? `${clubs.entities[teams.entities[game.scoutTeamId].clubId].name} ${teams.entities[game.scoutTeamId].name}` : `${clubs.entities[teams.entities[game.otherTeamId].clubId].name} ${teams.entities[game.otherTeamId].name}`) : null;
  const AwayTeam = game ? (game.scoutHome ? `${clubs.entities[teams.entities[game.otherTeamId].clubId].name} ${teams.entities[game.otherTeamId].name}` : `${clubs.entities[teams.entities[game.scoutTeamId].clubId].name} ${teams.entities[game.scoutTeamId].name}`) : null;

  const Header = `${HomeTeam} vs ${AwayTeam} - ${game?.date.toLocaleDateString()}`;

  /*const [lastName, setLastName] = useState(player?.lastName ?? '');
  const [firstName, setFirstName] = useState(player?.firstName ?? '');
  const [dateOfBirth, setDateOfBirth] = useState(player?.dateOfBirth ?? undefined);

  useEffect(() => {
    if (!isOpen) return;
    setLastName(player?.lastName ?? '');
    setFirstName(player?.firstName ?? '');
    setDateOfBirth(player?.dateOfBirth ?? undefined);
  }, [isOpen, id]);*/

  const onClose = () => dispatch(closeModal());
  /*const onSave = () => {
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
  };*/

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCourt = (ctx: CanvasRenderingContext2D) => {
    
    const canvas = canvasRef.current;

    const M = {
      L: 28.0,
      W:  15.0,
      centreCircleR: 1.80,
      LaneW: 4.90,
      ftLaneFromEnd: 5.80,
      threePtR: 6.75,
      ftCircleR: 1.80,
      treePtMinSide: 0.90,
      restrictedR: 1.25,
    };

    const Equip = {
      backboardFromEnd: 1.20,
      rimFromBoard: 0.15,
      rimR: 0.225,
      boardH: 1.05,
      boardW: 0.03
    };

    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = cssW * devicePixelRatio;
    canvas.height = cssH * devicePixelRatio;
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const MarginPx = 40;
    const usableW = cssW - 2 * MarginPx;
    const usableH = cssH - 2 * MarginPx;
    const scale = Math.min(usableW / M.L, usableH / M.W);

    const origin = {
      x: (cssW - M.L * scale) / 2,
      y: (cssH - M.W * scale) / 2,
    };

    ctx.clearRect(0, 0, cssW, cssH);
    
    ctx.strokeStyle = 'var(--bg-soft)';
    ctx.strokeRect(origin.x, origin.y, M.L * scale, M.W * scale);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawCourt(ctx);
  });

  window.addEventListener('resize', () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawCourt(ctx);
  });

  if (!isOpen) return null;

  return (
    <div className="modal scout-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2>{Header}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
