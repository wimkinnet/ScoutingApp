import { useState } from 'react';
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
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
//import type { GamePlayer } from '../app/types';

export default function GameStatsModal({ isOpen, onClose }: ModalProps) {
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

  //const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>();
  const [selectedTeam, setSelectedTeam] = useState("Home");

  const homePlayersId = game?.homePlayers.map ((player) => (player.playerId));
  const awayPlayersId = game?.awayPlayers.map ((player) => (player.playerId));
  const gameActions = logs?.filter((log) => log.gameId === id);
  const freeThrowsMade = gameActions?.filter((log) => log.actionId === "1") || [];
  const freeThrowsMiss = gameActions?.filter((log) => log.actionId === "2") || [];
  const twoPointsMade = gameActions?.filter((log) => log.actionId === "3") || [];
  const twoPointsMiss = gameActions?.filter((log) => log.actionId === "4") || [];
  const threePointsMade = gameActions?.filter((log) => log.actionId === "5") || [];
  const threePointsMiss = gameActions?.filter((log) => log.actionId === "6") || [];
  const assists = gameActions?.filter((log) => log.actionId === "7") || [];
  const steals = gameActions?.filter((log) => log.actionId === "9") || [];
  const turnovers = gameActions?.filter((log) => log.actionId === "8") || [];
  const blocks = gameActions?.filter((log) => log.actionId === "10") || [];
  const offrebounds = gameActions?.filter((log) => log.actionId === "11") || [];
  const defrebounds = gameActions?.filter((log) => log.actionId === "12") || [];

  const homeFreeThrowsMade = freeThrowsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayFreeThrowsMade = freeThrowsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeTwoPoints = twoPointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayTwoPoints = twoPointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeThreePoints = threePointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayThreePoints = threePointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeScore = homeFreeThrowsMade.length + homeTwoPoints?.length * 2 + homeThreePoints?.length * 3;
  const awayScore = awayFreeThrowsMade.length + awayTwoPoints?.length * 2 + awayThreePoints?.length * 3;
  const Fouls = gameActions?.filter((log) => (Number(log.actionId) > 12) && (Number(log.actionId) < 21)) || [];
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
  const HomeStats = {
    freeThrows: `${freeTrowsMadeHome.length} / ${freeTrowsMadeHome.length + freeTrowsMissHome.length} (${freeTrowsMadeHome.length + freeTrowsMissHome.length > 0 ? Math.round((freeTrowsMadeHome.length / (freeTrowsMadeHome.length + freeTrowsMissHome.length)) * 100) : 0}%)`,
    twoPoints: `${twoPointsMadeHome.length} / ${twoPointsMadeHome.length + twoPointsMissHome.length} (${twoPointsMadeHome.length + twoPointsMissHome.length > 0 ? Math.round((twoPointsMadeHome.length / (twoPointsMadeHome.length + twoPointsMissHome.length)) * 100) : 0}%)`,
    threePoints: `${threePointsMadeHome.length} / ${threePointsMadeHome.length + threePointsMissHome.length} (${threePointsMadeHome.length + threePointsMissHome.length > 0 ? Math.round((threePointsMadeHome.length / (threePointsMadeHome.length + threePointsMissHome.length)) * 100) : 0}%)`,
    assists: `${assistsHome.length}`,
    steals: `${stealsHome.length}`,
    turnovers: `${turnoversHome.length}`,
    blocks: `${blocksHome.length}`,
    offrebounds: `${offreboundsHome.length}`,
    defrebounds: `${defreboundsHome.length}`,
    fouls: `${Fouls.filter((log) => homePlayersId?.includes(log.playerId)).length}`,
    points: `${homeScore}`,
  }
  const AwayStats = {
    freeThrows: `${freeTrowsMadeAway.length} / ${freeTrowsMadeAway.length + freeTrowsMissAway.length} (${freeTrowsMadeAway.length + freeTrowsMissAway.length > 0 ? Math.round((freeTrowsMadeAway.length / (freeTrowsMadeAway.length + freeTrowsMissAway.length)) * 100) : 0}%)`,
    twoPoints: `${twoPointsMadeAway.length} / ${twoPointsMadeAway.length + twoPointsMissAway.length} (${twoPointsMadeAway.length + twoPointsMissAway.length > 0 ? Math.round((twoPointsMadeAway.length / (twoPointsMadeAway.length + twoPointsMissAway.length)) * 100) : 0}%)`,
    threePoints: `${threePointsMadeAway.length} / ${threePointsMadeAway.length + threePointsMissAway.length} (${threePointsMadeAway.length + threePointsMissAway.length > 0 ? Math.round((threePointsMadeAway.length / (threePointsMadeAway.length + threePointsMissAway.length)) * 100) : 0}%)`,
    assists: `${assistsAway.length}`,
    steals: `${stealsAway.length}`,
    turnovers: `${turnoversAway.length}`,
    blocks: `${blocksAway.length}`,
    offrebounds: `${offreboundsAway.length}`,
    defrebounds: `${defreboundsAway.length}`,
    fouls: `${Fouls.filter((log) => awayPlayersId?.includes(log.playerId)).length}`,
    points: `${awayScore}`,
  }

  const GamePlayers = game?.homePlayers ? [...game?.homePlayers, ...game?.awayPlayers].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
        }) : null;
  const GamePlayersStats  = GamePlayers?.map((pl) => {
    const playerFreeThrowsMade = freeThrowsMade.filter((log) => log.playerId === pl.playerId);
    const playerFreeThrowsMiss = freeThrowsMiss.filter((log) => log.playerId === pl.playerId);
    const playerTwoPointsMade = twoPointsMade.filter((log) => log.playerId === pl.playerId);
    const playerTwoPointsMiss = twoPointsMiss.filter((log) => log.playerId === pl.playerId);
    const playerThreePointsMade = threePointsMade.filter((log) => log.playerId === pl.playerId);
    const playerThreePointsMiss = threePointsMiss.filter((log) => log.playerId === pl.playerId);
    const playerAssists = assists.filter((log) => log.playerId === pl.playerId);
    const playerSteals = steals.filter((log) => log.playerId === pl.playerId);
    const playerTurnovers = turnovers.filter((log) => log.playerId === pl.playerId);
    const playerBlocks = blocks.filter((log) => log.playerId === pl.playerId);
    const playerOffRebounds = offrebounds.filter((log) => log.playerId === pl.playerId);
    const playerDefRebounds = defrebounds.filter((log) => log.playerId === pl.playerId);
    const playerFouls = Fouls.filter((log) => log.playerId === pl.playerId);
    return {
      ...pl,
      points: playerFreeThrowsMade.length + playerTwoPointsMade.length * 2 + playerThreePointsMade.length * 3,
      fouls: playerFouls.length,
      freeThrows: `${playerFreeThrowsMade.length} / ${playerFreeThrowsMade.length + playerFreeThrowsMiss.length} (${playerFreeThrowsMade.length + playerFreeThrowsMiss.length > 0 ? Math.round((playerFreeThrowsMade.length / (playerFreeThrowsMade.length + playerFreeThrowsMiss.length)) * 100) : 0}%)`,
      twoPoints: `${playerTwoPointsMade.length} / ${playerTwoPointsMade.length + playerTwoPointsMiss.length} (${playerTwoPointsMade.length + playerTwoPointsMiss.length > 0 ? Math.round((playerTwoPointsMade.length / (playerTwoPointsMade.length + playerTwoPointsMiss.length)) * 100) : 0}%)`,
      threePoints: `${playerThreePointsMade.length} / ${playerThreePointsMade.length + playerThreePointsMiss.length} (${playerThreePointsMade.length + playerThreePointsMiss.length > 0 ? Math.round((playerThreePointsMade.length / (playerThreePointsMade.length + playerThreePointsMiss.length)) * 100) : 0}%)`,
      assists: `${playerAssists.length}`,
      steals: `${playerSteals.length}`,
      turnovers: `${playerTurnovers.length}`,
      blocks: `${playerBlocks.length}`,
      offrebounds: `${playerOffRebounds.length}`,
      defrebounds: `${playerDefRebounds.length}`,
      rebounds: `${playerOffRebounds.length + playerDefRebounds.length}`,
    }
  });

  const TeamSwitch = ((team: any) => {
    setSelectedTeam(team)
  });

  const TeamStats = (selectedTeam === "Home" ? HomeStats : AwayStats);
    
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
              <div>       
                <div className='stats-container'>
                  <div className='team-switch-container'>
                    <button className='btn' onClick = {() => TeamSwitch("Home")}>Home</button>
                    <button className='btn' onClick = {() => TeamSwitch("Away")}>Away</button>
                  </div>
                  <div className='stats-details'>
                    <div className="stats-detail-container">
                      <div className="stats-detail XS"></div>
                      <div className="stats-detail"></div>
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
                      const isTeam = (selectedTeam === "Home" ? pl.homeTeam : !pl.homeTeam);
                      return isTeam &&
                      <div className="stats-detail-container">
                        <div className="stats-detail XS">{pl.shirtNumber}</div>
                        <div className="stats-detail">{players?.find((p) => p.id === pl.playerId)?.firstName}</div>
                        <div className="stats-detail">{pl.freeThrows}</div>
                        <div className="stats-detail">{pl.twoPoints}</div>
                        <div className="stats-detail">{pl.threePoints}</div>
                        <div className="stats-detail XS">{pl.assists}</div>
                        <div className="stats-detail XS">{pl.steals}</div>
                        <div className="stats-detail XS">{pl.turnovers}</div>
                        <div className="stats-detail XS">{pl.defrebounds}</div>
                        <div className="stats-detail XS">{pl.offrebounds}</div>
                        <div className="stats-detail XS">{pl.blocks}</div>
                        <div className="stats-detail XS">{pl.fouls}</div>
                        <div className="stats-detail XS">{pl.points}</div>
                      </div>  
                    })}
                      <div className="stats-detail-container">
                        <div className="stats-detail XS"></div>
                        <div className="stats-detail bold"></div>
                        <div className="stats-detail bold">{TeamStats.freeThrows}</div>
                        <div className="stats-detail bold">{TeamStats.twoPoints}</div>
                        <div className="stats-detail bold">{TeamStats.threePoints}</div>
                        <div className="stats-detail XS bold">{TeamStats.assists}</div>
                        <div className="stats-detail XS bold">{TeamStats.steals}</div>
                        <div className="stats-detail XS bold">{TeamStats.turnovers}</div>
                        <div className="stats-detail XS bold">{TeamStats.defrebounds}</div>
                        <div className="stats-detail XS bold">{TeamStats.offrebounds}</div>
                        <div className="stats-detail XS bold">{TeamStats.blocks}</div>
                        <div className="stats-detail XS bold">{TeamStats.fouls}</div>
                        <div className="stats-detail XS bold">{TeamStats.points}</div>
                      </div> 
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
