import { useEffect, useState } from 'react';
import type { Player } from '../services/ScoutingApi';
import type { GamePlayer } from '../app/types';
import './SubstitutionPanel.css';

const LINEUP_SIZE = 5;

interface SubstitutionPanelProps {
  teamName: string;
  onCourt: GamePlayer[];
  bench: GamePlayer[];
  // Five to preselect when nobody is on court, e.g. the lineup that finished the previous quarter
  suggestedLineup: GamePlayer[];
  players?: Player[];
  quarter: number;
  secondsLeft: number;
  onConfirm: (outs: GamePlayer[], ins: GamePlayer[]) => Promise<void>;
  onClose: () => void;
}

const formatClock = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

export default function SubstitutionPanel({
  teamName, onCourt, bench, suggestedLineup, players, quarter, secondsLeft, onConfirm, onClose,
}: SubstitutionPanelProps) {
  const byShirt = (a: GamePlayer, b: GamePlayer) => a.shirtNumber - b.shirtNumber;
  const benchSorted = [...bench].sort(byShirt);
  const courtSorted = [...onCourt].sort(byShirt);
  const roster = [...benchSorted, ...courtSorted];
  const startsFromSuggestion = onCourt.length === 0 && suggestedLineup.length > 0;

  const [lineup, setLineup] = useState<Set<string>>(
    () => new Set((startsFromSuggestion ? suggestedLineup : onCourt).map((p) => p.playerId))
  );
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const onCourtIds = new Set(onCourt.map((p) => p.playerId));
  const outs = onCourt.filter((p) => !lineup.has(p.playerId));
  const ins = roster.filter((p) => lineup.has(p.playerId) && !onCourtIds.has(p.playerId));
  const neededOnCourt = Math.min(LINEUP_SIZE, roster.length);
  const canConfirm = !isSaving && lineup.size === neededOnCourt && (outs.length > 0 || ins.length > 0);

  const firstName = (pl: GamePlayer) => players?.find((x) => x.id === pl.playerId)?.firstName ?? '';
  const shirts = (list: GamePlayer[]) => list.map((p) => `#${p.shirtNumber}`).join(', ');

  // No limit while picking: the scout sees who comes in before who goes out, so the lineup
  // may count more than five until the players going out are picked
  const toggle = (pl: GamePlayer) => {
    setLineup((prev) => {
      const next = new Set(prev);
      if (next.has(pl.playerId)) next.delete(pl.playerId);
      else next.add(pl.playerId);
      return next;
    });
  };

  const pickHint = lineup.size > neededOnCourt
    ? `Pick ${lineup.size - neededOnCourt} going out`
    : lineup.size < neededOnCourt
      ? `Pick ${neededOnCourt - lineup.size} coming in`
      : null;

  const playerButton = (pl: GamePlayer) => {
    const selected = lineup.has(pl.playerId);
    const state = selected
      ? (onCourtIds.has(pl.playerId) ? 'stays' : 'in')
      : (onCourtIds.has(pl.playerId) ? 'out' : 'bench');
    return (
      <button key={pl.playerId} className={`subs-player ${state}`} onClick={() => toggle(pl)} disabled={isSaving}>
        <span className='subs-player-number'>{pl.shirtNumber}</span>
        <span className='subs-player-name'>{firstName(pl)}</span>
        {state === 'in' && <span className='subs-badge'>IN</span>}
        {state === 'out' && <span className='subs-badge'>OUT</span>}
      </button>
    );
  };

  const confirm = async () => {
    if (!canConfirm) return;
    setIsSaving(true);
    try {
      await onConfirm(outs, ins);
      onClose();
    } catch {
      setIsSaving(false);
    }
  };

  return (
    <div className='subs-layer'>
      <div className='subs-backdrop' onClick={onClose} />
      <div className='subs-panel' role='dialog' aria-labelledby='SubsTitle'>
        <header className='subs-header'>
          <div id='SubsTitle' className='subs-title'>Substitutions {teamName}</div>
          <div className='subs-clock'>Q{quarter} · {formatClock(secondsLeft)}</div>
          <button className='btn small' onClick={onClose} aria-label='Close'>✕</button>
        </header>

        {startsFromSuggestion && (
          <div className='subs-note'>Preselected: the five who finished the previous quarter</div>
        )}
        {onCourt.length === 0 && secondsLeft === 0 && (
          <div className='subs-warning'>The clock shows 0:00. Set the clock for the new quarter first.</div>
        )}

        <div className='subs-section-label'>1. Coming in</div>
        <div className='subs-grid'>
          {benchSorted.map(playerButton)}
          {benchSorted.length === 0 && <div className='subs-empty'>Nobody on the bench</div>}
        </div>

        {courtSorted.length > 0 && (
          <>
            <div className='subs-section-label'>2. Going out</div>
            <div className='subs-grid'>
              {courtSorted.map(playerButton)}
            </div>
          </>
        )}

        <div className='subs-summary'>
          <span className={lineup.size === neededOnCourt ? '' : 'subs-count-off'}>On court: {lineup.size}/{neededOnCourt}</span>
          {pickHint && <span className='subs-count-off'>{pickHint}</span>}
          {outs.length > 0 && <span>Out: {shirts(outs)}</span>}
          {ins.length > 0 && <span>In: {shirts(ins)}</span>}
        </div>

        <div className='subs-actions'>
          <button className='btn' onClick={confirm} disabled={!canConfirm}>
            {isSaving ? 'Saving...' : 'Confirm'}
          </button>
          <button className='btn' onClick={onClose} disabled={isSaving}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
