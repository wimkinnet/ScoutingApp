export type Side = 'Home' | 'Away';
export type CourtSide = 'offensive' | 'defensive' | null;

export const MADE_FIELD_GOALS = ['3', '5'];
export const ASSIST = '7';
// Substitutions are done from the bench, not from the court
const SUB_ACTIONS = ['21', '22'];

interface ActionContext {
  isHomePlayer: boolean;
  posX: number;
  posY: number;
  possession: string;      // "Home" | "Away" | ""
  awayDirection: string;   // "Left" | "Right" | ""
}

/** Half of the court where the action happened, seen from the acting player's team. */
export function courtSideFor({ isHomePlayer, posX, awayDirection }: Pick<ActionContext, 'isHomePlayer' | 'posX' | 'awayDirection'>): CourtSide {
  // Without a known playing direction we can't tell which half is offensive
  if (awayDirection !== 'Left' && awayDirection !== 'Right') return null;
  const defensiveCourtIsLeft = (isHomePlayer && awayDirection === 'Left') || (!isHomePlayer && awayDirection === 'Right');
  const isLeft = posX < 14;
  return defensiveCourtIsLeft !== isLeft ? 'offensive' : 'defensive';
}

/** Actions that most likely happened, given who acted, where, and who has the ball. */
export function probableActions({ isHomePlayer, posX, posY, possession, awayDirection }: ActionContext): string[] {
  const isLeft = posX < 14;
  const defensiveCourtIsLeft = (isHomePlayer && awayDirection === 'Left') || (!isHomePlayer && awayDirection === 'Right');
  const outThreePointCircleLeft = ((posX - 1.60) ** 2 + (posY - 7.5) ** 2 > 6.75 ** 2) && posX > 1.60;
  const outThreePointCircleRight = ((26.40 - posX) ** 2 + (posY - 7.5) ** 2 > 6.75 ** 2) && posX < 26.40;
  const outThreePointCircle = (outThreePointCircleLeft && !defensiveCourtIsLeft) || (outThreePointCircleRight && defensiveCourtIsLeft);
  const outThreePointCircleDefensive = (outThreePointCircleLeft && defensiveCourtIsLeft) || (outThreePointCircleRight && !defensiveCourtIsLeft);
  const aboveThreePoint = posY < 0.75 && (posX < 1.60 || posX > 26.40);
  const underThreePoint = posY > 14.25 && (posX < 1.60 || posX > 26.40);
  const isThreePointRange = outThreePointCircle || aboveThreePoint || underThreePoint;
  const isThreePointRangeDefensive = outThreePointCircleDefensive || aboveThreePoint || underThreePoint;
  const inFreeThrowCircleLeft = ((posX - 5.80) ** 2 + (posY - 7.5) ** 2 < 1.80 ** 2) && posX > 5.80;
  const inFreeThrowCircleRight = ((22.20 - posX) ** 2 + (posY - 7.5) ** 2 < 1.80 ** 2) && posX < 22.20;
  const isFreeThrowRange = (inFreeThrowCircleLeft && !defensiveCourtIsLeft) || (inFreeThrowCircleRight && defensiveCourtIsLeft);
  const playerHasBall = (isHomePlayer && possession === 'Home') || (!isHomePlayer && possession === 'Away');
  const offense = defensiveCourtIsLeft !== isLeft;

  if (playerHasBall) {
    if (!offense) return ['7', '8', '17'];
    if (isThreePointRange) return ['5', '6', '7', '8', '11', '17'];
    if (isFreeThrowRange) return ['1', '2', '3', '4', '7', '8', '11', '17'];
    return ['3', '4', '7', '8', '11', '17'];
  }
  if (offense) return ['9', '13', '15'];
  if (isThreePointRangeDefensive) return ['9', '10', '13', '14', '15', '16'];
  return ['9', '10', '12', '13', '14', '15'];
}

/** All other actions that can be logged from the court, in their usual order. */
export function otherActions(allActionIds: string[], probable: string[]): string[] {
  return allActionIds.filter((id) => !probable.includes(id) && !SUB_ACTIONS.includes(id));
}

/**
 * Which team has the ball after this action, or null when it doesn't change (or can't be known,
 * e.g. after a free throw we don't know if it was the last one).
 */
export function possessionAfter(actionId: string, isHomePlayer: boolean): Side | null {
  const actorTeam: Side = isHomePlayer ? 'Home' : 'Away';
  const otherTeam: Side = isHomePlayer ? 'Away' : 'Home';
  switch (actionId) {
    case '3':  // 2pt made
    case '5':  // 3pt made
    case '8':  // turnover
    case '17': // offensive foul
      return otherTeam;
    case '9':  // steal
    case '11': // offensive rebound
    case '12': // defensive rebound
      return actorTeam;
    default:
      return null;
  }
}
