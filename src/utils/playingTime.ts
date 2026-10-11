import type { Log } from '../services/ScoutingApi';

const PLAYER_IN = '21';
const PLAYER_OUT = '22';

/**
 * Seconds a player has played so far, pairing "Player In"/"Player Out" logs per quarter
 * (secRem counts down from the quarter length in every quarter).
 * Players on court at the buzzer get no "Player Out", so an open stint in an earlier
 * quarter runs to 0; an open stint in the current quarter runs to the live clock.
 */
export function secondsPlayed(logs: Log[], playerId: string, currentQuarter: number, secondsLeft: number): number {
  const subs = logs
    .filter((l) => l.playerId === playerId && (l.actionId === PLAYER_IN || l.actionId === PLAYER_OUT))
    .sort((a, b) =>
      a.quarter - b.quarter
      || b.secRem - a.secRem
      || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  let total = 0;
  let onCourtSince: number | null = null;
  let stintQuarter = 0;

  const closeStint = (endSecRem: number) => {
    if (onCourtSince !== null) total += Math.max(0, onCourtSince - endSecRem);
    onCourtSince = null;
  };
  const quarterEnd = (quarter: number) => (quarter === currentQuarter ? secondsLeft : 0);

  for (const log of subs) {
    if (onCourtSince !== null && log.quarter !== stintQuarter) closeStint(quarterEnd(stintQuarter));

    if (log.actionId === PLAYER_IN) {
      if (onCourtSince === null) {
        onCourtSince = log.secRem;
        stintQuarter = log.quarter;
      }
    } else {
      closeStint(log.secRem);
    }
  }
  if (onCourtSince !== null) closeStint(quarterEnd(stintQuarter));

  return total;
}
