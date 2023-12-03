export type Location = {
	id: number | string;
	name: string;
	street: string;
	city: string;
	postalCode: string;
	streetNr: string;
	club: string;
};
export type Group = {
	id: string | number;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
};
