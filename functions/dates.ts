import { startOfWeek } from "date-fns";
export function reverseDateFormat(dateString: string): string {
	const parts = dateString.split("-");
	if (parts.length === 3) {
		const [day, month, year] = parts;
		return `${year}-${month}-${day}`;
	} else {
		// Obsługa błędnego formatu wejściowego
		console.error("Nieprawidłowy format daty wejściowej:", dateString);
		return dateString; // Lub można zwrócić pusty string lub null, w zależności od wymagań
	}
}
export const getShouldDisableDate = (dayOfWeek: number) => {
	return (day: Date) => {
		// Obliczenie daty startowej dla danej daty
		const startOfWeekDate = startOfWeek(day);

		// Sprawdzenie, czy data odpowiada wybranemu dniu tygodnia
		const isDayOfWeek = day.getDay() === dayOfWeek;

		// Sprawdzenie, czy data jest wcześniejsza niż start tygodnia
		const isBeforeStartOfWeek = day < startOfWeekDate;

		return !isDayOfWeek || isBeforeStartOfWeek;
	};
};
