// server/src/services/gameStats.ts
//
// Pure, framework-agnostic stat aggregation for a single game.
// No Express/req/res here on purpose — everything takes plain data in
// and returns plain objects out, so it's easy to unit test and reuse
// (e.g. later for season-level rollups).
//
// ⚠️ ACTION ID MAPPING — adjust ACTION_IDS below to match your real
// `actions` collection. The values here are inferred from ScoutModal.tsx
// (freeThrows = '1', twoPoints = '3', threePoints = '5', sub in = '21',
// sub out = '22', fouls = actionId between 13 and 20). If your actions
// collection stores type info (e.g. a `category` field) instead of raw
// numeric IDs, swap the lookups below for that field.

export const ACTION_IDS = {
  FREE_THROW_MADE: '1',
  FREE_THROW_MISSED: '2',      // adjust if you log missed FTs under a different id
  TWO_POINT_MADE: '3',
  TWO_POINT_MISSED: '4',       // adjust if different
  THREE_POINT_MADE: '5',
  THREE_POINT_MISSED: '6',     // adjust if different
  DEF_REBOUND: '12',            // adjust
  OFF_REBOUND: '11',            // adjust
  ASSIST: '7',                 // adjust
  STEAL: '9',                 // adjust
  BLOCK: '10',                 // adjust
  TURNOVER: '8',              // adjust
  SUB_IN: '21',
  SUB_OUT: '22',
} as const;

const FOUL_ID_MIN = 13;
const FOUL_ID_MAX = 20;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RawLog {
  id: string;
  gameId: string;
  actionId: string;
  playerId: string;
  positionX?: number;
  positionY?: number;
  quarter: number;
  secRem: number;      // seconds remaining in that quarter when the log was made
  createdAt?: string | Date;
}

export interface RawGamePlayer {
  playerId: string;
  shirtNumber: number;
  homeTeam: boolean;
  firstName?: string;
  lastName?: string;
}

export interface GameMeta {
  gameId: string;
  homeTeamName: string;
  awayTeamName: string;
  quarterLengthSec?: number; // defaults to 600 (10 min)
}

export interface PlayerStatLine {
  playerId: string;
  shirtNumber: number;
  name: string;
  homeTeam: boolean;

  freeThrows: { made: number; attempted: number };
  twoPointers: { made: number; attempted: number };
  threePointers: { made: number; attempted: number };

  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  defRebounds: number;
  offRebounds: number;
  totalRebounds: number;
  fouls: number;
  points: number;

  minutesPlayed: number;   // rounded minutes
  secondsPlayed: number;   // raw seconds, useful for rate stats

  fgMade: number;
  fgAttempted: number;
  fgPct: number | null;
  ftPct: number | null;
  threePct: number | null;
  turnoversPer10Min: number | null;
  assistsPer10Min: number | null;
}

export interface TeamTotals {
  points: number;
  freeThrows: { made: number; attempted: number };
  twoPointers: { made: number; attempted: number };
  threePointers: { made: number; attempted: number };
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  defRebounds: number;
  offRebounds: number;
  totalRebounds: number;
  fouls: number;
  fgPct: number | null;
}

export type ShotZone = 'Paint' | 'Mid-range' | 'Three-point range';

export interface ShotZoneSummary {
  [zone: string]: { made: number; attempted: number; pct: number | null };
}

export interface AssistLink {
  assistBy: string;
  scoredBy: string;
  quarter: number;
  count: number;
}

export interface ScoringRun {
  team: 'home' | 'away';
  points: number;
  startQuarter: number;
  startSecRem: number;
  endQuarter: number;
  endSecRem: number;
}

export interface GameAnalytics {
  gameId: string;
  generatedAt: string;
  homeTeamName: string;
  awayTeamName: string;
  homeScore: number;
  awayScore: number;
  homeTotals: TeamTotals;
  awayTotals: TeamTotals;
  players: PlayerStatLine[];
  shotZones: {
    home: ShotZoneSummary;
    away: ShotZoneSummary;
  };
  assistNetwork: AssistLink[];
  runs: ScoringRun[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pct(made: number, attempted: number): number | null {
  return attempted > 0 ? +((made / attempted) * 100).toFixed(1) : null;
}

function perTenMin(count: number, secondsPlayed: number): number | null {
  if (!secondsPlayed) return null;
  return +((count / (secondsPlayed / 600))).toFixed(1);
}

/** Chronological sort: earlier quarter first, then higher secRem first (clock counting down). */
function chronologicalSort(a: RawLog, b: RawLog): number {
  if (a.quarter !== b.quarter) return a.quarter - b.quarter;
  return b.secRem - a.secRem;
}

// ---------------------------------------------------------------------------
// 1. Minutes played (from sub in/out logs)
// ---------------------------------------------------------------------------

export function computeMinutesPlayedPerQuarter(
  logs: RawLog[]
): Record<string, { quarter: number; seconds: number }[]> {
  // Group sub in/out logs by quarter first.
  const subLogsByQuarter: Record<number, RawLog[]> = {};
  for (const log of logs) {
    if (log.actionId !== ACTION_IDS.SUB_IN && log.actionId !== ACTION_IDS.SUB_OUT) continue;
    if (!subLogsByQuarter[log.quarter]) subLogsByQuarter[log.quarter] = [];
    subLogsByQuarter[log.quarter].push(log);
  }
  for (const quarter in subLogsByQuarter) {
    subLogsByQuarter[quarter].sort(chronologicalSort);
  }

  // playerId -> array of { quarter, seconds } — one entry per quarter played.
  const secondsByPlayerPerQuarter: Record<string, { quarter: number; seconds: number }[]> = {};

  const elapsedSeconds = (checkInSecRem: number, checkOutSecRem: number): number =>
    Math.max(0, checkInSecRem - checkOutSecRem);

  for (const quarterKey in subLogsByQuarter) {
    const quarter = Number(quarterKey);
    // Reset per quarter — starters are assumed to have an explicit SUB_IN
    // logged at the start of every quarter, so there's nothing to carry
    // over from the previous one.
    const onCourtSince: Record<string, number> = {}; // playerId -> secRem at check-in

    const addSeconds = (playerId: string, seconds: number) => {
      if (seconds <= 0) return;
      if (!secondsByPlayerPerQuarter[playerId]) secondsByPlayerPerQuarter[playerId] = [];
      const entry = secondsByPlayerPerQuarter[playerId].find((e) => e.quarter === quarter);
      if (entry) {
        entry.seconds += seconds;
      } else {
        secondsByPlayerPerQuarter[playerId].push({ quarter, seconds });
      }
    };

    for (const log of subLogsByQuarter[quarter]) {
      if (log.actionId === ACTION_IDS.SUB_IN) {
        onCourtSince[log.playerId] = log.secRem;
      } else if (log.actionId === ACTION_IDS.SUB_OUT) {
        const checkInSecRem = onCourtSince[log.playerId];
        if (checkInSecRem != null) {
          addSeconds(log.playerId, elapsedSeconds(checkInSecRem, log.secRem));
          delete onCourtSince[log.playerId];
        }
      }
    }

    // Anyone still on court at the buzzer (never explicitly subbed out
    // in this quarter) played through to secRem = 0.
    for (const [playerId, checkInSecRem] of Object.entries(onCourtSince)) {
      addSeconds(playerId, elapsedSeconds(checkInSecRem, 0));
      delete onCourtSince[playerId]; // good practice: nothing should leak into the next quarter
    }
  }

  return secondsByPlayerPerQuarter;
}

// Flattened, whole-game total — sums each player's per-quarter seconds.
export function computeMinutesPlayed(logs: RawLog[]): Record<string, number> {
  const perQuarter = computeMinutesPlayedPerQuarter(logs);
  const totals: Record<string, number> = {};
  for (const [playerId, quarters] of Object.entries(perQuarter)) {
    totals[playerId] = quarters.reduce((sum, q) => sum + q.seconds, 0);
  }
  return totals;
}

// ---------------------------------------------------------------------------
// 2. Assist linkage
// ---------------------------------------------------------------------------

const MADE_SHOT_IDS = new Set<string>([
  ACTION_IDS.FREE_THROW_MADE,
  ACTION_IDS.TWO_POINT_MADE,
  ACTION_IDS.THREE_POINT_MADE,
]);

/**
 * Infers assist -> scorer pairs by looking for an ASSIST log immediately
 * followed (within the next couple of logs, same quarter) by a made-shot
 * log from a *different* player.
 *
 * NOTE: this is a best-effort inference. If your ActionModal already
 * captures "who scored off this assist" explicitly at logging time
 * (recommended), replace this with a direct read of that field instead.
 */
export function linkAssists(logs: RawLog[], lookaheadWindow = 2): AssistLink[] {
  const sorted = [...logs].sort(chronologicalSort);
  const pairCounts: Record<string, { assistBy: string; scoredBy: string; quarter: number; count: number }> = {};

  for (let i = 0; i < sorted.length; i++) {
    const log = sorted[i];
    if (log.actionId !== ACTION_IDS.ASSIST) continue;

    const forwardCandidates = sorted.slice(i + 1, i + 1 + lookaheadWindow);
    const backwardCandidates = sorted.slice(Math.max(0, i - lookaheadWindow), i).reverse();

    const isMatchingShot = (l: RawLog) =>
      MADE_SHOT_IDS.has(l.actionId) && l.playerId !== log.playerId && l.quarter === log.quarter;

    // Prefer the forward match if one exists (assist logged before the shot,
    // the more common order); only fall back to looking behind if nothing
    // was found ahead.
    const scoringLog = forwardCandidates.find(isMatchingShot) ?? backwardCandidates.find(isMatchingShot);
    if (!scoringLog) continue;

    const key = `${log.playerId}->${scoringLog.playerId}`;
    if (!pairCounts[key]) {
      pairCounts[key] = {
        assistBy: log.playerId,
        scoredBy: scoringLog.playerId,
        quarter: log.quarter,
        count: 0,
      };
    }
    pairCounts[key].count += 1;
  }

  return Object.values(pairCounts);
}

// ---------------------------------------------------------------------------
// 3. Scoring runs
// ---------------------------------------------------------------------------

interface ScoringEvent {
  team: 'home' | 'away';
  points: number;
  quarter: number;
  secRem: number;
}

function pointsForActionId(actionId: string): number {
  if (actionId === ACTION_IDS.FREE_THROW_MADE) return 1;
  if (actionId === ACTION_IDS.TWO_POINT_MADE) return 2;
  if (actionId === ACTION_IDS.THREE_POINT_MADE) return 3;
  return 0;
}

export function findRuns(
  logs: RawLog[],
  homePlayerIds: Set<string>,
  minRunPoints = 6,
): ScoringRun[] {
  const scoringEvents: ScoringEvent[] = logs
    .filter((l) => MADE_SHOT_IDS.has(l.actionId))
    .sort(chronologicalSort)
    .map((l) => ({
      team: homePlayerIds.has(l.playerId) ? 'home' : 'away',
      points: pointsForActionId(l.actionId),
      quarter: l.quarter,
      secRem: l.secRem,
    }));

  const runs: ScoringRun[] = [];
  let current: {
    team: 'home' | 'away' | null;
    points: number;
    startQuarter: number;
    startSecRem: number;
    endQuarter: number;
    endSecRem: number;
  } = { team: null, points: 0, startQuarter: 0, startSecRem: 0, endQuarter: 0, endSecRem: 0 };

  const flush = () => {
    if (current.team && current.points >= minRunPoints) {
      runs.push({
        team: current.team,
        points: current.points,
        startQuarter: current.startQuarter,
        startSecRem: current.startSecRem,
        endQuarter: current.endQuarter,
        endSecRem: current.endSecRem,
      });
    }
  };

  for (const ev of scoringEvents) {
    if (ev.team === current.team) {
      current.points += ev.points;
      current.endQuarter = ev.quarter;
      current.endSecRem = ev.secRem;
    } else {
      flush();
      current = {
        team: ev.team,
        points: ev.points,
        startQuarter: ev.quarter,
        startSecRem: ev.secRem,
        endQuarter: ev.quarter,
        endSecRem: ev.secRem,
      };
    }
  }
  flush();

  return runs;
}

// ---------------------------------------------------------------------------
// 4. Shot zones
// ---------------------------------------------------------------------------

/**
 * Zone boundaries are placeholders based on the ~28 x 15 unit court system
 * referenced in ScoutModal's CourtClick handler. Adjust the thresholds to
 * match your actual drawCourt() dimensions (paint width/depth, 3pt arc radius).
 */
function zoneFromXY(x: number, y: number): ShotZone {
  const basketX = 1.575; // approx free-throw-line-adjacent basket position, adjust to drawCourt()
  const basketY = 7.5;   // half of 15, adjust if your court height differs
  const dist = Math.sqrt((x - basketX) ** 2 + (y - basketY) ** 2);

  if (dist < 2) return 'Paint';
  if (dist < 6.4) return 'Mid-range';       // 6.4 ~ approx just inside 3pt arc, tune this
  return 'Three-point range';
}

export function summarizeShotZones(logs: RawLog[], playerIds: Set<string>): ShotZoneSummary {
  const zones: ShotZoneSummary = {
    'Paint': { made: 0, attempted: 0, pct: null },
    'Mid-range': { made: 0, attempted: 0, pct: null },
    'Three-point range': { made: 0, attempted: 0, pct: null },
  };

  const shotLogs = logs.filter(
    (l) =>
      playerIds.has(l.playerId) &&
      l.positionX != null &&
      l.positionY != null &&
      (l.actionId === ACTION_IDS.TWO_POINT_MADE ||
        l.actionId === ACTION_IDS.TWO_POINT_MISSED ||
        l.actionId === ACTION_IDS.THREE_POINT_MADE ||
        l.actionId === ACTION_IDS.THREE_POINT_MISSED),
  );

  for (const log of shotLogs) {
    const zone = zoneFromXY(log.positionX as number, log.positionY as number);
    zones[zone].attempted += 1;
    if (log.actionId === ACTION_IDS.TWO_POINT_MADE || log.actionId === ACTION_IDS.THREE_POINT_MADE) {
      zones[zone].made += 1;
    }
  }

  for (const zone of Object.keys(zones)) {
    zones[zone].pct = pct(zones[zone].made, zones[zone].attempted);
  }

  return zones;
}

// ---------------------------------------------------------------------------
// 5. Per-player stat line
// ---------------------------------------------------------------------------

export function buildPlayerStatLine(
  player: RawGamePlayer,
  logs: RawLog[],
  secondsPlayed: number,
): PlayerStatLine {
  const playerLogs = logs.filter((l) => l.playerId === player.playerId);

  const freeThrowsAttempted = playerLogs.filter(
    (l) => l.actionId === ACTION_IDS.FREE_THROW_MADE || l.actionId === ACTION_IDS.FREE_THROW_MISSED,
  ).length;
  const freeThrowsMade = playerLogs.filter((l) => l.actionId === ACTION_IDS.FREE_THROW_MADE).length;

  const twoAttempted = playerLogs.filter(
    (l) => l.actionId === ACTION_IDS.TWO_POINT_MADE || l.actionId === ACTION_IDS.TWO_POINT_MISSED,
  ).length;
  const twoMade = playerLogs.filter((l) => l.actionId === ACTION_IDS.TWO_POINT_MADE).length;

  const threeAttempted = playerLogs.filter(
    (l) => l.actionId === ACTION_IDS.THREE_POINT_MADE || l.actionId === ACTION_IDS.THREE_POINT_MISSED,
  ).length;
  const threeMade = playerLogs.filter((l) => l.actionId === ACTION_IDS.THREE_POINT_MADE).length;

  const assists = playerLogs.filter((l) => l.actionId === ACTION_IDS.ASSIST).length;
  const steals = playerLogs.filter((l) => l.actionId === ACTION_IDS.STEAL).length;
  const blocks = playerLogs.filter((l) => l.actionId === ACTION_IDS.BLOCK).length;
  const turnovers = playerLogs.filter((l) => l.actionId === ACTION_IDS.TURNOVER).length;
  const defRebounds = playerLogs.filter((l) => l.actionId === ACTION_IDS.DEF_REBOUND).length;
  const offRebounds = playerLogs.filter((l) => l.actionId === ACTION_IDS.OFF_REBOUND).length;
  const fouls = playerLogs.filter(
    (l) => Number(l.actionId) >= FOUL_ID_MIN && Number(l.actionId) <= FOUL_ID_MAX,
  ).length;

  const fgMade = twoMade + threeMade;
  const fgAttempted = twoAttempted + threeAttempted;
  const points = freeThrowsMade + twoMade * 2 + threeMade * 3;

  return {
    playerId: player.playerId,
    shirtNumber: player.shirtNumber,
    name: [player.firstName, player.lastName].filter(Boolean).join(' ') || `#${player.shirtNumber}`,
    homeTeam: player.homeTeam,

    freeThrows: { made: freeThrowsMade, attempted: freeThrowsAttempted },
    twoPointers: { made: twoMade, attempted: twoAttempted },
    threePointers: { made: threeMade, attempted: threeAttempted },

    assists,
    steals,
    blocks,
    turnovers,
    defRebounds,
    offRebounds,
    totalRebounds: defRebounds + offRebounds,
    fouls,
    points,

    minutesPlayed: Math.round(secondsPlayed / 60),
    secondsPlayed,

    fgMade,
    fgAttempted,
    fgPct: pct(fgMade, fgAttempted),
    ftPct: pct(freeThrowsMade, freeThrowsAttempted),
    threePct: pct(threeMade, threeAttempted),
    turnoversPer10Min: perTenMin(turnovers, secondsPlayed),
    assistsPer10Min: perTenMin(assists, secondsPlayed),
  };
}

// ---------------------------------------------------------------------------
// 6. Team totals (sum of player lines)
// ---------------------------------------------------------------------------

export function buildTeamTotals(players: PlayerStatLine[]): TeamTotals {
  const sum = (fn: (p: PlayerStatLine) => number) => players.reduce((acc, p) => acc + fn(p), 0);

  const ftMade = sum((p) => p.freeThrows.made);
  const ftAtt = sum((p) => p.freeThrows.attempted);
  const twoMade = sum((p) => p.twoPointers.made);
  const twoAtt = sum((p) => p.twoPointers.attempted);
  const threeMade = sum((p) => p.threePointers.made);
  const threeAtt = sum((p) => p.threePointers.attempted);
  const fgMade = twoMade + threeMade;
  const fgAtt = twoAtt + threeAtt;

  return {
    points: sum((p) => p.points),
    freeThrows: { made: ftMade, attempted: ftAtt },
    twoPointers: { made: twoMade, attempted: twoAtt },
    threePointers: { made: threeMade, attempted: threeAtt },
    assists: sum((p) => p.assists),
    steals: sum((p) => p.steals),
    blocks: sum((p) => p.blocks),
    turnovers: sum((p) => p.turnovers),
    defRebounds: sum((p) => p.defRebounds),
    offRebounds: sum((p) => p.offRebounds),
    totalRebounds: sum((p) => p.totalRebounds),
    fouls: sum((p) => p.fouls),
    fgPct: pct(fgMade, fgAtt),
  };
}

// ---------------------------------------------------------------------------
// 7. Orchestrator — the one function your route should call
// ---------------------------------------------------------------------------

export function buildGameAnalytics(
  meta: GameMeta,
  logs: RawLog[],
  gamePlayers: RawGamePlayer[],
): GameAnalytics {
  const homePlayerIds = new Set(gamePlayers.filter((p) => p.homeTeam).map((p) => p.playerId));
  const awayPlayerIds = new Set(gamePlayers.filter((p) => !p.homeTeam).map((p) => p.playerId));

  const minutesByPlayer = computeMinutesPlayed(logs);

  const players = gamePlayers.map((p) =>
    buildPlayerStatLine(p, logs, minutesByPlayer[p.playerId] || 0),
  );

  const homeTotals = buildTeamTotals(players.filter((p) => p.homeTeam));
  const awayTotals = buildTeamTotals(players.filter((p) => !p.homeTeam));

  const assistNetwork = linkAssists(logs).map((link) => {
    const assister = gamePlayers.find((p) => p.playerId === link.assistBy);
    const scorer = gamePlayers.find((p) => p.playerId === link.scoredBy);
    return {
      ...link,
      assistByName: assister ? `#${assister.shirtNumber}` : link.assistBy,
      scoredByName: scorer ? `#${scorer.shirtNumber}` : link.scoredBy,
    };
  });

  const runs = findRuns(logs, homePlayerIds);

  const shotZones = {
    home: summarizeShotZones(logs, homePlayerIds),
    away: summarizeShotZones(logs, awayPlayerIds),
  };

  return {
    gameId: meta.gameId,
    generatedAt: new Date().toISOString(),
    homeTeamName: meta.homeTeamName,
    awayTeamName: meta.awayTeamName,
    homeScore: homeTotals.points,
    awayScore: awayTotals.points,
    homeTotals,
    awayTotals,
    players,
    shotZones,
    assistNetwork,
    runs,
  };
}