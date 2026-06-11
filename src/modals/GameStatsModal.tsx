//import { useState } from 'react';
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

  const homePlayersId = game?.homePlayers.map ((player) => (player.playerId));
  const awayPlayersId = game?.awayPlayers.map ((player) => (player.playerId));
  const gameActions = logs?.filter((log) => log.gameId === id);
  const freeThrowsMade = gameActions?.filter((log) => log.actionId === "1") || [];
  const freeThrowsMiss = gameActions?.filter((log) => log.actionId === "2") || [];
  const twoPointsMade = gameActions?.filter((log) => log.actionId === "3") || [];
  const twoPointsMiss = gameActions?.filter((log) => log.actionId === "4") || [];
  const threePointsMade = gameActions?.filter((log) => log.actionId === "5") || [];
  const threePointsMiss = gameActions?.filter((log) => log.actionId === "6") || [];
  const homeFreeThrowsMade = freeThrowsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayFreeThrowsMade = freeThrowsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeTwoPoints = twoPointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayTwoPoints = twoPointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeThreePoints = threePointsMade.filter((log) => homePlayersId?.includes(log.playerId));
  const awayThreePoints = threePointsMade.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeScore = homeFreeThrowsMade.length + homeTwoPoints?.length * 2 + homeThreePoints?.length * 3;
  const awayScore = awayFreeThrowsMade.length + awayTwoPoints?.length * 2 + awayThreePoints?.length * 3;
  const Fouls = gameActions?.filter((log) => (Number(log.actionId) > 12) && (Number(log.actionId) < 21)) || [];

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
    const playerFouls = Fouls.filter((log) => log.playerId === pl.playerId);
    return {
      ...pl,
      points: playerFreeThrowsMade.length + playerTwoPointsMade.length * 2 + playerThreePointsMade.length * 3,
      fouls: playerFouls.length,
      freeThrows: `${playerFreeThrowsMade.length} / ${playerFreeThrowsMade.length + playerFreeThrowsMiss.length} (${playerFreeThrowsMade.length + playerFreeThrowsMiss.length > 0 ? Math.round((playerFreeThrowsMade.length / (playerFreeThrowsMade.length + playerFreeThrowsMiss.length)) * 100) : 0}%)`,
      twoPoints: `${playerTwoPointsMade.length} / ${playerTwoPointsMade.length + playerTwoPointsMiss.length} (${playerTwoPointsMade.length + playerTwoPointsMiss.length > 0 ? Math.round((playerTwoPointsMade.length / (playerTwoPointsMade.length + playerTwoPointsMiss.length)) * 100) : 0}%)`,
      threePoints: `${playerThreePointsMade.length} / ${playerThreePointsMade.length + playerThreePointsMiss.length} (${playerThreePointsMade.length + playerThreePointsMiss.length > 0 ? Math.round((playerThreePointsMade.length / (playerThreePointsMade.length + playerThreePointsMiss.length)) * 100) : 0}%)`,
    }
  });
    
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
                <div className='court-container'>
                  <div className='court-stats-details'>
                    <div className="stats-detail-container">
                      <div className="stats-detail"></div>
                      <div className="stats-detail"></div>
                      <div className="stats-detail">FT (M/A) %</div>
                      <div className="stats-detail">2P (M/A) %</div>
                      <div className="stats-detail">3P (M/A) %</div>
                      <div className="stats-detail">Fouls</div>
                      <div className="stats-detail">Pts</div>
                    </div>
                    {GamePlayersStats?.map((pl) => {
                      const isHome = (pl.homeTeam);
                      return isHome &&
                      <div className="stats-detail-container">
                        <div className="stats-detail">{pl.shirtNumber}</div>
                        <div className="stats-detail">{players?.find((p) => p.id === pl.playerId)?.firstName} {players?.find((p) => p.id === pl.playerId)?.lastName}</div>
                        <div className="stats-detail">{pl.freeThrows}</div>
                        <div className="stats-detail">{pl.twoPoints}</div>
                        <div className="stats-detail">{pl.threePoints}</div>
                        <div className="stats-detail">{pl.fouls}</div>
                        <div className="stats-detail">{pl.points}</div>
                      </div>  
                  })}
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
