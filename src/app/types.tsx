export interface GamePlayer {
	playerId: string;
	shirtNumber: number;
	homeTeam: boolean;
}

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface PlayerStats {
  points: number;
  assists: number;
  offensiveRebounds: number;
  defensiveRebounds: number;
  steals: number;
  blocks: number;
  turnovers: number;
  missedShots: number;
  secondsPlayed: number;
}


