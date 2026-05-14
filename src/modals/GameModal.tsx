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
  const [scoutTeamId, setScoutTeamId] = useState(game?.scoutTeamId ?? '');
  const [otherTeamId, setOtherTeamId] = useState(game?.otherTeamId ?? '');
  const [scoutClubId, setScoutClubId] = useState(game ? teams.entities[game.scoutTeamId].clubId : '');
  const [otherClubId, setOtherClubId] = useState(game ? teams.entities[game.otherTeamId].clubId : '');
  const [date, setDate] = useState(game?.date ?? undefined);
  const [scoutHome, setScoutHome] = useState(game?.scoutHome ?? true);
  const [seasonId, setSeasonId] = useState(game ? teams.entities[game.scoutTeamId].seasonId : '');
  const [scoutTeamVisible, setScoutTeamVisible] = useState(false);
  const [otherTeamVisible, setOtherTeamVisible] = useState(false);
  const [scoutClubVisible, setScoutClubVisible] = useState(false);
  const [otherClubVisible, setOtherClubVisible] = useState(false);
  const [availableSelection, setAvailableSelection] = useState<string[]>([]);
  const [selectedSelection, setSelectedSelection] = useState<string[]>([]);
  const [shirtNumbers, setShirtNumbers] = useState<{ [playerId: string]: number }>({});

  useEffect(() => {
    if (!isOpen) return;
    setScoutTeamId(game?.scoutTeamId ?? '');
    setOtherTeamId(game?.otherTeamId ?? '');
    setDate(game?.date ?? undefined);
    setScoutHome(game?.scoutHome ?? true);
    setSeasonId(game ? teams.entities[game.scoutTeamId].seasonId : '');
    setScoutClubId(game ? teams.entities[game.scoutTeamId].clubId : '');
    setOtherClubId(game ? teams.entities[game.otherTeamId].clubId : '');
    setSelectedSelection(game?.homePlayers?.map(sp => sp.playerId) ?? []);
    setAvailableSelection(game ? teams.entities[game.scoutTeamId].playerIds : []);
    setShirtNumbers(game?.homePlayers?.reduce((acc, sp) => ({ ...acc, [sp.playerId]: sp.shirtNumber }), {}) ?? {});
    setScoutTeamVisible(mode === 'edit' ? true : false);
    setOtherTeamVisible(mode === 'edit' ? true : false);
    setScoutClubVisible(mode === 'edit' ? true : false);
    setOtherClubVisible(mode === 'edit' ? true : false);
  }, [isOpen, mode, id]);

  const onClose = () => dispatch(closeModal());
  const onSave = () => {
    
    const homePlayers: GamePlayer[] = selectedSelection.map((id) => {
        const player = players.entities[id];
        return {
            playerId: player.id,
            shirtNumber: shirtNumbers[player.id] ?? 0,
        };
    });
    
    if (!scoutTeamId.trim()) return alert('Scout team ID is mandatory');
    if (!otherTeamId.trim()) return alert('Other team ID is mandatory');
    if (!date) return alert('Date is mandatory');
    if (scoutHome === undefined) return alert('Scout home/away is mandatory');
    if (homePlayers.length < 5) return alert('At least five scout players must be selected');
    if (homePlayers.some(sp => sp.shirtNumber <= 0)) return alert('All selected players must have a shirt number assigned');
    
    const uniqueShirtNumbers = new Set(homePlayers.map(sp => sp.shirtNumber));
    if (uniqueShirtNumbers.size !== homePlayers.length) return alert('Shirt numbers must be unique among selected players');

    const payload = {
      scoutTeamId,
      otherTeamId,
      date,
      scoutHome,
      homePlayers,
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
              <select value={seasonId} onChange={(e) => (setSeasonId(e.target.value), !(e.target.value === "") ? (setScoutClubVisible(true), setOtherClubVisible(true)) : (setScoutClubVisible(false), setOtherClubVisible(false),setScoutTeamVisible(false), setOtherTeamVisible(false)))}>
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
            <div className="form-field"></div>
            {scoutClubVisible &&
            <div className="form-field"><label>Scout Club</label>
              <select value={scoutClubId} onChange={(e) => (setScoutClubId(e.target.value), !(e.target.value === "") ? setScoutTeamVisible(true) : setScoutTeamVisible(false), setScoutTeamId(''), setAvailableSelection([]), setSelectedSelection([]), setShirtNumbers({}))}>
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
            {scoutTeamVisible &&
            <div className="form-field"><label>Scout Team</label>
              <select value={scoutTeamId} onChange={(e) => (setScoutTeamId(e.target.value), setAvailableSelection(teams.entities[e.target.value]?.playerIds || []), setSelectedSelection([]), setShirtNumbers({}))}>
                <option value="">Select Team</option>
                {teams.ids.filter((id) => ((teams.entities[id].seasonId === seasonId) && (teams.entities[id].clubId === scoutClubId))).map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {!(scoutTeamVisible) && <div className="form-field"></div>}
            {otherClubVisible &&
            <div className="form-field"><label>Other Club</label>
              <select value={otherClubId} onChange={(e) => (setOtherClubId(e.target.value), !(e.target.value === "") ? setOtherTeamVisible(true) : setOtherTeamVisible(false), setOtherTeamId(''))}>
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
            {otherTeamVisible &&
            <div className="form-field"><label>Other Team</label>
              <select value={otherTeamId} onChange={(e) => setOtherTeamId(e.target.value)}>
                <option value="">Select Team</option>
                {teams.ids.filter((id) => ((teams.entities[id].seasonId === seasonId) && (teams.entities[id].clubId === otherClubId))).map((id) => {
                  const team = teams.entities[id];
                  return (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {!(otherTeamVisible) && <div className="form-field"></div>}
            <div className="form-field">
              <label>Date</label><input
                type="date"
                value={date ? date.toISOString().slice(0, 10) : ''}
                onChange={(e) => setDate(e.target.value ? new Date(e.target.value) : undefined)} />
            </div>
            <div className="form-field">
              <label>Scout Home/Away</label>
              <select value={scoutHome ? 'true' : 'false'} onChange={(e) => setScoutHome(e.target.value === 'true')}>
                <option value="true">Home</option>
                <option value="false">Away</option>
              </select>
            </div>
            <label>Selected players and numbers</label>
            <label></label>
            {availableSelection.map((id) => {
              const player = players.entities[id];
              return (
                <div className="form-field-player-check">
                  <div className="checkbox-label-space">
                    <input
                      type="checkbox"
                      id={`player-${player.id}`}
                      checked={selectedSelection.includes(player.id)}
                      onChange={() => {
                        if (selectedSelection.includes(player.id)) {
                          setSelectedSelection(selectedSelection.filter((pid) => pid !== player.id));
                        } else {
                          setSelectedSelection([...selectedSelection, player.id]);
                        }
                      }}
                    />
                    <label htmlFor={`player-${player.id}`}>
                      {player.firstName} {player.lastName}
                    </label>
                  </div>
                  {selectedSelection.includes(player.id) && 
                    <div className="form-field-number">
                      <input value={shirtNumbers[player.id] ?? ''} placeholder="#" onChange={(e) => {
                        const value = e.target.value;
                        setShirtNumbers({
                          ...shirtNumbers,
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

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
