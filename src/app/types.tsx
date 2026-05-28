export interface Player {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth?: string;
}

export interface Club {
	id: string;
	name: string;
	registrationNumber: string;
}

export interface Season {
	id: string;
	name: string;
}

export interface Team {
	id: string;
	name: string;
	clubId: string;
	seasonId: string;
	playerIds: string[];
}

export interface ActionType {
	id: number;
	name: string;
	label: string;
}

export interface GamePlayer {
	playerId: string;
	shirtNumber: number;
	homeTeam: boolean;
}

export interface Game {
	id: string;
	homeTeamId: string;
	awayTeamId: string;
	date: Date;
	homePlayers: GamePlayer[];
	awayPlayers: GamePlayer[];
}

export interface Action {
	id: string;
	gameId: string;
	actionId: string;
	playerId: string;
	positionX: number;
	positionY: number;
	quarter: number;
	secRem: number;
}



