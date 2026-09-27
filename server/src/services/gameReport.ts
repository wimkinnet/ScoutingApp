import OpenAI from 'openai';
import { Game } from '../models/Game';
import { Log } from '../models/Log';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Club } from '../models/Club';
import { buildGameAnalytics, GameAnalytics, RawGamePlayer, RawLog } from './gameStats';

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

export interface TeamReport {
  headline: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  keyPlayers: { name: string; note: string }[];
}

export interface GameReport {
  gameId: string;
  model: string;
  generatedAt: string;
  home: TeamReport;
  away: TeamReport;
}

// Thrown when the game doesn't exist, so the route can answer 404 instead of 500
export class GameNotFoundError extends Error {}

const INSTRUCTIONS = `You are a basketball analyst writing a scouting report on one game.
You receive the game's statistics as JSON. Analyze the game as a basketball match and write a separate report for the home team and for the away team.

Rules:
- Only use statistics that are present in the JSON. Never invent or estimate numbers, players, plays or events that are not in the data.
- You may derive simple figures directly from the given numbers (e.g. a difference or a share of team points), but only when every input is in the JSON.
- If something is missing or zero because it was not scouted, do not draw conclusions from its absence.
- Percentages are already given as 0-100 values; null means there were no attempts.
- "runs" are scoring runs; secRem is the seconds remaining in that quarter.
- Refer to players by the name in the data.
- Write in English, concise and concrete, as a coach would read it.`;

const teamReportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'strengths', 'weaknesses', 'keyPlayers'],
  properties: {
    headline: { type: 'string', description: 'One-line takeaway for this team.' },
    summary: { type: 'string', description: 'A short paragraph analyzing how this team played.' },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    keyPlayers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'note'],
        properties: {
          name: { type: 'string' },
          note: { type: 'string', description: 'What this player did, backed by their stats.' },
        },
      },
    },
  },
};

const gameReportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['home', 'away'],
  properties: {
    home: teamReportSchema,
    away: teamReportSchema,
  },
};

// Loads everything buildGameAnalytics needs for one game from MongoDB
export async function loadGameAnalytics(gameId: string): Promise<GameAnalytics> {
  const game = await Game.findOne({ id: gameId }).lean();
  if (!game) throw new GameNotFoundError(`Game ${gameId} not found`);

  const gamePlayerRows = [...game.homePlayers, ...game.awayPlayers];

  const [logs, players, teams] = await Promise.all([
    Log.find({ gameId }).lean(),
    Player.find({ id: { $in: gamePlayerRows.map((p) => p.playerId) } }).lean(),
    Team.find({ id: { $in: [game.homeTeamId, game.awayTeamId] } }).lean(),
  ]);

  const homeTeam = teams.find((t: any) => t.id === game.homeTeamId);
  const awayTeam = teams.find((t: any) => t.id === game.awayTeamId);
  const clubIds = [homeTeam?.clubId, awayTeam?.clubId].filter((c): c is string => !!c);
  const clubs = await Club.find({ id: { $in: clubIds } }).lean();

  const teamName = (team: any) => {
    const club = clubs.find((c: any) => c.id === team?.clubId);
    return [club?.name, team?.name].filter(Boolean).join(' ') || 'Unknown team';
  };

  const gamePlayers: RawGamePlayer[] = gamePlayerRows.map((gp) => {
    const player = players.find((p: any) => p.id === gp.playerId);
    return {
      playerId: gp.playerId,
      shirtNumber: gp.shirtNumber,
      homeTeam: gp.homeTeam,
      firstName: player?.firstName,
      lastName: player?.lastName,
    };
  });

  return buildGameAnalytics(
    { gameId, homeTeamName: teamName(homeTeam), awayTeamName: teamName(awayTeam) },
    logs as unknown as RawLog[],
    gamePlayers,
  );
}

export async function generateGameReport(gameId: string): Promise<GameReport> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set');
  }

  // Read at call time: index.ts runs dotenv.config() after the routes are imported
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const analytics = await loadGameAnalytics(gameId);
  const client = new OpenAI();

  const response = await client.responses.create({
    model,
    instructions: INSTRUCTIONS,
    input: `Game statistics (JSON):\n${JSON.stringify(analytics)}`,
    text: {
      format: {
        type: 'json_schema',
        name: 'game_report',
        strict: true,
        schema: gameReportSchema,
      },
    },
  });

  const report = JSON.parse(response.output_text) as { home: TeamReport; away: TeamReport };

  return {
    gameId,
    model,
    generatedAt: new Date().toISOString(),
    home: report.home,
    away: report.away,
  };
}
