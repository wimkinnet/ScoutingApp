import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { useAddLogMutation, useDeleteLogMutation, useGetActionsQuery } from '../services/ScoutingApi';
import type { ModalProps } from '../app/types';
import  { drawCourt } from '../utils/drawCourt';
import { secondsPlayed } from '../utils/playingTime';
import { 
  useGetGameByIdQuery,
  useGetPlayersQuery,
  useGetClubsQuery,
  useGetTeamsQuery,
  useGetLogsQuery,
 } from '../services/ScoutingApi';
import Timer from '../features/timer/timer';
import './ScoutModal.css'
import '../styles/index.css'
import '../styles/_tokens.css'
import type { GamePlayer } from '../app/types';
import ActionPopover from './ActionPopover';
import { possessionAfter } from '../utils/actionLogic';
import type { Side } from '../utils/actionLogic';

export default function ScoutModal({ isOpen, onClose }: ModalProps) {
  const { id } = useSelector((s: RootState) => s.ui.scoutModal);

  const { data: game, isLoading: isLoadingGame, isError: isGameError } = useGetGameByIdQuery(id ?? '', {
    skip: !isOpen || !id,
  });
  
  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });
  const { data: players } = useGetPlayersQuery(undefined, { skip: !isOpen });
  const { data: teams } = useGetTeamsQuery(undefined, { skip: !isOpen });
  const { data: logs } = useGetLogsQuery(undefined, {skip: !isOpen});
  const { data: actions } = useGetActionsQuery(undefined, { skip: !isOpen });

  const [addLog] = useAddLogMutation();
  const [deleteLog] = useDeleteLogMutation();
  
  const ht = teams?.find((t) => (t.id === game?.homeTeamId))
  const at = teams?.find((t) => (t.id === game?.awayTeamId))
  
  const HomeClub = clubs?.find((cl) => (cl.id === ht?.clubId));
  const AwayClub = clubs?.find((cl) => (cl.id === at?.clubId));
  const Home = `${HomeClub?.name}`;
  const Away = `${AwayClub?.name}`;

  // Open action popover: where and when the court was clicked, and the player picked beforehand (if any)
  const [popover, setPopover] = useState<{
    anchor: { x: number; y: number }; posX: number; posY: number; quarter: number; secRem: number; player?: GamePlayer;
  } | null>(null);
  
  const [benchPlayersHome, setBenchPlayersHome] = useState<GamePlayer[]>([]);
  const [courtPlayersHome, setCourtPlayersHome] = useState<GamePlayer[]>([])

  const [benchPlayersAway, setBenchPlayersAway] = useState<GamePlayer[]>([]);
  const [courtPlayersAway, setCourtPlayersAway] = useState<GamePlayer[]>([]);

  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>();

  const [originX, setOriginX] = useState<number | null>(null);
  const [originY, setOriginY] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(600);

  const quarters: number[] = [1,2,3,4,5];
  const possessions = [Home,Away]
  const directions = ["Left", "Right"];
  
  const [x, setX] = useState<number | undefined>(undefined);
  const [y, setY] = useState<number | undefined>(undefined);
  
  const [quarter, setQuarter] = useState<number>(1);
  const [possession, setPossession] = useState<string | null>("");
  const [posHomeAway, setPosHomeAway] = useState<string>("");
  const [awayDir, setAwayDir] = useState<string>("");

  const [playerInSelected, setPlayerInSelected] = useState<GamePlayer>()

  const homePlayersId = game?.homePlayers.map ((player) => (player.playerId));
  const awayPlayersId = game?.awayPlayers.map ((player) => (player.playerId));
  const gameActions = logs?.filter((log) => log.gameId === id);
  const lastLog = gameActions?.slice().sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).at(0);
  const lastLogPlayer = players?.find((player) => player.id === lastLog?.playerId);
  const lastLogAction = actions?.find((action) => action.id === lastLog?.actionId);
  const freeThrows = gameActions?.filter((log) => log.actionId === "1") || [];
  const twoPoints = gameActions?.filter((log) => log.actionId === "3") || [];
  const threePoints = gameActions?.filter((log) => log.actionId === "5") || [];
  const homeFreeThrows = freeThrows.filter((log) => homePlayersId?.includes(log.playerId));
  const awayFreeThrows = freeThrows.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeTwoPoints = twoPoints.filter((log) => homePlayersId?.includes(log.playerId));
  const awayTwoPoints = twoPoints.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeThreePoints = threePoints.filter((log) => homePlayersId?.includes(log.playerId));
  const awayThreePoints = threePoints.filter((log) => awayPlayersId?.includes(log.playerId));
  const homeScore = homeFreeThrows.length + homeTwoPoints?.length * 2 + homeThreePoints?.length * 3;
  const awayScore = awayFreeThrows.length + awayTwoPoints?.length * 2 + awayThreePoints?.length * 3;
  const Fouls = gameActions?.filter((log) => (Number(log.actionId) > 12) && (Number(log.actionId) < 21)) || [];

  const GamePlayers = game?.homePlayers ? [...game?.homePlayers, ...game?.awayPlayers].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
        }) : null;
  const GamePlayersScores  = GamePlayers?.map((pl) => {
    const playerFreeThrows = freeThrows.filter((log) => log.playerId === pl.playerId);
    const playerTwoPoints = twoPoints.filter((log) => log.playerId === pl.playerId);
    const playerThreePoints = threePoints.filter((log) => log.playerId === pl.playerId);
    const playerFouls = Fouls.filter((log) => log.playerId === pl.playerId);
    const seconds = secondsPlayed(gameActions ?? [], pl.playerId, quarter, secondsLeft);
    return {
      ...pl,
      points: playerFreeThrows.length + playerTwoPoints.length * 2 + playerThreePoints.length * 3,
      fouls: playerFouls.length,
      minutes: Math.floor(seconds / 60),
      seconds: seconds % 60,
    }
  });
  
  useEffect(() => {
    if (!isOpen) return;
    setBenchPlayersHome(game?.homePlayers ?? []);
    setCourtPlayersHome([]);
    setBenchPlayersAway(game?.awayPlayers ?? []);
    setCourtPlayersAway([]);
    setPossession(Home);
    setPosHomeAway("Home");
  }, [isOpen, game]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawCourt({ctx, canvas, setOriginX, setOriginY, setScale, shotX: x, shotY: y})
  },[isOpen, game, x, y]);

  window.addEventListener('resize', () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    drawCourt({ctx, canvas, setOriginX, setOriginY, setScale, shotX: x, shotY: y})
  });

  const playerAction = async (pl: GamePlayer, action: string) => {

    if (!game?.id) {
      console.error('Action aborted: game.id is undefined');
      return;
    }

    const payload = {
      gameId: game.id,
      actionId: action,
      playerId: pl.playerId,
      positionX: 0,
      positionY: 0,
      quarter: quarter,
      secRem: secondsLeft,
    };
    try {
      await addLog(payload as any).unwrap();
    } catch (err: any) {
      alert(err?.message || 'Could not save action');
    };
  }
  
  const HomeBenchClick = (e: any) => {
    const shirt = e.target.id;
    const playerIn = benchPlayersHome.find((pl) => pl.shirtNumber === Number(shirt))

    if (playerIn && (courtPlayersHome.length === 5)) {
      if (!selectedPlayer) {
        (playerIn !== playerInSelected) ? setPlayerInSelected(playerIn) : setPlayerInSelected(undefined)
      } else if (courtPlayersHome.includes(selectedPlayer)) {
        setCourtPlayersHome(prevItems => {
          const filtered = prevItems.filter(pl => pl !== selectedPlayer);
          return [...filtered, playerIn].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
          });
        });
        setBenchPlayersHome(prevItems => {
          const filtered = prevItems.filter(pl => pl !== playerIn);
          return [...filtered, selectedPlayer].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
          });
        });
        playerAction(playerIn, '21');
        playerAction(selectedPlayer, '22')
        setSelectedPlayer(undefined);
        setPlayerInSelected(undefined);
      };
    };

    if (playerIn && (courtPlayersHome.length < 5) && !(courtPlayersHome.includes(playerIn))) {
      setCourtPlayersHome([...courtPlayersHome, playerIn].sort((a,b) => {
        if (a.shirtNumber < b.shirtNumber) return -1;
        if (a.shirtNumber > b.shirtNumber) return 1;
        return 0;
      }));
      setBenchPlayersHome(benchPlayersHome.filter((player) => player !== playerIn).sort((a,b) => {
        if (a.shirtNumber < b.shirtNumber) return -1;
        if (a.shirtNumber > b.shirtNumber) return 1;
        return 0;
      }));
      playerAction(playerIn, '21');
    };

    setX(undefined);
    setY(undefined);
  }

  const AwayBenchClick = (e: any) => {
    const shirt = e.target.id;
    const playerIn = benchPlayersAway.find((pl) => pl.shirtNumber === Number(shirt))

    if (playerIn && (courtPlayersAway.length === 5)) {
      if (!selectedPlayer) {
        (playerIn !== playerInSelected) ? setPlayerInSelected(playerIn) : setPlayerInSelected(undefined)
      } else if (courtPlayersAway.includes(selectedPlayer)) {
        setCourtPlayersAway(prevItems => {
          const filtered = prevItems.filter(pl => pl !== selectedPlayer);
          return [...filtered, playerIn].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
          });
        });
        setBenchPlayersAway(prevItems => {
          const filtered = prevItems.filter(pl => pl !== playerIn);
          return [...filtered, selectedPlayer].sort((a,b) => {
            if (a.shirtNumber < b.shirtNumber) return -1;
            if (a.shirtNumber > b.shirtNumber) return 1;
            return 0;
          });
        });
        playerAction(playerIn, '21');
        playerAction(selectedPlayer, '22')
        setSelectedPlayer(undefined);
        setPlayerInSelected(undefined);
      };
    };
    
    if (playerIn && (courtPlayersAway.length < 5) && !(courtPlayersAway.includes(playerIn))) {
      setCourtPlayersAway([...courtPlayersAway, playerIn].sort((a,b) => {
        if (a.shirtNumber < b.shirtNumber) return -1;
        if (a.shirtNumber > b.shirtNumber) return 1;
        return 0;
      }));
      setBenchPlayersAway(benchPlayersAway.filter((player) => player !== playerIn).sort((a,b) => {
        if (a.shirtNumber < b.shirtNumber) return -1;
        if (a.shirtNumber > b.shirtNumber) return 1;
        return 0;
      }));
      playerAction(playerIn, '21');
    };

    setX(undefined);
    setY(undefined);
  }

  const CourtPlayerClick = (e: any) => {
    const playerId = e.target.id;
    const courtPlayers = [...courtPlayersHome, ...courtPlayersAway]
    const player = courtPlayers.find((pl) => pl.playerId === playerId)

    selectedPlayer !== player ? setSelectedPlayer(player) : setSelectedPlayer(undefined);
    
    if (player && playerInSelected && game?.homePlayers.includes(player) && game?.homePlayers.includes(playerInSelected)) {
      setCourtPlayersHome(prevItems => {
        const filtered = prevItems.filter(pl => pl !== player);
        return [...filtered, playerInSelected].sort((a,b) => {
          if (a.shirtNumber < b.shirtNumber) return -1;
          if (a.shirtNumber > b.shirtNumber) return 1;
          return 0;
        });
      });
      setBenchPlayersHome(prevItems => {
        const filtered = prevItems.filter(pl => pl !== playerInSelected);
        return [...filtered, player].sort((a,b) => {
          if (a.shirtNumber < b.shirtNumber) return -1;
          if (a.shirtNumber > b.shirtNumber) return 1;
          return 0;
        });
      });
      playerAction(playerInSelected, '21');
      playerAction(player, '22')
      setSelectedPlayer(undefined);
    };

    if (player && playerInSelected && game?.awayPlayers.includes(player) && game?.awayPlayers.includes(playerInSelected)) {
      setCourtPlayersAway(prevItems => {
        const filtered = prevItems.filter(pl => pl !== player);
        return [...filtered, playerInSelected].sort((a,b) => {
          if (a.shirtNumber < b.shirtNumber) return -1;
          if (a.shirtNumber > b.shirtNumber) return 1;
          return 0;
        });
      });
      setBenchPlayersAway(prevItems => {
        const filtered = prevItems.filter(pl => pl !== playerInSelected);
        return [...filtered, player].sort((a,b) => {
          if (a.shirtNumber < b.shirtNumber) return -1;
          if (a.shirtNumber > b.shirtNumber) return 1;
          return 0;
        });
      });
      playerAction(playerInSelected, '21');
      playerAction(player, '22')
      setSelectedPlayer(undefined);
    };
    setPlayerInSelected(undefined);
    setX(undefined);
    setY(undefined);
  }

  const quarterLength = (q: number) => (q <= 4 ? 600 : 300); // overtime is 5 minutes

  const EndOfQuarterClick = async () => {
    const nextQuarter = quarter + 1;
    const onCourt = [...courtPlayersHome, ...courtPlayersAway];
    const switchesSides = quarter === 2 && (awayDir === "Left" || awayDir === "Right");
    const message = `End quarter ${quarter} and start quarter ${nextQuarter}?\n\n`
      + `This logs "Player Out" at 0:00 for the ${onCourt.length} players on court`
      + (switchesSides ? ` and switches the away direction to ${awayDir === "Left" ? "Right" : "Left"}.` : '.');
    if (!window.confirm(message)) return;

    // Logged while quarter and clock still read the ending quarter at 0:00
    await Promise.all(onCourt.map((pl) => playerAction(pl, '22')));

    const byShirt = (a: GamePlayer, b: GamePlayer) => a.shirtNumber - b.shirtNumber;
    setBenchPlayersHome((prev) => [...prev, ...courtPlayersHome].sort(byShirt));
    setBenchPlayersAway((prev) => [...prev, ...courtPlayersAway].sort(byShirt));
    setCourtPlayersHome([]);
    setCourtPlayersAway([]);
    setSelectedPlayer(undefined);
    setPlayerInSelected(undefined);

    setQuarter(nextQuarter);
    if (switchesSides) setAwayDir(awayDir === "Left" ? "Right" : "Left");
    setSecondsLeft(quarterLength(nextQuarter));
  }

  const QuarterClick = (e: any) => {
    setQuarter(Number(e.target.id));
  }

  const PossessionClick = (e: any) => {
    const clickedClub = clubs?.find((cl) => (cl.name === e.target.id));
    if (clickedClub) {
      setPossession(clickedClub.name)
    }
    game ? ((clickedClub === HomeClub) ? setPosHomeAway("Home") : setPosHomeAway("Away")) : setPosHomeAway ("");
  }

  const setPossessionSide = (side: Side) => {
    setPosHomeAway(side);
    setPossession(side === "Home" ? Home : Away);
  }

  const PossessionSwitch = () => {
    (possession === Home) ? setPossession(Away) : setPossession(Home);
    (posHomeAway === "Home") ? setPosHomeAway("Away") : setPosHomeAway("Home");
  }

  const DirectionClick = (e: any) => {
    setAwayDir(e.target.id)
  }

  const CourtClick = (e: any) => {
    const canvas = document.getElementById('court');
    const rect = canvas?.getBoundingClientRect(); // Absolute position of canvas
    // relative to top left corner of the court

    if (originX != null && originY != null && scale != null) {
      const x = rect ? (e.clientX - rect.left - originX) / scale : 0; 
      const y = rect ? (e.clientY - rect.top - originY) / scale : 0;

      if ((x > 0) && (x < 28) && (y > 0) && (y < 15)) {
        setX(x);
        setY(y);
        setPopover({ anchor: { x: e.clientX, y: e.clientY }, posX: x, posY: y, quarter, secRem: secondsLeft, player: selectedPlayer });
        setSelectedPlayer(undefined)
      } else {
        setX(undefined);
        setY(undefined);
      }
    };
  };

  useEffect(() => {
    const handleKeyDown = (event: any) => {
      if (event.repeat) return;
      (event.key === 'p') ? PossessionSwitch() : null;
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  const onClosePopover = useCallback(() => {
    setPopover(null);
    setX(undefined);
    setY(undefined);
  }, []);

  // Who has the ball next follows from the action that was just logged
  const onActionLogged = (actionId: string, pl: GamePlayer) => {
    const next = possessionAfter(actionId, pl.homeTeam);
    if (next) setPossessionSide(next);
  }
    
  if (!isOpen) return null;

  return (
    <div>
      <div className="scout-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
        <div className="scout-modal-backdrop" onClick={onClose} />
        <div className="scout-modal-content">
          <header className="scout-modal-header">
            <div className='scout-modal-header-blank'></div>
            <div className='scout-modal-header-team'>{Home}</div>
            <div className="scout-modal-header-score">{homeScore} - {awayScore}
            </div>
            <div className='scout-modal-header-team'>{Away}</div>
            <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
          </header>
          <div className="scout-modal-body">
            {isLoadingGame ? (
              <p>Loading game...</p>
            ) : isGameError ? (
              <p>Could not load team</p>
            ) : (
              <div>
                <div className='scout-modal-info-container'>
                  <div className='scout-modal-team-players-left'>
                    {benchPlayersHome.map((pl) => {
                      const isSelected = (playerInSelected === pl);
                      const player = players?.find((p) => p.id === pl.playerId);
                      return isSelected ? (
                        <div className='scout-modal-team-player selected' id={pl.shirtNumber.toString()} onClick={(e) => HomeBenchClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      ) : (
                        <div className='scout-modal-team-player' id={pl.shirtNumber.toString()} onClick={(e) => HomeBenchClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='scout-modal-possession-selector'>
                    <div className='scout-modal-possession-header'>Ball possession</div>
                    <div className='scout-modal-possession-container'>
                      {possessions.map((pos) => {
                        const isSelected = (possession === pos);
                        return isSelected ? (
                          <div className='scout-modal-possession selected'>{pos}</div>
                        ) : (
                          <div className='scout-modal-possession' id={pos} onClick={(e) => PossessionClick(e)}>{pos}</div>
                        )
                      })}
                    </div>
                  </div>
                  <div className="timer">
                    <Timer secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} />
                  </div>
                  <div className='scout-modal-quarter-direction'>
                    <div className='scout-modal-quarter-header'>Current quarter</div>
                    <div className='scout-modal-quarter-container'>
                      {quarters.map((q) => {
                        const isSelected = (quarter === q);
                        return isSelected ? (
                          <div className='scout-modal-quarter selected'>{q}</div>
                        ) : (
                          <div className='scout-modal-quarter' id={q.toLocaleString()} onClick={(e) => QuarterClick(e)}>{q}</div>
                        )
                      })}
                    </div>
                    {secondsLeft === 0 && quarter < quarters.length && (
                      <button className='btn scout-modal-end-quarter' onClick={() => EndOfQuarterClick()}>
                        End of quarter {quarter}
                      </button>
                    )}
                    <div className='scout-modal-direction-header'>Away direction</div>
                    <div className='scout-modal-direction-container'>
                      {directions.map((dir) => {
                      const isSelected = (awayDir === dir);
                      return isSelected ? (
                        <div className='scout-modal-direction selected'>{dir}</div>
                      ) : (
                        <div className='scout-modal-direction' id={dir} onClick={(e) => DirectionClick(e)}>{dir}</div>
                      )
                      })}
                    </div>
                  </div>
                  <div className='scout-modal-team-players-right'>
                    {benchPlayersAway.map((pl) => {
                      const isSelected = (playerInSelected === pl);
                      const player = players?.find((p) => p.id === pl.playerId);
                      return isSelected ? (
                        <div className='scout-modal-team-player selected' id={pl.shirtNumber.toString()} onClick={(e) => AwayBenchClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip right'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      ) : (
                        <div className='scout-modal-team-player' id={pl.shirtNumber.toString()} onClick={(e) => AwayBenchClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip right'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      )
                    })}
                    </div>
                </div>       
                <div className='scout-modal-last-action-container'>
                  <div className='scout-modal-last-action-label'>
                    Last action: 
                  </div>
                  <div className='scout-modal-last-action'>
                    {lastLog ? (
                      <>
                        {lastLogPlayer?.firstName} {lastLogPlayer?.lastName} - {lastLogAction?.name || lastLogAction?.label || lastLog.actionId}
                        
                      </>
                    ) : 'None'}
                  </div>
                  {lastLog && (
                    <div className='scout-modal-last-action-button' onClick={() => deleteLog(lastLog.id)}>
                      Undo
                    </div>
                  )}
                </div>
                <div className='scout-modal-court-container'>
                  <div className='scout-modal-court-players-details'>
                    <div className="scout-modal-player-detail-container">
                      <div className="scout-modal-player-detail">#</div>
                      <div className="scout-modal-player-detail">Fouls</div>
                      <div className="scout-modal-player-detail">Pts</div>
                      <div className="scout-modal-player-detail">Time</div>
                    </div>
                    {GamePlayersScores?.map((pl) => {
                      const isHome = (pl.homeTeam);
                      return isHome &&
                      <div className="scout-modal-player-detail-container">
                        <div className="scout-modal-player-detail">{pl.shirtNumber}</div>
                        <div className="scout-modal-player-detail">{pl.fouls}</div>
                        <div className="scout-modal-player-detail">{pl.points}</div>
                        <div className="scout-modal-player-detail">{pl.minutes}:{pl.seconds.toString().padStart(2, '0')}</div>
                      </div>  
                  })}
                  </div>
                  <div className='scout-modal-court-space-blank'>
                  </div>
                  <div className='scout-modal-court-players'>
                    {courtPlayersHome.map((pl) => {
                      const isSelected = (selectedPlayer === pl);
                      const player = players?.find((p) => p.id === pl.playerId);
                      return isSelected ? (
                        <div className='scout-modal-court-player selected' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      ) : (
                        <div className='scout-modal-court-player' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <canvas id='court' ref={canvasRef} onClick={(e) => CourtClick(e)}/>
                  
                  <div className='scout-modal-court-players'>
                    {courtPlayersAway.map((pl) => {
                      const isSelected = (selectedPlayer === pl);
                      const player = players?.find((p) => p.id === pl.playerId);
                      return isSelected ? (
                        <div className='scout-modal-court-player selected' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip right'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      ) : (
                        <div className='scout-modal-court-player' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                          <span className='scout-modal-player-tooltip right'>{player?.firstName} {player?.lastName}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className='scout-modal-court-space-blank'>
                  </div>
                  <div className='scout-modal-court-players-details'>
                    <div className="scout-modal-player-detail-container">
                      <div className="scout-modal-player-detail">Time</div>
                      <div className="scout-modal-player-detail">Pts</div>
                      <div className="scout-modal-player-detail">Fouls</div>
                      <div className="scout-modal-player-detail">#</div>
                    </div>
                    {GamePlayersScores?.map((pl) => {
                      const isHome = (pl.homeTeam);
                      return !isHome &&
                      <div className="scout-modal-player-detail-container">
                        <div className="scout-modal-player-detail">{pl.minutes}:{pl.seconds.toString().padStart(2, '0')}</div>
                        <div className="scout-modal-player-detail">{pl.points}</div>
                        <div className="scout-modal-player-detail">{pl.fouls}</div>
                        <div className="scout-modal-player-detail">{pl.shirtNumber}</div>
                      </div>  
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {popover && game && (
        <ActionPopover
          anchor={popover.anchor}
          posX={popover.posX}
          posY={popover.posY}
          gameId={game.id}
          quarter={popover.quarter}
          secRem={popover.secRem}
          possession={posHomeAway}
          awayDirection={awayDir}
          homeOnCourt={courtPlayersHome}
          awayOnCourt={courtPlayersAway}
          preselectedPlayer={popover.player}
          players={players}
          actions={actions}
          onLogged={onActionLogged}
          onClose={onClosePopover}
        />
      )}
    </div>
  );
}
