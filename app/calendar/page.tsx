import { formatISO, addWeeks, parse } from "date-fns";
import MainCalendar from "@/components/calendars/MainCalendar";
import { getCalendarGroups, getLocs } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { handleResult } from "@/functions/promiseResults";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { toZonedTime } from "date-fns-tz";

function calculateEventDate(
	date: Date,
	dayOfWeek: number,
	time: string
): string {
	const timeZone = "Europe/Warsaw";
	const eventDate = new Date(date);

	// Przesuń datę do odpowiedniego dnia tygodnia
	eventDate.setDate(
		eventDate.getDate() + ((dayOfWeek + 6 - eventDate.getDay()) % 7)
	);

	// Ustaw godzinę
	const [hours, minutes] = time.split(":").map(Number);
	eventDate.setHours(hours, minutes, 0, 0);
	const eventDateInPolishTime = toZonedTime(eventDate, timeZone);

	return formatISO(eventDateInPolishTime, { representation: "complete" });
}
// Funkcja obliczająca przesunięcie dla Polski (czas letni/zimowy)
function getPolandOffset(date: Date): number {
	const january = new Date(date.getFullYear(), 0, 1).getTimezoneOffset();
	const july = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
	const isDST = date.getTimezoneOffset() < Math.max(january, july);
	return isDST ? -120 : -60; // -120 minut (UTC+2) dla czasu letniego, -60 (UTC+1) dla standardowego
}
function generateRecurringEvents(group: any, term: any): any[] {
	const startDate = parse(group.firstLesson, "dd-MM-yyyy", new Date());
	const endDate = parse(group.lastLesson, "dd-MM-yyyy", new Date());
	const events = [];

	let currentDate = startDate;
	while (currentDate <= endDate) {
		const event = {
			id: `${group.id}-${formatISO(currentDate, {
				representation: "date",
			})}`,
			title: `${group.name} ${term.location.name}`,
			start: calculateEventDate(currentDate, term.dayOfWeek + 1, term.timeS),
			end: calculateEventDate(currentDate, term.dayOfWeek + 1, term.timeE),
			color: group.color,
			groupId: term.locationId,
			url: `/group/${group.id}`,
		};
		events.push(event);
		currentDate = addWeeks(currentDate, 1); // Increment by one week
	}
	return events;
}
const getCachedLocs = unstable_cache(
	async (session) => getLocs(session),
	["calendar-locs"],
	{
		tags: ["locs"],
	}
);
const getCachedCalendarGroups = unstable_cache(
	async (session) => getCalendarGroups(session),
	["calendar-groups"],
	{
		tags: ["groups"],
	}
);

const Calendar = async () => {
	const session = await auth();
	const [groupsResult, locsResult] = await Promise.allSettled([
		getCachedCalendarGroups(session),
		getCachedLocs(session),
	]);
	const iOS =
		typeof navigator !== "undefined" &&
		/iPad|iPhone|iPod/.test(navigator.userAgent);

	const groups = handleResult(groupsResult, "Groups");
	const locs = handleResult(locsResult, "Locations");
	if (!groups || !locs) {
		return (
			<StandardError
				message={`Nie udało się pobrać ${!groups ? "grup" : "lokalizacji"}`}
				addParticipants={false}
			/>
		);
	}
	const formattedGroups = groups.flatMap((group: any) =>
		group.terms.flatMap((term: any) => generateRecurringEvents(group, term))
	);
	return (
		<MainCalendar
			locs={locs}
			events={formattedGroups}
			iOS={iOS}
		/>
	);
};

export default Calendar;
