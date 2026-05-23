import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { addGame, updateGame } from '../features/games/gamesSlice';
import { closeModal } from '../features/ui/uiSlice';
import type { GamePlayer } from '../app/types';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function GameModal() {
  const dispatch = useDispatch();
  const { isOpen, mode, id } = useSelector((s: RootState) => s.ui.gameModal);
  const game = useSelector((s: RootState) => (mode === 'edit' && id) ? s.games.entities[id] : null);
  const teams = useSelector((s: RootState) => s.teams);
  const seasons = useSelector((s: RootState) => s.seasons);
  const clubs = useSelector((s: RootState) => s.clubs);
  const players = useSelector((s: RootState) => s.players);
  const [homeTeamId, setHomeTeamId] = useState(game?.homeTeamId ?? '');
  const [awayTeamId, setAwayTeamId] = useState(game?.awayTeamId ?? '');
  const [homeClubId, setHomeClubId] = useState(game ? teams.entities[game.homeTeamId].clubId : '');
  const [awayClubId, setAwayClubId] = useState(game ? teams.entities[game.awayTeamId].clubId : '');
  const [date, setDate] = useState(game?.date ?? undefined);
  const [seasonId, setSeasonId] = useState(game ? teams.entities[game.homeTeamId].seasonId : '');
  const [homeTeamVisible, setHomeTeamVisible] = useState(false);
  const [awayTeamVisible, setAwayTeamVisible] = useState(false);
  const [homeClubVisible, setHomeClubVisible] = useState(false);
  const [awayClubVisible, setAwayClubVisible] = useState(false);
  const [homeAvailableSelection, setHomeAvailableSelection] = useState<string[]>([]);
  const [homeSelectedSelection, setHomeSelectedSelection] = useState<string[]>([]);
  const [homeShirtNumbers, setHomeShirtNumbers] = useState<{ [playerId: string]: number }>({});
  const [awayAvailableSelection, setAwayAvailableSelection] = useState<string[]>([]);
  const [awaySelectedSelection, setAwaySelectedSelection] = useState<string[]>([]);
  const [awayShirtNumbers, setAwayShirtNumbers] = useState<{ [playerId: string]: number }>({});

  useEffect(() => {
    if (!isOpen) return;
    setHomeTeamId(game?.homeTeamId ?? '');
    setAwayTeamId(game?.awayTeamId ?? '');
    setDate(game?.date ?? undefined);
    setSeasonId(game ? teams.entities[game.homeTeamId].seasonId : '');
    setHomeClubId(game ? teams.entities[game.homeTeamId].clubId : '');
    setAwayClubId(game ? teams.entities[game.awayTeamId].clubId : '');
    setHomeSelectedSelection(game?.homePlayers?.map(sp => sp.playerId) ?? []);
    setHomeAvailableSelection(game ? teams.entities[game.homeTeamId].playerIds : []);
    setHomeShirtNumbers(game?.homePlayers?.reduce((acc, sp) => ({ ...acc, [sp.playerId]: sp.shirtNumber }), {}) ?? {});
    setAwaySelectedSelection(game?.awayPlayers?.map(sp => sp.playerId) ?? []);
    setAwayAvailableSelection(game ? teams.entities[game.awayTeamId].playerIds : []);
    setAwayShirtNumbers(game?.awayPlayers?.reduce((acc, sp) => ({ ...acc, [sp.playerId]: sp.shirtNumber }), {}) ?? {});
    setHomeTeamVisible(mode === 'edit' ? true : false);
    setAwayTeamVisible(mode === 'edit' ? true : false);
    setHomeClubVisible(mode === 'edit' ? true : false);
    setAwayClubVisible(mode === 'edit' ? true : false);
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
    
    const homePlayers: GamePlayer[] = homeSelectedSelection.map((id) => {
        const player = players.entities[id];
        return {
            playerId: player.id,
            shirtNumber: homeShirtNumbers[player.id] ?? 0,
            homeTeam: true,
        };
    });

    const awayPlayers: GamePlayer[] = awaySelectedSelection.map((id) => {
        const player = players.entities[id];
        return {
            playerId: player.id,
            shirtNumber: awayShirtNumbers[player.id] ?? 0,
            homeTeam: false,
        };
    });
    
    if (!homeTeamId.trim()) return alert('Home team ID is mandatory');
    if (!awayTeamId.trim()) return alert('Away team ID is mandatory');
    if (!date) return alert('Date is mandatory');
    if (homePlayers.length < 5) return alert('At least five scout players must be selected');
    if (homePlayers.some(sp => sp.shirtNumber <= 0)) return alert('All selected players must have a shirt number assigned');
    if (awayPlayers.length < 5) return alert('At least five scout players must be selected');
    if (awayPlayers.some(sp => sp.shirtNumber <= 0)) return alert('All selected players must have a shirt number assigned');
    
    const uniqueHomeShirtNumbers = new Set(homePlayers.map(sp => sp.shirtNumber));
    if (uniqueHomeShirtNumbers.size !== homePlayers.length) return alert('Shirt numbers must be unique among selected players');

    const uniqueAwayShirtNumbers = new Set(awayPlayers.map(sp => sp.shirtNumber));
    if (uniqueAwayShirtNumbers.size !== awayPlayers.length) return alert('Shirt numbers must be unique among selected players');

    const payload = {
      homeTeamId,
      awayTeamId,
      date,
      homePlayers,
      awayPlayers,
    };

    try {
      if (mode === 'add') dispatch(addGame(payload as any));
      else if (mode === 'edit' && game?.id) dispatch(updateGame({ id: game.id, changes: payload }));
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Could not save game');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal" aria-hidden={isOpen ? 'false' : 'true'} role="dialog" aria-labelledby="GameModalTitle">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="GameModalTitle">{mode === 'add' ? 'Add Game' : 'Edit Game'}</h2>
          <button className="btn small" onClick={onClose} aria-label="Close">✕</button>
        </header>

        <div className="modal-body">
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Season</label>
              <select value={seasonId} onChange={(e) => (setSeasonId(e.target.value), !(e.target.value === "") ? (setHomeClubVisible(true), setAwayClubVisible(true)) : (setHomeClubVisible(false), setAwayClubVisible(false),setHomeTeamVisible(false), setAwayTeamVisible(false)))}>
                <option value="">Select Season</option>
                {seasons.ids.map((id) => {
                  const season = seasons.entities[id];
                  return (
                    <option key={season.id} value={season.id}>
                      {season.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field">
              <label>Date</label><input
                type="date"
                value={date ? date.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)} />
            </div>
            {homeClubVisible &&
            <div className="form-field"><label>Home Club</label>
              <select value={homeClubId} onChange={(e) => (setHomeClubId(e.target.value), !(e.target.value === "") ? setHomeTeamVisible(true) : setHomeTeamVisible(false), setHomeTeamId(''), setHomeAvailableSelection([]), setHomeSelectedSelection([]), setHomeShirtNumbers({}))}>
                <option value="">Select Team</option>
                {clubs.ids.map((id) => {
                  const club = clubs.entities[id];
                  return (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {awayClubVisible &&
            <div className="form-field"><label>Away Club</label>
              <select value={awayClubId} onChange={(e) => (setAwayClubId(e.target.value), !(e.target.value === "") ? setAwayTeamVisible(true) : setAwayTeamVisible(false), setAwayTeamId(''), setAwayAvailableSelection([]), setAwaySelectedSelection([]), setAwayShirtNumbers({}))}>
                <option value="">Select Team</option>
                {clubs.ids.map((id) => {
                  const club = clubs.entities[id];
                  return (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {homeTeamVisible &&
            <div className="form-field"><label>Home Team</label>
              <select value={homeTeamId} onChange={(e) => (setHomeTeamId(e.target.value), setHomeAvailableSelection(teams.entities[e.target.value]?.playerIds || []), setHomeSelectedSelection([]), setHomeShirtNumbers({}))}>
                <option value="">Select Team</option>
                {teams.ids.filter((id) => ((teams.entities[id].seasonId === seasonId) && (teams.entities[id].clubId === homeClubId))).map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {!(homeTeamVisible) && <div className="form-field"></div>}
            {awayTeamVisible &&
            <div className="form-field"><label>Away Team</label>
              <select value={awayTeamId} onChange={(e) => (setAwayTeamId(e.target.value), setAwayAvailableSelection(teams.entities[e.target.value]?.playerIds || []), setAwaySelectedSelection([]), setAwayShirtNumbers({}))}>
                <option value="">Select Team</option>
                {teams.ids.filter((id) => ((teams.entities[id].seasonId === seasonId) && (teams.entities[id].clubId === awayClubId))).map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {!(awayTeamVisible) && <div className="form-field"></div>}
            <label>Home team selection</label>
            <label>Away team selection</label>
            <div className="form-field">
              {homeAvailableSelection.map((id) => {
                const player = players.entities[id];
                return (
                  <div className="form-field-player-check">
                    <div className="checkbox-label-space">
                      <input
                        type="checkbox"
                        id={`player-${player.id}`}
                        checked={homeSelectedSelection.includes(player.id)}
                        onChange={() => {
                          if (homeSelectedSelection.includes(player.id)) {
                            setHomeSelectedSelection(homeSelectedSelection.filter((pid) => pid !== player.id));
                          } else {
                            setHomeSelectedSelection([...homeSelectedSelection, player.id]);
                          }
                        }}
                      />
                      <label htmlFor={`player-${player.id}`}>
                        {player.firstName} {player.lastName}
                      </label>
                    </div>
                    {homeSelectedSelection.includes(player.id) && 
                      <div className="form-field-number">
                        <input value={homeShirtNumbers[player.id] ?? ''} placeholder="#" onChange={(e) => {
                          const value = e.target.value;
                          setHomeShirtNumbers({
                            ...homeShirtNumbers,
                            [player.id]: value ? parseInt(value) : 0
                          });
                        }} />
                      </div>
                    }
                  </div>
                )}
              )}
            </div>
            <div className="form-field">
              {awayAvailableSelection.map((id) => {
                const player = players.entities[id];
                return (
                  <div className="form-field-player-check">
                    <div className="checkbox-label-space">
                      <input
                        type="checkbox"
                        id={`player-${player.id}`}
                        checked={awaySelectedSelection.includes(player.id)}
                        onChange={() => {
                          if (awaySelectedSelection.includes(player.id)) {
                            setAwaySelectedSelection(awaySelectedSelection.filter((pid) => pid !== player.id));
                          } else {
                            setAwaySelectedSelection([...awaySelectedSelection, player.id]);
                          }
                        }}
                      />
                      <label htmlFor={`player-${player.id}`}>
                        {player.firstName} {player.lastName}
                      </label>
                    </div>
                    {awaySelectedSelection.includes(player.id) && 
                      <div className="form-field-number">
                        <input value={awayShirtNumbers[player.id] ?? ''} placeholder="#" onChange={(e) => {
                          const value = e.target.value;
                          setAwayShirtNumbers({
                            ...awayShirtNumbers,
                            [player.id]: value ? parseInt(value) : 0
                          });
                        }} />
                      </div>
                    }
                  </div>
                )}
              )}
            </div>
          </div>
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
