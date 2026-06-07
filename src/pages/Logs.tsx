import { useState } from 'react';
import { 
  useGetLogsQuery, 
  useGetPlayersQuery, 
  useDeleteLogMutation, 
  useGetGamesQuery, 
  useGetTeamsQuery,
  useGetClubsQuery,
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
  const [deleteLog] = useDeleteLogMutation();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [playerFilter, setPlayerFilter] = useState<string>('');

  return (
    <div>
      <div className="filterContainer">
        <select
          className="filterSelect"
          value={selectedGame || ''}
          onChange={(e) => setSelectedGame(e.target.value || null)}
        >
          <option value="">All Games</option>
          {games.map((game) => (
            <option key={game.id} value={game.id}>
              {clubs.find((c) => c.id === teams.find((t) => t.id === game.homeTeamId)?.clubId)?.name}
              {' '}
              {teams.find((t) => t.id === game.homeTeamId)?.name}
              {' vs '}
              {clubs.find((c) => c.id === teams.find((t) => t.id === game.awayTeamId)?.clubId)?.name}
              {' '}
              {teams.find((t) => t.id === game.awayTeamId)?.name} @ {new Date(game.date).toLocaleDateString()}
            </option>
          ))}
        </select>
        <input
          className="filterSelect"
          type="text"
          placeholder="Filter players..."
          value={playerFilter}
          onChange={(e) => setPlayerFilter(e.target.value)}
        />
      </div>
      <ul className="listContainer">
        <div className="listHeader">
          <div className="listHeaderItem">Game</div>
          <div className="listHeaderItem">Player</div>
          <div className="listHeaderItem">Action</div>
          <div className="listHeaderItem">Quarter</div>
          <div className="listHeaderItem">Time Remaining</div>
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
          .map((log) => (
            <li key={log.id}>
              <div className="listRow">
                <div className="listItem">{games.find((g) => g.id === log.gameId)?.id}</div>
                <div className="listItem">
                  {players.find((p) => p.id === log.playerId)?.firstName} {players.find((p) => p.id === log.playerId)?.lastName}
                </div>
                <div className="listItem">{log.actionId}</div>
                <div className="listItem">{log.quarter}</div>
                <div className="listItem">{log.secRem}</div>
                <div className="listAction">
                  <button className="btn" onClick={() => deleteLog(log.id)}>
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}

