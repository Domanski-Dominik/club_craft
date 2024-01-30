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
	id: number;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
	club: string;
	color: string;
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
	phoneNumber?: string;
	note?: string;
	regulamin?: boolean;
	attendance?: [Attendance];
	payments?: [Payment];
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
export type FormPay = {
	amount: string;
	description: string;
	paymentMethod: string;
	selectedMonth: string;
	paymentDate: string;
};

export interface DialogPayType {
	open: boolean;
	row: GridRowModel | null;
	onClose: (
		paymentData: FormPay | null,
		row: GridRowModel | null,
		action: "save" | "delete" | null
	) => void;
}
export interface DialogDeleteType {
	open: boolean;
	row: GridRowModel | null;
	onClose: (value: string) => void;
}
export interface DialogGroupsType {
	open: boolean;
	row: GridRowModel | null;
	onClose: (value: string) => void;
	locWithGroups: LocWithGroups[];
}
export type LocWithGroups = Location & {
	locationschedule: Group[] | [];
};
export interface DialogDeleteLocType {
	open: boolean;
	name: string;
	onClose: (value: string) => void;
}
