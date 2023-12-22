import { GridRowModel } from "@mui/x-data-grid";
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
	club: string;
};
export type GroupL = {
	id: string | number;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
	locationName: string;
	locationId: string;
	club: string;
};
export type Participant = {
	id: number;
	firstName: string;
	lastName: string;
	club: string;
	email?: string;
	tel?: string;
	attendance?: [Attendance];
	payment?: [Payment];
};
export type Payment = {
	id: number;
	amount: number;
	paymentDate: String;
	paymentMethod: String;
	month: String;
	description?: string;
};
export type Attendance = {
	id: Number;
	date: String;
	groupId: Number;
	participant: Participant;
};

export interface DialogPayType {
	open: boolean;
	row: GridRowModel | null;
	onClose: (paymentData: {}) => void;
}
export interface DialogDeleteType {
	open: boolean;
	row: GridRowModel | null;
	onClose: (value: string) => void;
}
