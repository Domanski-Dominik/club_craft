import { GridRowModel } from "@mui/x-data-grid";
export interface Location {
	id: string | number;
	name: string;
	street: string;
	city: string;
	postalCode: string;
	streetNr: string;
	club: string;
}
export interface Group {
	id: number;
	name: string;
	dayOfWeek: number;
	timeS: string;
	timeE: string;
	club?: string;
	color?: string;
}
export interface GroupL extends Group {
	locationName: string;
	locationId: string;
	club: string;
}
export interface Participant {
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
	participantgroup?: [];
	status?: string;
	active?: boolean;
	attendanceDate?: string;
}
export interface Payment {
	id: number;
	amount: number;
	paymentDate: string;
	paymentMethod: string;
	month: string;
	description?: string;
}

export interface Attendance {
	id: number;
	date: string;
	groupId: number;
	participant: Participant;
	belongs: boolean;
}
export interface FormPay {
	amount: string;
	description: string;
	paymentMethod: string;
	selectedMonth: string;
	paymentDate: string;
}

export interface Dialog {
	open: boolean;
}

export interface DialogPayType extends Dialog {
	row: GridRowModel | null;
	onClose: (
		paymentData: FormPay | null,
		row: GridRowModel | null,
		action: "save" | "delete" | null
	) => void;
}
export interface DialogDeleteType extends Dialog {
	row: GridRowModel | null;
	onClose: (value: string) => void;
}
export interface DialogPresentType {
	open: boolean;
	onClose: (participant: Participant | null) => void;
	groupId: number;
	day: number;
}
export interface DialogGroupsType extends Dialog {
	row: GridRowModel | null;
	onClose: (value: string) => void;
	locWithGroups: LocWithGroups[];
}
export interface DialogDeleteLocType extends Dialog {
	name: string;
	onClose: (value: string) => void;
}
export interface LocWithGroups extends Location {
	locationschedule: Group[] | [];
}
export interface User {
	id: String;
	name?: String;
	email?: String;
	emailVerified?: Date;
	createdAt?: Date;
	updatedAt?: Date;
	club: String;
	role: String;
}
export interface Coach extends User {
	coachedGroups: [];
}
