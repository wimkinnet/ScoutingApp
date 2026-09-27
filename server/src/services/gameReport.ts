import OpenAI from 'openai';
import { Game } from '../models/Game';
import { Log } from '../models/Log';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { Club } from '../models/Club';
import { buildGameAnalytics, GameAnalytics, RawGamePlayer, RawLog } from './gameStats';

const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

export type ScoutedTeam = 'home' | 'away';

export interface TeamReport {
  // false for the team that was only partly scouted: then the report covers its scorers only
  scouted: boolean;
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
  scoutedTeam: ScoutedTeam;
  home: TeamReport;
  away: TeamReport;
}

// Thrown when the game doesn't exist, so the route can answer 404 instead of 500
export class GameNotFoundError extends Error {}

// Thrown when the server isn't set up for OpenAI, so the route can say so
export class OpenAIConfigError extends Error {}

const INSTRUCTIONS = `You are a basketball analyst writing a scouting report on one game.
You receive the game's statistics as JSON. Only one team was fully scouted ("scoutedTeam"): all its actions were logged.
For the other team ("otherTeam") only its scorers are known: who scored and with which made shots. Its misses, rebounds, assists, turnovers and other actions were NOT logged.

Write:
- "scouted": a full analysis of the scouted team as a basketball match.
- "other": a short report on the other team limited to its scoring: who scored, how (free throws, twos, threes) and how the points were spread. Say nothing about its efficiency, misses, rebounds, assists, turnovers or defense.

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

const scorersReportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'scorers'],
  properties: {
    headline: { type: 'string', description: 'One-line takeaway about how this team scored.' },
    summary: { type: 'string', description: 'A short paragraph about this team\'s scoring only.' },
    scorers: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'note'],
        properties: {
          name: { type: 'string' },
          note: { type: 'string', description: 'How this player scored, backed by their made shots.' },
        },
      },
    },
  },
};

const gameReportSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['scouted', 'other'],
  properties: {
    scouted: teamReportSchema,
    other: scorersReportSchema,
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

// What the model gets to see: everything for the scouted team, only made shots per scorer for the other
export function buildReportInput(analytics: GameAnalytics, scoutedTeam: ScoutedTeam) {
  const scoutedIsHome = scoutedTeam === 'home';
  const scoutedPlayers = analytics.players.filter((p) => p.homeTeam === scoutedIsHome);
  const otherPlayers = analytics.players.filter((p) => p.homeTeam !== scoutedIsHome);
  const scoutedIds = new Set(scoutedPlayers.map((p) => p.playerId));

  return {
    gameId: analytics.gameId,
    homeTeamName: analytics.homeTeamName,
    awayTeamName: analytics.awayTeamName,
    homeScore: analytics.homeScore,
    awayScore: analytics.awayScore,
    scoutedTeam: {
      side: scoutedTeam,
      name: scoutedIsHome ? analytics.homeTeamName : analytics.awayTeamName,
      totals: scoutedIsHome ? analytics.homeTotals : analytics.awayTotals,
      shotZones: scoutedIsHome ? analytics.shotZones.home : analytics.shotZones.away,
      players: scoutedPlayers,
      assistNetwork: analytics.assistNetwork.filter((a) => scoutedIds.has(a.assistBy)),
    },
    otherTeam: {
      side: scoutedIsHome ? 'away' : 'home',
      name: scoutedIsHome ? analytics.awayTeamName : analytics.homeTeamName,
      points: scoutedIsHome ? analytics.awayScore : analytics.homeScore,
      scorers: otherPlayers
        .filter((p) => p.points > 0)
        .map((p) => ({
          name: p.name,
          shirtNumber: p.shirtNumber,
          points: p.points,
          freeThrowsMade: p.freeThrows.made,
          twoPointersMade: p.twoPointers.made,
          threePointersMade: p.threePointers.made,
        })),
    },
    // Runs only use made baskets, which are logged for both teams
    runs: analytics.runs,
  };
}

export async function generateGameReport(gameId: string, scoutedTeam: ScoutedTeam): Promise<GameReport> {
  const analytics = await loadGameAnalytics(gameId);

  if (!process.env.OPENAI_API_KEY) {
    throw new OpenAIConfigError('OPENAI_API_KEY is not set on the server');
  }

  // Read at call time: index.ts runs dotenv.config() after the routes are imported
  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const client = new OpenAI();

  const response = await client.responses.create({
    model,
    instructions: INSTRUCTIONS,
    input: `Game statistics (JSON):\n${JSON.stringify(buildReportInput(analytics, scoutedTeam))}`,
    text: {
      format: {
        type: 'json_schema',
        name: 'game_report',
        strict: true,
        schema: gameReportSchema,
      },
    },
  });

  const output = JSON.parse(response.output_text) as {
    scouted: Omit<TeamReport, 'scouted'>;
    other: { headline: string; summary: string; scorers: { name: string; note: string }[] };
  };

  const scoutedReport: TeamReport = { scouted: true, ...output.scouted };
  const otherReport: TeamReport = {
    scouted: false,
    headline: output.other.headline,
    summary: output.other.summary,
    strengths: [],
    weaknesses: [],
    keyPlayers: output.other.scorers,
  };

  return {
    gameId,
    model,
    generatedAt: new Date().toISOString(),
    scoutedTeam,
    home: scoutedTeam === 'home' ? scoutedReport : otherReport,
    away: scoutedTeam === 'away' ? scoutedReport : otherReport,
  };
}
