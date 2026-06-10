import { useState } from 'react';
import { 
  useGetLogsQuery, 
  useGetPlayersQuery, 
  useDeleteLogMutation, 
  useGetGamesQuery, 
  useGetTeamsQuery,
  useGetClubsQuery,
  useGetActionsQuery,
 } from '../services/ScoutingApi';
import './Lists.css';
import '../styles/index.css';
import '../styles/_tokens.css';

export default function TeamsIndex() {
  const { data: logs = [] } = useGetLogsQuery();
  const { data: games = [] } = useGetGamesQuery();
  const { data: players = [] } = useGetPlayersQuery();
  const { data: teams = [] } = useGetTeamsQuery();
  const { data: clubs = [] } = useGetClubsQuery();
  const { data: actions = [] } = useGetActionsQuery();
  const [deleteLog] = useDeleteLogMutation();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playerFilter, setPlayerFilter] = useState<string>('');

  return (
    <div>
      <ul className="listContainer">
        <div className="filterContainer">
        <select
          className="filter game"
          value={selectedGame || ''}
          onChange={(e) => setSelectedGame(e.target.value || null)}
        >
          <option value="">All Games</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {clubs.find((c) => c.id === teams.find((t) => t.id === game.homeTeamId)?.clubId)?.shortName}
              {' '}
              {teams.find((t) => t.id === game.homeTeamId)?.name}
              {' vs '}
              {clubs.find((c) => c.id === teams.find((t) => t.id === game.awayTeamId)?.clubId)?.shortName}
              {' '}
              {teams.find((t) => t.id === game.awayTeamId)?.name} @ {new Date(game.date).toLocaleDateString()}
            </option>
          ))}
        </select>
        <input
          className="filter player"
          type="text"
          placeholder="Filter players..."
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
        />
      </div>
        <div className="listHeader">
          <div className="listHeaderItem XXL">Game</div>
          <div className="listHeaderItem XL">Player</div>
          <div className="listHeaderItem L">Action</div>
          <div className="listHeaderItem XS">Qrt</div>
          <div className="listHeaderItem S">Time</div>
        </div>
        {[...logs].filter((log) => (selectedGame ? log.gameId === selectedGame : true))
          .filter((log) =>
            playerFilter
              ? (players.find((p) => p.id === log.playerId)?.firstName ?? '').toString().toLowerCase().includes(playerFilter.toLowerCase())
                || (players.find((p) => p.id === log.playerId)?.lastName ?? '').toString().toLowerCase().includes(playerFilter.toLowerCase())
              : true
          )
          .sort((a, b) => {
            const at = Date.parse((a as any).timestamp ?? (a as any).createdAt ?? (a as any).time ?? '');
            const bt = Date.parse((b as any).timestamp ?? (b as any).createdAt ?? (b as any).time ?? '');
            return bt - at;
          })
          .map((log) => {
            const gameDate = games.find((g) => g.id === log.gameId)?.date;
            return (
            <li key={log.id}>
              <div className="listRow">
                <div className="listItem XXL">
                  {clubs.find((c) => c.id === teams.find((t) => t.id === games.find((g) => g.id === log.gameId)?.homeTeamId)?.clubId)?.shortName}
                  {' '}
                  {teams.find((t) => t.id === games.find((g) => g.id === log.gameId)?.homeTeamId)?.name}
                  {' vs '}
                  {clubs.find((c) => c.id === teams.find((t) => t.id === games.find((g) => g.id === log.gameId)?.awayTeamId)?.clubId)?.shortName}
                  {' '}
                  {teams.find((t) => t.id === games.find((g) => g.id === log.gameId)?.awayTeamId)?.name}
                  {' @ '}
                  {gameDate ? new Date(gameDate).toLocaleDateString() : ''}
                </div>
                <div className="listItem XL">
                  {players.find((p) => p.id === log.playerId)?.firstName} {players.find((p) => p.id === log.playerId)?.lastName}
                </div>
                <div className="listItem L">{actions.find((a) => a.id === log.actionId)?.name || log.actionId}</div>
                <div className="listItem XS">{log.quarter}</div>
                <div className="listItem S">{Math.floor((600 - log.secRem) / 60)}:{Math.floor((600 - log.secRem) % 60).toString().padStart(2, '0')}</div>
                <div className="listAction S">
                  <button className="btn" onClick={() => deleteLog(log.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
            );
          })}
      </ul>
    </div>
  );
}

