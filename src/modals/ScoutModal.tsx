import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { openActionModal, closeModal } from '../features/ui/uiSlice';
import Timer from '../features/timer/timer';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'
import type { GamePlayer } from '../app/types';

export default function ScoutModal() {
  const dispatch = useDispatch();
  const { isOpen, id } = useSelector((s: RootState) => s.ui.scoutModal);
  const game = useSelector((s: RootState) => (id) ? s.games.entities[id] : null);
  const teams = useSelector((s: RootState) => s.teams);
  const clubs = useSelector((s: RootState) => s.clubs);
  const players = useSelector((s: RootState) => s.players);
  
  const HomeClub: string = game ? clubs.entities[teams.entities[game.scoutTeamId].clubId].id : "";
  // const AwayClub: string = game ? clubs.entities[teams.entities[game.otherTeamId].clubId].id : "";
  const HomeTeam = game ? (game.scoutHome ? `${clubs.entities[teams.entities[game.scoutTeamId].clubId].name}` : `${clubs.entities[teams.entities[game.otherTeamId].clubId].name}`) : null;
  const AwayTeam = game ? (game.scoutHome ? `${clubs.entities[teams.entities[game.otherTeamId].clubId].name}` : `${clubs.entities[teams.entities[game.scoutTeamId].clubId].name}`) : null;
  
  const [benchPlayersHome, setBenchPlayersHome] = useState<GamePlayer[]>([]);
  const [courtPlayersHome, setCourtPlayersHome] = useState<GamePlayer[]>([])

  const [benchPlayersAway, setBenchPlayersAway] = useState<GamePlayer[]>([]);
  const [courtPlayersAway, setCourtPlayersAway] = useState<GamePlayer[]>([]);

  const [selectedPlayer, setSelectedPlayer] = useState<GamePlayer>();

  const [originX, setOriginX] = useState<number | null>(null);
  const [originY, setOriginY] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  const [x, setX] = useState<number | null>(null);
  const [y, setY] = useState<number | null>(null);

  const [secondsLeft, setSecondsLeft] = useState(600);

  const quarters: number[] = [1,2,3,4,5];
  const possessions: string[] = [HomeTeam ? HomeTeam : '', AwayTeam ? AwayTeam : '']
  
  const [quarter, setQuarter] = useState<number>(1);
  const [possession, setPossession] = useState<string>(HomeClub)

  useEffect(() => {
    if (!isOpen) return;
    setBenchPlayersHome(game?.homePlayers ?? []);
    setCourtPlayersHome([])
    setBenchPlayersAway(game?.awayPlayers ?? []);
    setCourtPlayersAway([])
  }, [isOpen, id]);

  const onClose = () => dispatch(closeModal());

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
      CentreRimFromEnd: 1.60,
      ftCircleR: 1.80,
      treePtMinSide: 0.75,
      restrictedR: 1.25,
    };

    const Equip = {
      backboardFromEnd: 1.20,
      rimFromBoard: 0.175,
      rimR: 0.225,
      boardH: 1.83,
      boardW: 0.03
    };

    const cssW = canvas ? canvas.clientWidth : 0;
    const cssH = canvas ? canvas.clientHeight : 0;
    canvas && (canvas.width = cssW ? cssW * devicePixelRatio : 0);
    canvas && (canvas.height = cssH ? cssH * devicePixelRatio : 0);
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const MarginPx = 40;
    const usableW = cssW - 2 * MarginPx;
    const usableH = cssH - 2 * MarginPx;
    const scale = Math.min(usableW / M.L, usableH / M.W);

    const origin = {
      x: (cssW - M.L * scale) / 2,
      y: (cssH - M.W * scale) / 2,
    };

    setOriginX(origin.x);
    setOriginY(origin.y);
    setScale(scale);

    const mx = (m: number) => origin.x + m * scale;
    const my = (m: number) => origin.y + m * scale;

    ctx.clearRect(0, 0, cssW, cssH);
    
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    
    // outer lines
    ctx.strokeRect(mx(0), my(0), M.L * scale, M.W * scale);

    // center line
    ctx.beginPath();
    ctx.moveTo(mx(M.L / 2), my(0));
    ctx.lineTo(mx(M.L / 2), my(M.W));
    ctx.stroke();

    // center circle
    ctx.beginPath();
    ctx.arc(mx(M.L / 2), my(M.W / 2), M.centreCircleR * scale, 0, 2 * Math.PI);
    ctx.stroke();

    // free throw lanes
    ctx.strokeRect(mx(0), my((M.W - M.LaneW) / 2), M.ftLaneFromEnd * scale, M.LaneW * scale);
    ctx.strokeRect(mx(M.L - M.ftLaneFromEnd), my((M.W - M.LaneW) / 2), M.ftLaneFromEnd * scale, M.LaneW * scale);
    
    // free throw circles
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(mx(x + dir * M.ftLaneFromEnd), my(M.W / 2), M.ftCircleR * scale, Math.PI / 2, -Math.PI / 2, x === 0);
      ctx.stroke();
    });

    // three point lines
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(mx(x), my(M.treePtMinSide));
      ctx.lineTo(mx(x + dir * M.CentreRimFromEnd), my(M.treePtMinSide));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(mx(x), my(M.W - M.treePtMinSide));
      ctx.lineTo(mx(x + dir * M.CentreRimFromEnd), my(M.W - M.treePtMinSide));
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(mx(x + dir * M.CentreRimFromEnd), my(M.W / 2), M.threePtR * scale, Math.PI / 2, -Math.PI / 2, x === 0);
      ctx.stroke();
    });

    // restricted areas
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(mx(x + dir * M.CentreRimFromEnd), my(M.W / 2), M.restrictedR * scale, Math.PI / 2, -Math.PI / 2, x === 0);
      ctx.stroke();
    });

    //backboards
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(mx(x + dir * Equip.backboardFromEnd), my((M.W - Equip.boardH) / 2));
      ctx.lineTo(mx(x + dir * Equip.backboardFromEnd), my((M.W + Equip.boardH) / 2));
      ctx.stroke();
    });

    // rims
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.arc(mx(x + dir * (Equip.backboardFromEnd + Equip.rimFromBoard + Equip.rimR)), my(M.W / 2), Equip.rimR * scale, 0, 2 * Math.PI);
      ctx.stroke();
    });

    // from board to rim line
    [0, M.L].forEach(x => {
      const dir = x === 0 ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(mx(x + dir * (Equip.backboardFromEnd + Equip.boardW)), my(M.W / 2));
      ctx.lineTo(mx(x + dir * (Equip.backboardFromEnd + Equip.rimFromBoard)), my(M.W / 2));
      ctx.stroke();
    });

    if (x && y) { 
      ctx.strokeStyle = 'rgba(215, 110, 50, 0.8)';
      ctx.beginPath();
      ctx.arc(mx(x), my(y), 0.05 * scale, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(mx(x), my(y), 0.2 * scale, 0, 2 * Math.PI);
      ctx.stroke();
    };

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

  const HomeBenchClick = (e: any) => {
    const shirt = e.target.id;
    const playerIn = benchPlayersHome.find((pl) => pl.shirtNumber === Number(shirt))

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
      }))
    };
    setX(null);
    setY(null);
  }

  const AwayBenchClick = (e: any) => {
    const shirt = e.target.id;
    const playerIn = benchPlayersAway.find((pl) => pl.shirtNumber === Number(shirt))

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
      }))
    };
    setX(null);
    setY(null);
  }

  const CourtPlayerClick = (e: any) => {
    const playerId = e.target.id;
    const courtPlayers = [...courtPlayersHome, ...courtPlayersAway]
    const player = courtPlayers.find((pl) => pl.playerId === playerId)

    selectedPlayer !== player ? setSelectedPlayer(player) : setSelectedPlayer(undefined);
    setX(null);
    setY(null);
  }

  const QuarterClick = (e: any) => {
    setQuarter(Number(e.target.id));
  }

  const PossessionClick = (e: any) => {
    const clickedClub = clubs.ids.find((cl) => clubs.entities[cl].name === e.target.id);
    if (clickedClub) {
      setPossession(clubs.entities[clickedClub].id)
    }
  }

  const CourtClick = (e: any) => {
    const canvas = document.getElementById('court');
    const rect = canvas?.getBoundingClientRect(); // Absolute position of canvas
    // relative to top left corner of the court
    if (originX && originY && scale) {
      const x = rect ? (e.clientX - rect.left - originX) / scale : 0; 
      const y = rect ? (e.clientY - rect.top - originY) / scale : 0;

      if ((x > 0) && (x < 28) && (y > 0) && (y < 15) && selectedPlayer) {
        setX(x);
        setY(y);
        const payload = {
          player: selectedPlayer,
          posX: x,
          posY: y,
        };
        dispatch(openActionModal(payload))
      } else {
        setX(null);
        setY(null);
      }
    };
  }

  if (!isOpen) return null;

  return (
    <div className="modal scout-modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <div className='header-blank'></div>
          <div className='header-team'>{HomeTeam}</div>
          <div className="header-score">0 - 0</div>
          <div className='header-team'>{AwayTeam}</div>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="modal-body">
          <div className='info-container'>
            <div className='team-players-left'>
              {benchPlayersHome.map((pl) => (
                <div className='team-player' id={pl.shirtNumber.toString()} onClick={(e) => HomeBenchClick(e)}>{pl.shirtNumber}
                  <span className='player-tooltip'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                </div>
              ))}
              <div className='team-player' >AC
                <span className='player-tooltip'>Assistent Coach</span>
              </div>
              <div className='team-player' >C
                <span className='player-tooltip'>Coach</span>
              </div>
            </div>
            <div className='possession-selector'>
              <div className='possession-header'>Ball possession</div>
              <div className='possession-container'>
                {possessions.map((pos) => {
                  const isSelected = (clubs.entities[possession].name === pos);
                  return isSelected ? (
                    <div className='possession selected'>{pos}</div>
                  ) : (
                    <div className='possession' id={pos} onClick={(e) => PossessionClick(e)}>{pos}</div>
                  )
                })}
              </div>
            </div>
            <div className="timer">
              <Timer secondsLeft={secondsLeft} setSecondsLeft={setSecondsLeft} />
            </div>
            <div className='quarter-direction'>
              <div className='quarter-header'>Current quarter</div>
              <div className='quarter-container'>
                {quarters.map((q) => {
                  const isSelected = (quarter === q);
                  return isSelected ? (
                    <div className='quarter selected'>{q}</div>
                  ) : (
                    <div className='quarter' id={q.toLocaleString()} onClick={(e) => QuarterClick(e)}>{q}</div>
                  )
                })}
              </div>
              <div className='direction-header'>Away direction</div>
              <div className='direction-container'>
                <div className='direction'></div>
              </div>
            </div>
            <div className='team-players-right'>
              <div className='team-player right' >C
                <span className='player-tooltip right'>Coach</span>
              </div>
              <div className='team-player' >AC
                <span className='player-tooltip right'>Assistent Coach</span>
              </div>
              {benchPlayersAway.map((pl) => (
                <div className='team-player' id={pl.shirtNumber.toString()} onClick={(e) => AwayBenchClick(e)}>{pl.shirtNumber}
                  <span className='player-tooltip right'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                </div>
                ))}
              </div>
          </div>       
          <div className='court-container'>
            <div className='court-players'>
              {courtPlayersHome.map((pl) => {
                const isSelected = (selectedPlayer === pl);
                return isSelected ? (
                  <div className='court-player selected' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                    <span className='player-tooltip'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                  </div>
                ) : (
                  <div className='court-player' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                    <span className='player-tooltip'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                  </div>
                )
              })}
            </div>
            <canvas id='court' ref={canvasRef} onClick={(e) => CourtClick(e)}/>
            <div className='court-players'>
              {courtPlayersAway.map((pl) => {
                const isSelected = (selectedPlayer === pl);
                return isSelected ? (
                  <div className='court-player selected' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                    <span className='player-tooltip right'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                  </div>
                ) : (
                  <div className='court-player' id={pl.playerId} onClick={(e) => CourtPlayerClick(e)}>{pl.shirtNumber}
                    <span className='player-tooltip right'>{players.entities[pl.playerId].firstName} {players.entities[pl.playerId].lastName}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
