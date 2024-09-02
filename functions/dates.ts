import { startOfWeek } from "date-fns";
import { Term } from "@/types/type";
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
export const getShouldDisableDate = (date: Date, terms: Term[]) => {
	if (!terms || terms.length === 0) {
		return true; // Jeśli terms jest undefined lub puste, dzień powinien być wyłączony
	}
	const startOfWeekDate = startOfWeek(date);

	return terms.every((term) => {
		const termDayOfWeek = term.dayOfWeek;
		const effectiveDate = term.effectiveDate;

		const isDayOfWeek = date.getDay() === termDayOfWeek;
		const isBeforeEffectiveDate = date < effectiveDate;
		const isBeforeStartOfWeek = date < startOfWeekDate;

		return !isDayOfWeek || isBeforeEffectiveDate || isBeforeStartOfWeek;
	});
};
