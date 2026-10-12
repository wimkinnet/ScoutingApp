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

type Step = 'player' | 'action' | 'assist' | 'assistSpot';

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
  homeTeamName: string;
  awayTeamName: string;
  homeOnCourt: GamePlayer[];
  awayOnCourt: GamePlayer[];
  preselectedPlayer?: GamePlayer;
  players?: Player[];
  actions?: Action[];
  courtPosition: (clientX: number, clientY: number) => { x: number; y: number } | null;
  courtBox: () => { left: number; top: number; right: number; bottom: number } | null;
  onLogged: (actionId: string, player: GamePlayer) => void;
  onClose: () => void;
}

export default function ActionPopover({
  anchor, posX, posY, gameId, quarter, secRem, possession, awayDirection,
  homeTeamName, awayTeamName, homeOnCourt, awayOnCourt, preselectedPlayer, players, actions, courtPosition, courtBox, onLogged, onClose,
}: ActionPopoverProps) {
  const [step, setStep] = useState<Step>(preselectedPlayer ? 'action' : 'player');
  const [player, setPlayer] = useState<GamePlayer | undefined>(preselectedPlayer);
  const [assister, setAssister] = useState<GamePlayer | undefined>();
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
  const firstName = (pl: GamePlayer) => players?.find((x) => x.id === pl.playerId)?.firstName ?? '';
  const actionById = (id: string) => actions?.find((a) => a.id === id);

  const probable = player ? probableActions({ isHomePlayer: player.homeTeam, posX, posY, possession, awayDirection }) : [];
  const others = otherActions(actions?.map((a) => a.id) ?? [], probable);
  const teammates = player ? (player.homeTeam ? homeOnCourt : awayOnCourt).filter((pl) => pl.playerId !== player.playerId) : [];

  const save = async (actionId: string, by: GamePlayer, at = { x: posX, y: posY }) => {
    await addLog({
      gameId,
      actionId,
      playerId: by.playerId,
      positionX: at.x,
      positionY: at.y,
      quarter,
      secRem,
      courtSide: courtSideFor({ isHomePlayer: by.homeTeam, posX: at.x, awayDirection }),
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

  // The assist is logged at the spot the pass came from, right after the shot
  const onAssistSpot = async (clientX: number, clientY: number) => {
    const at = courtPosition(clientX, clientY);
    if (!assister || !at || isSaving) return;
    setIsSaving(true);
    try {
      await save(ASSIST, assister, at);
      onClose();
    } catch (err) {
      setIsSaving(false);
      alert(errorMessage(err, 'Could not save assist'));
    }
  };

  // Open towards the middle of the screen so the popover stays next to the click
  const opensLeft = anchor.x > window.innerWidth / 2;
  const opensUp = anchor.y > window.innerHeight * 0.55;
  const nextToClick = {
    left: anchor.x + (opensLeft ? -12 : 12),
    top: anchor.y + (opensUp ? 12 : -12),
    transform: `translate(${opensLeft ? '-100%' : '0'}, ${opensUp ? '-100%' : '0'})`,
  };
  // While picking the pass spot the popover must not cover any of the court: sit just above it
  const court = step === 'assistSpot' ? courtBox() : null;
  const style = court
    ? { left: (court.left + court.right) / 2, top: court.top - 6, transform: 'translate(-50%, -100%)' }
    : nextToClick;

  const playerButton = (pl: GamePlayer, onClick: () => void) => (
    <button key={pl.playerId} className='popover-player' onClick={onClick} title={playerName(pl)} disabled={isSaving}>
      <span className='popover-player-number'>{pl.shirtNumber}</span>
      <span className='popover-player-name'>{firstName(pl)}</span>
    </button>
  );

  return (
    <div className='popover-layer'>
      {step === 'assistSpot' ? (
        // Clicks go to the court underneath: they pick where the pass came from
        <div className='popover-backdrop picking' onClick={(e) => onAssistSpot(e.clientX, e.clientY)} />
      ) : (
        <div className='popover-backdrop' onClick={onClose} />
      )}
      <div className='action-popover' style={style} role='dialog'>
        {step === 'player' && (
          <>
            <div className='popover-team-label'>{homeTeamName}</div>
            <div className='popover-row'>
              {homeOnCourt.map((pl) => playerButton(pl, () => { setPlayer(pl); setStep('action'); }))}
            </div>
            <div className='popover-team-label away'>{awayTeamName}</div>
            <div className='popover-row'>
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
            <div className='popover-title'>Assist on #{player.shirtNumber} {firstName(player)}'s basket?</div>
            <div className='popover-team-label'>{player.homeTeam ? homeTeamName : awayTeamName}</div>
            <div className='popover-row'>
              {teammates.map((pl) => playerButton(pl, () => { setAssister(pl); setStep('assistSpot'); }))}
            </div>
            <div className='popover-row'>
              <button className='popover-action other wide' onClick={onClose} disabled={isSaving}>No assist</button>
            </div>
          </>
        )}

        {step === 'assistSpot' && assister && (
          <>
            <div className='popover-row inline'>
              <div>
                <div className='popover-title'>Where did #{assister.shirtNumber} {firstName(assister)} pass from?</div>
                <div className='popover-hint'>Click that spot on the court</div>
              </div>
              <button className='popover-action other' onClick={() => setStep('assist')} disabled={isSaving}>Back</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
