import { useEffect, useState } from 'react';
import { useAddLogMutation } from '../services/ScoutingApi';
import type { Action, Player } from '../services/ScoutingApi';
import type { GamePlayer } from '../app/types';
import {
  ASSIST,
  MADE_FIELD_GOALS,
  courtSideFor,
  otherActions,
  probableActions,
} from '../utils/actionLogic';
import './ActionPopover.css';

type Step = 'player' | 'action' | 'assist';

const errorMessage = (err: unknown, fallback: string) =>
  (err as { data?: { message?: string } })?.data?.message || fallback;

interface ActionPopoverProps {
  anchor: { x: number; y: number };   // where the court was clicked, in viewport pixels
  posX: number;                        // court position in metres
  posY: number;
  gameId: string;
  quarter: number;
  secRem: number;
  possession: string;                  // "Home" | "Away"
  awayDirection: string;               // "Left" | "Right" | ""
  homeOnCourt: GamePlayer[];
  awayOnCourt: GamePlayer[];
  preselectedPlayer?: GamePlayer;
  players?: Player[];
  actions?: Action[];
  onLogged: (actionId: string, player: GamePlayer) => void;
  onClose: () => void;
}

export default function ActionPopover({
  anchor, posX, posY, gameId, quarter, secRem, possession, awayDirection,
  homeOnCourt, awayOnCourt, preselectedPlayer, players, actions, onLogged, onClose,
}: ActionPopoverProps) {
  const [step, setStep] = useState<Step>(preselectedPlayer ? 'action' : 'player');
  const [player, setPlayer] = useState<GamePlayer | undefined>(preselectedPlayer);
  const [isSaving, setIsSaving] = useState(false);
  const [addLog] = useAddLogMutation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === 'q') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const playerName = (pl: GamePlayer) => {
    const p = players?.find((x) => x.id === pl.playerId);
    return p ? `${p.firstName} ${p.lastName}` : `#${pl.shirtNumber}`;
  };
  const actionById = (id: string) => actions?.find((a) => a.id === id);

  const courtSide = player ? courtSideFor({ isHomePlayer: player.homeTeam, posX, awayDirection }) : null;
  const probable = player ? probableActions({ isHomePlayer: player.homeTeam, posX, posY, possession, awayDirection }) : [];
  const others = otherActions(actions?.map((a) => a.id) ?? [], probable);
  const teammates = player ? (player.homeTeam ? homeOnCourt : awayOnCourt).filter((pl) => pl.playerId !== player.playerId) : [];

  const save = async (actionId: string, by: GamePlayer) => {
    await addLog({
      gameId,
      actionId,
      playerId: by.playerId,
      positionX: posX,
      positionY: posY,
      quarter,
      secRem,
      courtSide,
    }).unwrap();
  };

  const onAction = async (actionId: string) => {
    if (!player || isSaving) return;
    setIsSaving(true);
    try {
      await save(actionId, player);
      onLogged(actionId, player);
      if (MADE_FIELD_GOALS.includes(actionId) && teammates.length > 0) {
        setStep('assist');
        setIsSaving(false);
      } else {
        onClose();
      }
    } catch (err) {
      setIsSaving(false);
      alert(errorMessage(err, 'Could not save action'));
    }
  };

  // The assist is logged at the shot's spot, right after the shot
  const onAssist = async (assister: GamePlayer) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await save(ASSIST, assister);
      onClose();
    } catch (err) {
      setIsSaving(false);
      alert(errorMessage(err, 'Could not save assist'));
    }
  };

  // Open towards the middle of the screen so the popover stays next to the click
  const opensLeft = anchor.x > window.innerWidth / 2;
  const opensUp = anchor.y > window.innerHeight * 0.55;
  const style = {
    left: anchor.x + (opensLeft ? -12 : 12),
    top: anchor.y + (opensUp ? 12 : -12),
    transform: `translate(${opensLeft ? '-100%' : '0'}, ${opensUp ? '-100%' : '0'})`,
  };

  const playerButton = (pl: GamePlayer, onClick: () => void) => (
    <button key={pl.playerId} className='popover-player' onClick={onClick} title={playerName(pl)} disabled={isSaving}>
      {pl.shirtNumber}
    </button>
  );

  return (
    <div className='popover-layer'>
      <div className='popover-backdrop' onClick={onClose} />
      <div className='action-popover' style={style} role='dialog'>
        {step === 'player' && (
          <>
            <div className='popover-title'>Who?</div>
            <div className='popover-row'>
              {homeOnCourt.map((pl) => playerButton(pl, () => { setPlayer(pl); setStep('action'); }))}
            </div>
            <div className='popover-row away'>
              {awayOnCourt.map((pl) => playerButton(pl, () => { setPlayer(pl); setStep('action'); }))}
            </div>
            {homeOnCourt.length + awayOnCourt.length === 0 && <div className='popover-hint'>No players on court yet</div>}
          </>
        )}

        {step === 'action' && player && (
          <>
            <div className='popover-title'>#{player.shirtNumber} {playerName(player)}</div>
            <div className='popover-row'>
              {probable.map((id) => (
                <button key={id} className='popover-action' onClick={() => onAction(id)} title={actionById(id)?.name} disabled={isSaving}>
                  {actionById(id)?.label}
                </button>
              ))}
            </div>
            <div className='popover-row'>
              {others.map((id) => (
                <button key={id} className='popover-action other' onClick={() => onAction(id)} title={actionById(id)?.name} disabled={isSaving}>
                  {actionById(id)?.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 'assist' && player && (
          <>
            <div className='popover-title'>Assist on #{player.shirtNumber}'s basket?</div>
            <div className='popover-row'>
              {teammates.map((pl) => playerButton(pl, () => onAssist(pl)))}
            </div>
            <div className='popover-row'>
              <button className='popover-action other wide' onClick={onClose} disabled={isSaving}>No assist</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
