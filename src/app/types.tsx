export interface Player {
	id: string;
	firstName: string;
	lastName: string;
	dateOfBirth?: Date;
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
	id: string;
	name: string;
}

export const ActionTypes: ActionType[] = [
	{ id: '1', name: '1-score' },
	{ id: '2', name: '1-miss' },
	{ id: '3', name: '2-score' },
	{ id: '4', name: '2-miss' },
	{ id: '5', name: '3-score' },
	{ id: '6', name: '3-miss' },
	{ id: '7', name: 'assist' },
	{ id: '8', name: 'turnover' },
	{ id: '9', name: 'steal' },
	{ id: '10', name: 'block' },
	{ id: '11', name: 'off-rebound' },
	{ id: '12', name: 'def-rebound' },
	{ id: '13', name: 'foul-0' },
	{ id: '14', name: 'foul-1' },
	{ id: '15', name: 'foul-2' },
	{ id: '16', name: 'foul-3' },
	{ id: '17', name: 'foul-t' },
	{ id: '18', name: 'foul-u' },
	{ id: '19', name: 'foul-e' },
	{ id: '20', name: 'player-in' },
	{ id: '21', name: 'player-out' },
];

export interface GamePlayer {
	playerId: string;
	shirtNumber: number;
	homeTeam: boolean;
}

export interface Game {
	id: string;
	scoutTeamId: string;
	otherTeamId: string;
	date: Date;
	scoutHome: boolean;
	homePlayers: GamePlayer[];
	awayPlayers: GamePlayer[];
}

export interface ScoutingAction {
	id: string;
	gameId: string;
	actionId: string;
	playerId: string;
	positionX: number;
	positionY: number;
	quarter: number;
	minute: number;
	second: number;
}



