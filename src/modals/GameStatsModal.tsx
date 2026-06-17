import { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import {
  useGetGameByIdQuery,
  useGetPlayersQuery,
  useGetClubsQuery,
  useGetTeamsQuery,
  useGetLogsQuery,
} from '../services/ScoutingApi';
import './GameStatsModal.css';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import { drawCourt, drawAction } from '../utils/drawCourt';
import { useMediaQuery } from 'react-responsive';

export default function GameStatsModal({ isOpen, onClose }: ModalProps) {

  const ACTIONS = [
    { id: 'sh', label: 'Schooting' },
    { id: 'reb', label: 'Rebounds' },
    { id: 'ass', label: 'Assists' },
    { id: 'st', label: 'Steals' },
    { id: 'to', label: 'Turnovers' },
    { id: 'fls', label: 'Fouls' },
  ] as const;

  const TEAMS = [
    { id: 'h', label: 'Home' },
    { id: 'a', label: 'Away' },
  ] as const;

  const { id } = useSelector((s: RootState) => s.ui.gameStatsModal);

  const { data: game, isLoading: isLoadingGame, isError: isGameError } = useGetGameByIdQuery(id ?? '', {
    skip: !isOpen || !id,
  });

  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });
  const { data: players } = useGetPlayersQuery(undefined, { skip: !isOpen });
  const { data: teams } = useGetTeamsQuery(undefined, { skip: !isOpen });
  const { data: logs } = useGetLogsQuery(undefined, { skip: !isOpen });

  const ht = teams?.find((t) => (t.id === game?.homeTeamId))
  const at = teams?.find((t) => (t.id === game?.awayTeamId))

  const HomeClub = clubs?.find((cl) => (cl.id === ht?.clubId));
  const AwayClub = clubs?.find((cl) => (cl.id === at?.clubId));
  const Home = `${HomeClub?.name}`;
  const Away = `${AwayClub?.name}`;

  const [selectedPlayer, setSelectedPlayer] = useState<string | undefined>(undefined);
  const [selectedAction, setSelectedAction] = useState<string>(ACTIONS[0].id);
  const [selectedTeam, setSelectedTeam] = useState<string>(TEAMS[0].id);

  const homePlayersId = game?.homePlayers.map((player) => (player.playerId));
  const awayPlayersId = game?.awayPlayers.map((player) => (player.playerId));
  const gameActions = logs?.filter((log) => log.gameId === id);
  const freeThrowsMade = gameActions?.filter((log) => log.actionId === "1") || [];
  const freeThrowsMiss = gameActions?.filter((log) => log.actionId === "2") || [];
  const twoPointsMade = gameActions?.filter((log) => log.actionId === "3") || [];
  const twoPointsMiss = gameActions?.filter((log) => log.actionId === "4") || [];
  const threePointsMade = gameActions?.filter((log) => log.actionId === "5") || [];
  const threePointsMiss = gameActions?.filter((log) => log.actionId === "6") || [];
  const shots = gameActions?.filter((log) => (Number(log.actionId) > 2) && (Number(log.actionId) < 7)) || [];
  const assists = gameActions?.filter((log) => log.actionId === "7") || [];
  const steals = gameActions?.filter((log) => log.actionId === "9") || [];
  const turnovers = gameActions?.filter((log) => log.actionId === "8") || [];
  const blocks = gameActions?.filter((log) => log.actionId === "10") || [];
  const offrebounds = gameActions?.filter((log) => log.actionId === "11") || [];
  const defrebounds = gameActions?.filter((log) => log.actionId === "12") || [];
  const rebounds = gameActions?.filter((log) => (Number(log.actionId) > 10) && (Number(log.actionId) < 13)) || [];

  const homeFreeThrowsMade = freeThrowsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayFreeThrowsMade = freeThrowsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeTwoPoints = twoPointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayTwoPoints = twoPointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeThreePoints = threePointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayThreePoints = threePointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const shotsHome = shots.filter((log) => homePlayersId?.includes(log.playerId));
  const shotsAway = shots.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeScore = homeFreeThrowsMade.length + homeTwoPoints?.length * 2 + homeThreePoints?.length * 3;
  const awayScore = awayFreeThrowsMade.length + awayTwoPoints?.length * 2 + awayThreePoints?.length * 3;
  const fouls = gameActions?.filter((log) => (Number(log.actionId) > 12) && (Number(log.actionId) < 21)) || [];
  const foulsHome = fouls.filter((log) => homePlayersId?.includes(log.playerId));
  const foulsAway = fouls.filter((log) => awayPlayersId?.includes(log.playerId));
  const freeTrowsMadeHome = freeThrowsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const freeTrowsMadeAway = freeThrowsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const twoPointsMadeHome = twoPointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const twoPointsMadeAway = twoPointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const threePointsMadeHome = threePointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const threePointsMadeAway = threePointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const freeTrowsMissHome = freeThrowsMiss.filter((log) => homePlayersId?.includes(log.playerId));
  const freeTrowsMissAway = freeThrowsMiss.filter((log) => awayPlayersId?.includes(log.playerId));
  const twoPointsMissHome = twoPointsMiss.filter((log) => homePlayersId?.includes(log.playerId));
  const twoPointsMissAway = twoPointsMiss.filter((log) => awayPlayersId?.includes(log.playerId));
  const threePointsMissHome = threePointsMiss.filter((log) => homePlayersId?.includes(log.playerId));
  const threePointsMissAway = threePointsMiss.filter((log) => awayPlayersId?.includes(log.playerId));
  const assistsHome = assists.filter((log) => homePlayersId?.includes(log.playerId));
  const assistsAway = assists.filter((log) => awayPlayersId?.includes(log.playerId));
  const stealsHome = steals.filter((log) => homePlayersId?.includes(log.playerId));
  const stealsAway = steals.filter((log) => awayPlayersId?.includes(log.playerId));
  const turnoversHome = turnovers.filter((log) => homePlayersId?.includes(log.playerId));
  const turnoversAway = turnovers.filter((log) => awayPlayersId?.includes(log.playerId));
  const blocksHome = blocks.filter((log) => homePlayersId?.includes(log.playerId));
  const blocksAway = blocks.filter((log) => awayPlayersId?.includes(log.playerId));
  const offreboundsHome = offrebounds.filter((log) => homePlayersId?.includes(log.playerId));
  const offreboundsAway = offrebounds.filter((log) => awayPlayersId?.includes(log.playerId));
  const defreboundsHome = defrebounds.filter((log) => homePlayersId?.includes(log.playerId));
  const defreboundsAway = defrebounds.filter((log) => awayPlayersId?.includes(log.playerId));
  const reboundsHome = rebounds.filter((log) => homePlayersId?.includes(log.playerId));
  const reboundsAway = rebounds.filter((log) => awayPlayersId?.includes(log.playerId));
  const HomeStats = {
    freeThrows: `${freeTrowsMadeHome.length} / ${freeTrowsMadeHome.length + freeTrowsMissHome.length} (${freeTrowsMadeHome.length + freeTrowsMissHome.length > 0 ? Math.round((freeTrowsMadeHome.length / (freeTrowsMadeHome.length + freeTrowsMissHome.length)) * 100) : 0}%)`,
    twoPoints: `${twoPointsMadeHome.length} / ${twoPointsMadeHome.length + twoPointsMissHome.length} (${twoPointsMadeHome.length + twoPointsMissHome.length > 0 ? Math.round((twoPointsMadeHome.length / (twoPointsMadeHome.length + twoPointsMissHome.length)) * 100) : 0}%)`,
    threePoints: `${threePointsMadeHome.length} / ${threePointsMadeHome.length + threePointsMissHome.length} (${threePointsMadeHome.length + threePointsMissHome.length > 0 ? Math.round((threePointsMadeHome.length / (threePointsMadeHome.length + threePointsMissHome.length)) * 100) : 0}%)`,
    assistsText: `${assistsHome.length}`,
    freeThrowsShort: `${freeTrowsMadeHome.length} / ${freeTrowsMadeHome.length + freeTrowsMissHome.length}`,
    twoPointsShort: `${twoPointsMadeHome.length} / ${twoPointsMadeHome.length + twoPointsMissHome.length}`,
    threePointsShort: `${threePointsMadeHome.length} / ${threePointsMadeHome.length + threePointsMissHome.length}`,
    shots: shotsHome,
    assists: assistsHome,
    rebounds: reboundsHome,
    steals: stealsHome,
    turnovers: turnoversHome,
    blocks: blocksHome,
    fouls: foulsHome,
    stealsText: `${stealsHome.length}`,
    turnoversText: `${turnoversHome.length}`,
    blocksText: `${blocksHome.length}`,
    offreboundsText: `${offreboundsHome.length}`,
    defreboundsText: `${defreboundsHome.length}`,
    foulsText: `${fouls.filter((log) => homePlayersId?.includes(log.playerId)).length}`,
    points: `${homeScore}`,
  }
  const AwayStats = {
    freeThrows: `${freeTrowsMadeAway.length} / ${freeTrowsMadeAway.length + freeTrowsMissAway.length} (${freeTrowsMadeAway.length + freeTrowsMissAway.length > 0 ? Math.round((freeTrowsMadeAway.length / (freeTrowsMadeAway.length + freeTrowsMissAway.length)) * 100) : 0}%)`,
    twoPoints: `${twoPointsMadeAway.length} / ${twoPointsMadeAway.length + twoPointsMissAway.length} (${twoPointsMadeAway.length + twoPointsMissAway.length > 0 ? Math.round((twoPointsMadeAway.length / (twoPointsMadeAway.length + twoPointsMissAway.length)) * 100) : 0}%)`,
    threePoints: `${threePointsMadeAway.length} / ${threePointsMadeAway.length + threePointsMissAway.length} (${threePointsMadeAway.length + threePointsMissAway.length > 0 ? Math.round((threePointsMadeAway.length / (threePointsMadeAway.length + threePointsMissAway.length)) * 100) : 0}%)`,
    assistsText: `${assistsAway.length}`,
    freeThrowsShort: `${freeTrowsMadeAway.length} / ${freeTrowsMadeAway.length + freeTrowsMissAway.length}`,
    twoPointsShort: `${twoPointsMadeAway.length} / ${twoPointsMadeAway.length + twoPointsMissAway.length}`,
    threePointsShort: `${threePointsMadeAway.length} / ${threePointsMadeAway.length + threePointsMissAway.length}`,
    shots: shotsAway,
    assists: assistsAway,
    rebounds: reboundsAway,
    steals: stealsAway,
    turnovers: turnoversAway,
    blocks: blocksAway,
    fouls: foulsAway,
    stealsText: `${stealsAway.length}`,
    turnoversText: `${turnoversAway.length}`,
    blocksText: `${blocksAway.length}`,
    offreboundsText: `${offreboundsAway.length}`,
    defreboundsText: `${defreboundsAway.length}`,
    foulsText: `${fouls.filter((log) => awayPlayersId?.includes(log.playerId)).length}`,
    points: `${awayScore}`,
  }

  const GamePlayers = game?.homePlayers ? [...game?.homePlayers, ...game?.awayPlayers].sort((a, b) => {
    if (a.shirtNumber < b.shirtNumber) return -1;
    if (a.shirtNumber > b.shirtNumber) return 1;
    return 0;
  }) : null;
  const GamePlayersStats = GamePlayers?.map((pl) => {
    const playerFreeThrowsMade = freeThrowsMade.filter((log) => log.playerId === pl.playerId);
    const playerFreeThrowsMiss = freeThrowsMiss.filter((log) => log.playerId === pl.playerId);
    const playerTwoPointsMade = twoPointsMade.filter((log) => log.playerId === pl.playerId);
    const playerTwoPointsMiss = twoPointsMiss.filter((log) => log.playerId === pl.playerId);
    const playerThreePointsMade = threePointsMade.filter((log) => log.playerId === pl.playerId);
    const playerThreePointsMiss = threePointsMiss.filter((log) => log.playerId === pl.playerId);
    const playerShots = shots.filter((log) => log.playerId === pl.playerId);
    const playerAssists = assists.filter((log) => log.playerId === pl.playerId);
    const playerSteals = steals.filter((log) => log.playerId === pl.playerId);
    const playerTurnovers = turnovers.filter((log) => log.playerId === pl.playerId);
    const playerBlocks = blocks.filter((log) => log.playerId === pl.playerId);
    const playerOffRebounds = offrebounds.filter((log) => log.playerId === pl.playerId);
    const playerDefRebounds = defrebounds.filter((log) => log.playerId === pl.playerId);
    const playerRebounds = rebounds.filter((log) => log.playerId === pl.playerId);
    const playerFouls = fouls.filter((log) => log.playerId === pl.playerId);
    return {
      ...pl,
      points: playerFreeThrowsMade.length + playerTwoPointsMade.length * 2 + playerThreePointsMade.length * 3,
      foulsText: `${playerFouls.length}`,
      freeThrows: `${playerFreeThrowsMade.length} / ${playerFreeThrowsMade.length + playerFreeThrowsMiss.length} (${playerFreeThrowsMade.length + playerFreeThrowsMiss.length > 0 ? Math.round((playerFreeThrowsMade.length / (playerFreeThrowsMade.length + playerFreeThrowsMiss.length)) * 100) : 0}%)`,
      twoPoints: `${playerTwoPointsMade.length} / ${playerTwoPointsMade.length + playerTwoPointsMiss.length} (${playerTwoPointsMade.length + playerTwoPointsMiss.length > 0 ? Math.round((playerTwoPointsMade.length / (playerTwoPointsMade.length + playerTwoPointsMiss.length)) * 100) : 0}%)`,
      threePoints: `${playerThreePointsMade.length} / ${playerThreePointsMade.length + playerThreePointsMiss.length} (${playerThreePointsMade.length + playerThreePointsMiss.length > 0 ? Math.round((playerThreePointsMade.length / (playerThreePointsMade.length + playerThreePointsMiss.length)) * 100) : 0}%)`,
      freeThrowsShort: `${playerFreeThrowsMade.length} / ${playerFreeThrowsMade.length + playerFreeThrowsMiss.length}`,
      twoPointsShort: `${playerTwoPointsMade.length} / ${playerTwoPointsMade.length + playerTwoPointsMiss.length}`,
      threePointsShort: `${playerThreePointsMade.length} / ${playerThreePointsMade.length + playerThreePointsMiss.length}`,
      fouls: playerFouls,
      shots: playerShots,
      assists: playerAssists,
      steals: playerSteals,
      turnovers: playerTurnovers,
      blocks: playerBlocks,
      offrebounds: playerOffRebounds,
      defrebounds: playerDefRebounds,
      rebounds: playerRebounds,
      assistsText: `${playerAssists.length}`,
      stealsText: `${playerSteals.length}`,
      turnoversText: `${playerTurnovers.length}`,
      blocksText: `${playerBlocks.length}`,
      offreboundsText: `${playerOffRebounds.length}`,
      defreboundsText: `${playerDefRebounds.length}`,
      reboundsText: `${playerRebounds.length}`,
    }
  });

  const PlayerClicked = ((plId: string) => {
    setSelectedPlayer(plId)
  });

  const TeamClicked = (() => {
    setSelectedPlayer(undefined)
  });

  const TeamStats = (selectedTeam === "h" ? HomeStats : AwayStats);

  const selectedPlayerStats = (selectedPlayer !== undefined) ? GamePlayersStats?.find(stat => stat.playerId === selectedPlayer) : TeamStats;

  const [originXStats, setOriginXStats] = useState<number>(0);
  const [originYStats, setOriginYStats] = useState<number>(0);
  const [scaleStats, setScaleStats] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isNarrowScreen = useMediaQuery({ maxWidth: 1024 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawCourt({ ctx, canvas, setOriginX: setOriginXStats, setOriginY: setOriginYStats, setScale: setScaleStats });
    
    switch (selectedAction) {
      case 'sh': {
        selectedPlayerStats?.shots.map(sh => {
          const cl = (sh.actionId === '3' || sh.actionId === '5') ? 'green' : 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: sh.positionX, shotY: sh.positionY, color: cl });
        });
        break;
      };
      case 'reb': {
        selectedPlayerStats?.rebounds.map(reb => {
          const cl = (reb.actionId === '11') ? 'green' : 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: reb.positionX, shotY: reb.positionY, color: cl })
        });
        break;
      };
      case 'ass': {
        selectedPlayerStats?.assists.map(ass => {
          const cl = 'green';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: ass.positionX, shotY: ass.positionY, color: cl });
        });
        break;
      };
      case 'st': {
        selectedPlayerStats?.steals.map(st => {
          const cl = 'green';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: st.positionX, shotY: st.positionY, color: cl });
        });
        break;
      };
      case 'to': {
        selectedPlayerStats?.turnovers.map(to => {
          const cl = 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: to.positionX, shotY: to.positionY, color: cl });
        });
        break;
      };
      case 'fls': {
        selectedPlayerStats?.fouls.map(fl => {
          const cl = 'red';
          drawAction({ ctx, originX: originXStats, originY: originYStats, scale: scaleStats, shotX: fl.positionX, shotY: fl.positionY, color: cl });
        });
        break;
      };
    };

  }, [isOpen, game, selectedPlayer, selectedAction, selectedTeam]);

  if (!isOpen) return null;

  return (
    <div>
      <div className="modal scout-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
        <div className="modal-backdrop" onClick={onClose} />
        <div className="modal-content">
          <header className="modal-header">
            <div className='header-blank'></div>
            <div className='header-team'>{Home}</div>
            <div className="header-score">{homeScore} - {awayScore}
            </div>
            <div className='header-team'>{Away}</div>
            <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
          </header>
          <div className="modal-body">
            {isLoadingGame ? (
              <p>Loading game...</p>
            ) : isGameError ? (
              <p>Could not load team</p>
            ) : (
              <div className={`stats-container ${isNarrowScreen ? 'column': 'row'}`}>
                <div className='statsteam-detail'>
                  <div className='stats-team-switch-container'>
                    {TEAMS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTeam(t.id)}
                        className={`btn ${selectedTeam === t.id ? 'selected' : ''}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <div className='stats-details'>
                    <div className="stats-detail-container">
                      <div className="stats-detail XS"></div>
                      <div className="stats-detail L"></div>
                      <div className="stats-detail">1P</div>
                      <div className="stats-detail">2P</div>
                      <div className="stats-detail">3P</div>
                      <div className="stats-detail XS">ASS</div>
                      <div className="stats-detail XS">ST</div>
                      <div className="stats-detail XS">TO</div>
                      <div className="stats-detail XS">DR</div>
                      <div className="stats-detail XS">OR</div>
                      <div className="stats-detail XS">BS</div>
                      <div className="stats-detail XS">Fls</div>
                      <div className="stats-detail XS">Pts</div>
                    </div>
                    {GamePlayersStats?.map((pl) => {
                      const isTeam = (selectedTeam === "h" ? pl.homeTeam : !pl.homeTeam);
                      return isTeam &&
                        <div className={`stats-detail-container ${selectedPlayer === pl.playerId ? 'selected' : ''}`} onClick={() => PlayerClicked(pl.playerId)}>
                          <div className="stats-detail XS">{pl.shirtNumber}</div>
                          <div className="stats-detail L">{players?.find((p) => p.id === pl.playerId)?.firstName}</div>
                          <div className="stats-detail">{pl.freeThrowsShort}</div>
                          <div className="stats-detail">{pl.twoPointsShort}</div>
                          <div className="stats-detail">{pl.threePointsShort}</div>
                          <div className="stats-detail XS">{pl.assistsText}</div>
                          <div className="stats-detail XS">{pl.stealsText}</div>
                          <div className="stats-detail XS">{pl.turnoversText}</div>
                          <div className="stats-detail XS">{pl.defreboundsText}</div>
                          <div className="stats-detail XS">{pl.offreboundsText}</div>
                          <div className="stats-detail XS">{pl.blocksText}</div>
                          <div className="stats-detail XS">{pl.foulsText}</div>
                          <div className="stats-detail XS">{pl.points}</div>
                        </div>
                    })}
                    <div className="stats-team-container" onClick={() => TeamClicked()}>
                      <div className="stats-detail XS bold"></div>
                      <div className="stats-detail L bold"></div>
                      <div className="stats-detail bold">{TeamStats.freeThrowsShort}</div>
                      <div className="stats-detail bold">{TeamStats.twoPointsShort}</div>
                      <div className="stats-detail bold">{TeamStats.threePointsShort}</div>
                      <div className="stats-detail XS bold">{TeamStats.assistsText}</div>
                      <div className="stats-detail XS bold">{TeamStats.stealsText}</div>
                      <div className="stats-detail XS bold">{TeamStats.turnoversText}</div>
                      <div className="stats-detail XS bold">{TeamStats.defreboundsText}</div>
                      <div className="stats-detail XS bold">{TeamStats.offreboundsText}</div>
                      <div className="stats-detail XS bold">{TeamStats.blocksText}</div>
                      <div className="stats-detail XS bold">{TeamStats.foulsText}</div>
                      <div className="stats-detail XS bold">{TeamStats.points}</div>
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
