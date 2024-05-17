const PolishDayName = (dayOfWeek: number): string => {
	switch (dayOfWeek) {
		case 0:
			return "Niedziela";
		case 1:
			return "Poniedziałek";
		case 2:
			return "Wtorek";
		case 3:
			return "Środa";
		case 4:
			return "Czwartek";
		case 5:
			return "Piątek";
		case 6:
			return "Sobota";
		default:
			return "Nieznany dzień";
	}
};

export default PolishDayName;

export const ReversePolishName = (dayOfWeek: string) => {
	switch (dayOfWeek) {
		case "Niedziela":
			return 0;
		case "Poniedziałek":
			return 1;
		case "Wtorek":
			return 2;
		case "Środa":
			return 3;
		case "Czwartek":
			return 4;
		case "Piątek":
			return 5;
		case "Sobota":
			return 6;
		default:
			return 7;
	}
};

export const ColorName = (color: string) => {
	switch (color) {
		case "#3788d8":
			return "Niebieski";
		case "#228B22":
			return "Zielony";
		case "#9400D3":
			return "Fioletowy";
		case "#DC143C":
			return "Czerwony";
		case "#FFD700":
			return "Złoty";
		case "#FF8C00":
			return "Pomarańczowy";
		case "#00ffc8":
			return "Cyjan";
		case "#f200ff":
			return "Różowy";
		default:
			return "Nieznany";
	}
};
