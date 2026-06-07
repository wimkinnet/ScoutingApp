import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { ModalProps } from '../app/types';
import { 
  useGetGameByIdQuery,
  useGetPlayersQuery,
  useGetClubsQuery, 
  useGetSeasonsQuery,
  useGetTeamsQuery,
  useAddGameMutation,
  useUpdateGameMutation
 } from '../services/ScoutingApi';
import type { GamePlayer } from '../app/types';
import './Modal.css';
import '../styles/index.css'
import '../styles/_tokens.css'

export default function GameModal({ isOpen, onClose }: ModalProps) {
  const { mode, id } = useSelector((s: RootState) => s.ui.gameModal);

  const { data: game, isLoading: isLoadingGame, isError: isGameError } = useGetGameByIdQuery(id ?? '', {
      skip: !isOpen || mode !== 'edit' || !id,
    });

  const { data: clubs } = useGetClubsQuery(undefined, { skip: !isOpen });
  const { data: seasons } = useGetSeasonsQuery(undefined, { skip: !isOpen });
  const { data: players } = useGetPlayersQuery(undefined, { skip: !isOpen });
  const { data: teams } = useGetTeamsQuery(undefined, { skip: !isOpen });

  const [addGame, { isLoading: isAdding }] = useAddGameMutation();
  const [updateGame, { isLoading: isUpdating }] = useUpdateGameMutation();
  
  const [homeTeamId, setHomeTeamId] = useState('');
  const [awayTeamId, setAwayTeamId] = useState('');
  const [homeClubId, setHomeClubId] = useState('');
  const [awayClubId, setAwayClubId] = useState('');
  const [date, setDate] = useState('');
  const [seasonId, setSeasonId] = useState('');
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

  // Keep track of the last loaded team ID to avoid infinite overwrite loops
  const lastLoadedIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isOpen) {
      // Clear tracking when closed
      lastLoadedIdRef.current = null;
      return;
    }
    console.log(mode)
    console.log(game)
    console.log(lastLoadedIdRef.current)
    // Scenario A: Add Mode - Initialize empty form once
    if (mode === 'add' && lastLoadedIdRef.current !== 'add') {
      setHomeTeamId('');
      setAwayTeamId('');
      setDate('');
      setSeasonId("");
      setHomeClubId("");
      setAwayClubId("");
      setHomeSelectedSelection([]);
      setHomeAvailableSelection([]);
      setHomeShirtNumbers({});
      setAwaySelectedSelection([]);
      setAwayAvailableSelection([]);
      setAwayShirtNumbers({});
      setHomeTeamVisible(false);
      setAwayTeamVisible(false);
      setHomeClubVisible(false);
      setAwayClubVisible(false);
      lastLoadedIdRef.current = 'add';
    } 
    // Scenario B: Edit Mode - Initialize form only when the specific game payload loads
    else if (mode === 'edit' && game && lastLoadedIdRef.current !== game.id) {
      console.log('test')
      console.log(game)
      setHomeTeamId(game?.homeTeamId ?? '');
      setAwayTeamId(game?.awayTeamId ?? '');
      setDate(game?.date ?? '');
      const ht = teams?.find((t) => t.id === game?.homeTeamId) ?? undefined
      const at = teams?.find((t) => t.id === game?.awayTeamId) ?? undefined
      console.log(ht)
      setSeasonId(ht ? ht.seasonId : "");
      setHomeClubId(ht ? ht.clubId : "");
      setAwayClubId(at ? at.clubId : "");
      setHomeSelectedSelection(game?.homePlayers?.map(sp => sp.playerId) ?? []);
      setHomeAvailableSelection(ht ? ht.playerIds : []);
      setHomeShirtNumbers(game?.homePlayers?.reduce((acc, sp) => ({ ...acc, [sp.playerId]: sp.shirtNumber }), {}) ?? {});
      setAwaySelectedSelection(game?.awayPlayers?.map(sp => sp.playerId) ?? []);
      setAwayAvailableSelection(at ? at.playerIds : []);
      setAwayShirtNumbers(game?.awayPlayers?.reduce((acc, sp) => ({ ...acc, [sp.playerId]: sp.shirtNumber }), {}) ?? {});
      setHomeTeamVisible(mode === 'edit' ? true : false);
      setAwayTeamVisible(mode === 'edit' ? true : false);
      setHomeClubVisible(mode === 'edit' ? true : false);
      setAwayClubVisible(mode === 'edit' ? true : false);
      lastLoadedIdRef.current = game.id;
    }
  }, [isOpen, mode, game]);

  const onSave = async () => {
    
    const homePlayers: GamePlayer[] = homeSelectedSelection.map((id) => {
      const pl = players?.find((p) => p.id === id);
      let playerId = '';
      let shirtNumber = 0;
      let homeTeam = false;
      if (pl) {
          playerId = pl?.id;
          shirtNumber = homeShirtNumbers[pl?.id];
          homeTeam = true;
      } 
      return {
        playerId: playerId,
        shirtNumber: shirtNumber,
        homeTeam: homeTeam,
      }
    });

    const awayPlayers: GamePlayer[] = awaySelectedSelection.map((id) => {
      const pl = players?.find((p) => p.id === id);
      let playerId = '';
      let shirtNumber = 0;
      let homeTeam = false;
      if (pl) {
          playerId = pl?.id;
          shirtNumber = awayShirtNumbers[pl?.id];
          homeTeam = false;
      } 
      return {
        playerId: playerId,
        shirtNumber: shirtNumber,
        homeTeam: homeTeam,
      }
    });
    
    if (!homeTeamId.trim()) return alert('Home team ID is mandatory');
    if (!awayTeamId.trim()) return alert('Away team ID is mandatory');
    if (!date) return alert('Date is mandatory');
    if (homePlayers.length < 5) return alert('At least five scout players must be selected');
    if (homePlayers.some(sp => sp.shirtNumber <= 0)) return alert('All selected players must have a shirt number assigned');
    if (awayPlayers.length < 5) return alert('At least five scout players must be selected');
    if (awayPlayers.some(sp => sp.shirtNumber <= 0)) return alert('All selected players must have a shirt number assigned');
    
    const uniqueHomeShirtNumbers = new Set(homePlayers.map((hp) => hp.shirtNumber));
    console.log(uniqueHomeShirtNumbers);
    console.log(uniqueHomeShirtNumbers.size);
    console.log(homePlayers.length);
    if (uniqueHomeShirtNumbers.size !== homePlayers.length) return alert('Shirt numbers must be unique among selected home players');

    const uniqueAwayShirtNumbers = new Set(awayPlayers.map((ap) => ap.shirtNumber));
    console.log(uniqueAwayShirtNumbers);
    console.log(uniqueAwayShirtNumbers.size);
    console.log(awayPlayers.length);
    if (uniqueAwayShirtNumbers.size !== awayPlayers.length) return alert('Shirt numbers must be unique among selected away players');

    const payload = {
      homeTeamId,
      awayTeamId,
      date,
      homePlayers,
      awayPlayers,
    };

    try {
      if (mode === 'add') {
      await addGame(payload).unwrap();
    } else if (mode === 'edit' && game?.id) {
      await updateGame({ id: game.id, changes: payload }).unwrap();
    }
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
          {mode === 'edit' && isLoadingGame ? (
            <p>Loading team...</p>
          ) : mode === 'edit' && isGameError ? (
            <p>Could not load team</p>
          ) : (
          <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-field"><label>Season</label>
              <select value={seasonId} onChange={(e) => (setSeasonId(e.target.value), !(e.target.value === "") ? (setHomeClubVisible(true), setAwayClubVisible(true)) : (setHomeClubVisible(false), setAwayClubVisible(false),setHomeTeamVisible(false), setAwayTeamVisible(false)))}>
                <option value="">Select Season</option>
                {seasons?.map((s) => {
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-field">
              <label>Date</label><input
                type="date"
                value={date ? date : ''}
                onChange={(e) => setDate(e.target.value)} />
            </div>
            {homeClubVisible &&
            <div className="form-field"><label>Home Club</label>
              <select value={homeClubId} onChange={(e) => (setHomeClubId(e.target.value), !(e.target.value === "") ? setHomeTeamVisible(true) : setHomeTeamVisible(false), setHomeTeamId(''), setHomeAvailableSelection([]), setHomeSelectedSelection([]), setHomeShirtNumbers({}))}>
                <option value="">Select Team</option>
                {clubs?.map((cl) => {
                  return (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {awayClubVisible &&
            <div className="form-field"><label>Away Club</label>
              <select value={awayClubId} onChange={(e) => (setAwayClubId(e.target.value), !(e.target.value === "") ? setAwayTeamVisible(true) : setAwayTeamVisible(false), setAwayTeamId(''), setAwayAvailableSelection([]), setAwaySelectedSelection([]), setAwayShirtNumbers({}))}>
                <option value="">Select Team</option>
                {clubs?.map((cl) => {
                  return (
                    <option key={cl.id} value={cl.id}>
                      {cl.name}
                    </option>
                  );
                })}
              </select>
            </div>}
            {homeTeamVisible &&
            <div className="form-field"><label>Home Team</label>
              <select value={homeTeamId} onChange={(e) => (setHomeTeamId(e.target.value), setHomeAvailableSelection(teams?.find((t) => (t.id === e.target.value))?.playerIds || []), setHomeSelectedSelection([]), setHomeShirtNumbers({}))}>
                <option value="">Select Team</option>
                {teams?.map((t) => ((t.seasonId === seasonId) && (t.clubId === homeClubId) &&
                  (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  )))
                }
              </select>
            </div>}
            {!(homeTeamVisible) && <div className="form-field"></div>}
            {awayTeamVisible &&
            <div className="form-field"><label>Away Team</label>
              <select value={awayTeamId} onChange={(e) => (setAwayTeamId(e.target.value), setAwayAvailableSelection(teams?.find((t) => (t.id === e.target.value))?.playerIds || []), setAwaySelectedSelection([]), setAwayShirtNumbers({}))}>
                <option value="">Select Team</option>
                {teams?.map((t) => ((t.seasonId === seasonId) && (t.clubId === awayClubId) &&
                  (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  )))
                }
              </select>
            </div>}
            {!(awayTeamVisible) && <div className="form-field"></div>}
            <label>Home team selection</label>
            <label>Away team selection</label>
            <div className="form-field">
              {homeAvailableSelection.map((id) => {
                const player = players?.find((pl) => pl.id === id);
                return player && (
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
                const player = players?.find((pl) => pl.id === id);
                return player && (
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
          )}
        </div>

        <footer className="modal-footer">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={onSave} disabled={isAdding || isUpdating || (mode ==='edit' && isLoadingGame)}>{mode === 'add' ? 'Add' : 'Save'}</button>
        </footer>
      </div>
    </div>
  );
}
