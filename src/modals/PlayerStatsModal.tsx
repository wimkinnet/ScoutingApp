import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import { calculateCustomIndexPerMinute } from '../utils/perCalc';
import {
  useGetPlayerByIdQuery,
  useGetClubsQuery,
  useGetTeamsQuery,
  useGetGamesQuery,
  useGetLogsQuery,
  useGetSeasonsQuery,
} from '../services/ScoutingApi';
import './Modal.css';
import './PlayerStatsModal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { drawCourt, drawAction } from '../utils/drawCourt';

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

  const { data: games } = useGetGamesQuery(undefined, { skip: !isOpen });
  const { data: logs } = useGetLogsQuery(undefined, { skip: !isOpen });
  const { data: seasons } = useGetSeasonsQuery(undefined, { skip: !isOpen });
  const { data: teams } = useGetTeamsQuery(undefined, { skip: !isOpen });
  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });

  const [selectedGame, setSelectedGame] = useState<string | undefined>(undefined);
  const [selectedSeason, setSelectedSeason] = useState<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string>(ACTIONS[0].id);

  const playerLogs = logs?.filter((log) => log.playerId === id);
  const playerLogsSeason = (selectedSeason === "") ? playerLogs : playerLogs?.filter((log) => teams?.find((t) => games?.find((g) => g.id === log.gameId)?.homeTeamId === t.id)?.seasonId === selectedSeason);
  const playerActions = (selectedGame === "") ? playerLogsSeason : playerLogsSeason?.filter((log) => log.gameId === selectedGame);
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
  const playerin = playerActions?.filter((log) => log.actionId === "21") || [];
  const playerout = playerActions?.filter((log) => log.actionId === "22") || [];
  const uniqueGames = new Set(playerActions?.map(log => log.gameId));
  const numberOfDifferentGames = uniqueGames.size;
  const seconds = playerin.reduce((total, l) => total + l.secRem, 0) - playerout.reduce((total, l) => total + l.secRem, 0);
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
  const avgPoints = Math.round(((freeThrowsMade.length + twoPointsMade.length * 2 + threePointsMade.length * 3)/numberOfDifferentGames)*10)/10;
  const avgFoulsText = `${Math.round((fouls.length/numberOfDifferentGames)*10)/10}`;
  //const avgFreeThrowsText = `${Math.round((freeThrowsMade.length/numberOfDifferentGames)*10)/10} / ${Math.round(((freeThrowsMade.length + freeThrowsMiss.length)/numberOfDifferentGames)*10)/10}`;
  //const avgTwoPointsText = `${Math.round((twoPointsMade.length/numberOfDifferentGames)*10)/10} / ${Math.round(((twoPointsMade.length + twoPointsMiss.length)/numberOfDifferentGames)*10)/10}`;
  //const avgThreePointsText = `${Math.round((threePointsMade.length/numberOfDifferentGames)*10)/10} / ${Math.round(((threePointsMade.length + threePointsMiss.length)/numberOfDifferentGames)*10)/10}`;
  const avgAssistsText = `${Math.round((assists.length/numberOfDifferentGames)*10)/10}`;
  const avgStealsText = `${Math.round((steals.length/numberOfDifferentGames)*10)/10}`;
  const avgTurnoversText = `${Math.round((turnovers.length/numberOfDifferentGames)*10)/10}`;
  const avgBlocksText = `${Math.round((blocks.length/numberOfDifferentGames)*10)/10}`;
  const avgOffreboundsText = `${Math.round((offrebounds.length/numberOfDifferentGames)*10)/10}`;
  const avgDefreboundsText = `${Math.round((defrebounds.length/numberOfDifferentGames)*10)/10}`;
  const playerStats = {
    points: points,
    assists: assists.length,
    offensiveRebounds: offrebounds.length,
    defensiveRebounds: defrebounds.length,
    steals: steals.length,
    blocks: blocks.length,
    turnovers: turnovers.length,
    missedShots: freeThrowsMiss.length + twoPointsMiss.length + threePointsMiss.length,
    secondsPlayed: seconds,
  }

  const playerEfficiencyRate = calculateCustomIndexPerMinute(playerStats)

  const [originXStats, setOriginXStats] = useState<number>(0);
  const [originYStats, setOriginYStats] = useState<number>(0);
  const [scaleStats, setScaleStats] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    setSelectedAction(ACTIONS[0].id);
    setSelectedGame("");
    setSelectedSeason("");
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
      <div className="player-stats-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
        <div className="player-stats-modal-backdrop" onClick={onClose} />
        <div className="player-stats-modal-content">
          <header className="player-stats-modal-header">
            <div className='player-stats-header-blank'></div>
            <div className="playerstats-header-playername">{player?.firstName} {player?.lastName}</div>
            <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
          </header>
          <div className="player-stats-modal-body">
            {isLoadingPlayer ? (
              <p>Loading player...</p>
            ) : isPlayerError ? (
              <p>Could not load player</p>
            ) : (
              <div className='stats-container column'>
                <div className='player-stats-select-container'>
                  <div className="form-field">
                    <select value={selectedSeason} onChange={(e) => (setSelectedSeason(e.target.value), setSelectedGame(""))}>
                      <option value="">All Seasons</option>
                      {seasons?.map((s) => {
                        return (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        );
                      })};
                    </select>
                  </div>
                  {(selectedSeason !== "") && (
                  <div className="form-field">
                    <select value={selectedGame} onChange={(e) => (setSelectedGame(e.target.value))}>
                      <option value="">All games</option>
                      {games?.filter((g) => teams?.find(((t) => t.id === g.homeTeamId))?.seasonId === selectedSeason).map((g) => {
                        return (
                          <option key={g.id} value={g.id}>
                            {clubs?.find((c) => c.id === teams?.find((t) => t.id === g.homeTeamId)?.clubId)?.shortName}
                            {' '}
                            {teams?.find((t) => t.id === g.homeTeamId)?.name}
                            {' vs '}
                            {clubs?.find((c) => c.id === teams?.find((t) => t.id === g.awayTeamId)?.clubId)?.shortName}
                            {' '}
                            {teams?.find((t) => t.id === g.awayTeamId)?.name} @ {new Date(g.date).toLocaleDateString()}
                          </option>
                        );
                      })};
                    </select>
                  </div>
                  )}
                </div>
                <div className='player-stats-game-time-container'>
                  {(selectedGame === "") && (
                    <div className='player-stats-game-time'>
                      # games: {numberOfDifferentGames}
                    </div>
                  )}
                  <div className='player-stats-game-time'>
                    Avg time played: {Math.floor(seconds/numberOfDifferentGames/60)} min {Math.floor((seconds/numberOfDifferentGames)-Math.floor(seconds/numberOfDifferentGames/60)*60)} sec
                  </div>
                  <div className='player-stats-game-time'>
                    Player efficiency rate: {playerEfficiencyRate}
                  </div>
                </div>  
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
                    {(selectedGame === "") && (
                      <div className="player-stats-detail-container">
                        <div className="player-stats-detail XL">Averages per game</div>
                        <div className="player-stats-detail XS">{avgAssistsText}</div>
                        <div className="player-stats-detail XS">{avgStealsText}</div>
                        <div className="player-stats-detail XS">{avgTurnoversText}</div>
                        <div className="player-stats-detail XS">{avgDefreboundsText}</div>
                        <div className="player-stats-detail XS">{avgOffreboundsText}</div>
                        <div className="player-stats-detail XS">{avgBlocksText}</div>
                        <div className="player-stats-detail XS">{avgFoulsText}</div>
                        <div className="player-stats-detail XS">{avgPoints}</div>
                      </div>
                    )}
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
