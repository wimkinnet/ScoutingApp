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
