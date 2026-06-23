import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import {
  useGetPlayerByIdQuery,
  //useGetGamesQuery,
  useGetLogsQuery,
  //useGetSeasonsQuery,
} from '../services/ScoutingApi';
import './Modal.css';
import './PlayerStatsModal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { drawCourt, drawAction } from '../utils/drawCourt';
//import { useMediaQuery } from 'react-responsive';

export default function PlayerStatsModal({ isOpen, onClose }: ModalProps) {

  const ACTIONS = [
    { id: 'sh', label: 'Shooting' },
    { id: 'reb', label: 'Rebounds' },
    { id: 'ass', label: 'Assists' },
    { id: 'st', label: 'Steals' },
    { id: 'to', label: 'Turnovers' },
    { id: 'fls', label: 'Fouls' },
  ] as const;

  const { id } = useSelector((s: RootState) => s.ui.playerStatsModal);

  const { data: player, isLoading: isLoadingPlayer, isError: isPlayerError } = useGetPlayerByIdQuery(id ?? '', {
    skip: !isOpen || !id,
  });

  //const { data: games } = useGetGamesQuery(undefined, { skip: !isOpen });
  const { data: logs } = useGetLogsQuery(undefined, { skip: !isOpen });
  //const { data: seasons } = useGetSeasonsQuery(undefined, { skip: !isOpen });

  //const [selectedGame, setSelectedGame] = useState<string | undefined>(undefined);
  //const [selectedSeason, setSelectedSeason] = useState<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string>(ACTIONS[0].id);

  const playerActions = logs?.filter((log) => log.playerId === id);
  const freeThrowsMade = playerActions?.filter((log) => log.actionId === "1") || [];
  const freeThrowsMiss = playerActions?.filter((log) => log.actionId === "2") || [];
  const twoPointsMade = playerActions?.filter((log) => log.actionId === "3") || [];
  const twoPointsMiss = playerActions?.filter((log) => log.actionId === "4") || [];
  const threePointsMade = playerActions?.filter((log) => log.actionId === "5") || [];
  const threePointsMiss = playerActions?.filter((log) => log.actionId === "6") || [];
  const shots = playerActions?.filter((log) => (Number(log.actionId) > 2) && (Number(log.actionId) < 7)) || [];
  const assists = playerActions?.filter((log) => log.actionId === "7") || [];
  const steals = playerActions?.filter((log) => log.actionId === "9") || [];
  const turnovers = playerActions?.filter((log) => log.actionId === "8") || [];
  const blocks = playerActions?.filter((log) => log.actionId === "10") || [];
  const offrebounds = playerActions?.filter((log) => log.actionId === "11") || [];
  const defrebounds = playerActions?.filter((log) => log.actionId === "12") || [];
  const rebounds = playerActions?.filter((log) => (Number(log.actionId) > 10) && (Number(log.actionId) < 13)) || [];
  const fouls = playerActions?.filter((log) => (Number(log.actionId) > 12) && (Number(log.actionId) < 21)) || [];
  const points = freeThrowsMade.length + twoPointsMade.length * 2 + threePointsMade.length * 3;
  const foulsText = `${fouls.length}`;
  const freeThrowsText = `${freeThrowsMade.length} / ${freeThrowsMade.length + freeThrowsMiss.length} (${freeThrowsMade.length + freeThrowsMiss.length > 0 ? Math.round((freeThrowsMade.length / (freeThrowsMade.length + freeThrowsMiss.length)) * 100) : 0}%)`;
  const twoPointsText = `${twoPointsMade.length} / ${twoPointsMade.length + twoPointsMiss.length} (${twoPointsMade.length + twoPointsMiss.length > 0 ? Math.round((twoPointsMade.length / (twoPointsMade.length + twoPointsMiss.length)) * 100) : 0}%)`;
  const threePointsText = `${threePointsMade.length} / ${threePointsMade.length + threePointsMiss.length} (${threePointsMade.length + threePointsMiss.length > 0 ? Math.round((threePointsMade.length / (threePointsMade.length + threePointsMiss.length)) * 100) : 0}%)`;
  const assistsText = `${assists.length}`;
  const stealsText = `${steals.length}`;
  const turnoversText = `${turnovers.length}`;
  const blocksText = `${blocks.length}`;
  const offreboundsText = `${offrebounds.length}`;
  const defreboundsText = `${defrebounds.length}`;

  const [originXStats, setOriginXStats] = useState<number>(0);
  const [originYStats, setOriginYStats] = useState<number>(0);
  const [scaleStats, setScaleStats] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  //const isNarrowScreen = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    setSelectedAction(ACTIONS[0].id);
  }, [isOpen]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCourt({ ctx, canvas, setOriginX: setOriginXStats, setOriginY: setOriginYStats, setScale: setScaleStats });
    
    switch (selectedAction) {
      case 'sh': {
        shots.map(sh => {
          const cl = (sh.actionId === '3' || sh.actionId === '5') ? 'green' : 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: sh.positionX, shotY: sh.positionY, color: cl });
        });
        break;
      };
      case 'reb': {
        rebounds.map(reb => {
          const cl = (reb.actionId === '11') ? 'green' : 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: reb.positionX, shotY: reb.positionY, color: cl })
        });
        break;
      };
      case 'ass': {
        assists.map(ass => {
          const cl = 'green';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: ass.positionX, shotY: ass.positionY, color: cl });
        });
        break;
      };
      case 'st': {
        steals.map(st => {
          const cl = 'green';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: st.positionX, shotY: st.positionY, color: cl });
        });
        break;
      };
      case 'to': {
        turnovers.map(to => {
          const cl = 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: to.positionX, shotY: to.positionY, color: cl });
        });
        break;
      };
      case 'fls': {
        fouls.map(fl => {
          const cl = 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: fl.positionX, shotY: fl.positionY, color: cl });
        });
        break;
      };
    };

  }, [isOpen, selectedAction, playerActions]);

  if (!isOpen) return null;

  return (
    <div>
      <div className="modal scout-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-content">
          <header className="modal-header">
            <div className='header-blank'></div>
            <div className="playerstats-header-playername">{player?.firstName} {player?.lastName}</div>
            <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
          </header>
          <div className="modal-body">
            {isLoadingPlayer ? (
              <p>Loading player...</p>
            ) : isPlayerError ? (
              <p>Could not load player</p>
            ) : (
              <div className='stats-container column'>
                <div className='stats-team-detail'>
                  <div className='stats-details'>
                    <div className="player-stats-detail-container">
                      <div className="player-stats-detail L">1P</div>
                      <div className="player-stats-detail L">2P</div>
                      <div className="player-stats-detail L">3P</div>
                      <div className="player-stats-detail XS">ASS</div>
                      <div className="player-stats-detail XS">ST</div>
                      <div className="player-stats-detail XS">TO</div>
                      <div className="player-stats-detail XS">DR</div>
                      <div className="player-stats-detail XS">OR</div>
                      <div className="player-stats-detail XS">BS</div>
                      <div className="player-stats-detail XS">Fls</div>
                      <div className="player-stats-detail XS">Pts</div>
                    </div>
                    <div className="player-stats-detail-container">
                      <div className="player-stats-detail L">{freeThrowsText}</div>
                      <div className="player-stats-detail L">{twoPointsText}</div>
                      <div className="player-stats-detail L">{threePointsText}</div>
                      <div className="player-stats-detail XS">{assistsText}</div>
                      <div className="player-stats-detail XS">{stealsText}</div>
                      <div className="player-stats-detail XS">{turnoversText}</div>
                      <div className="player-stats-detail XS">{defreboundsText}</div>
                      <div className="player-stats-detail XS">{offreboundsText}</div>
                      <div className="player-stats-detail XS">{blocksText}</div>
                      <div className="player-stats-detail XS">{foulsText}</div>
                      <div className="player-stats-detail XS">{points}</div>
                    </div>
                  </div>
                </div>
                <div className='stats-player-detail-container'>
                  <div className='stats-player-selection'>
                    {ACTIONS.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => setSelectedAction(a.id)}
                        className={`btn ${selectedAction === a.id ? 'selected' : ''}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                  <canvas className='stats-court' ref={canvasRef} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
