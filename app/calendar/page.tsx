import { formatISO, addWeeks, parse } from "date-fns";
import MainCalendar from "@/components/calendars/MainCalendar";
import { getCalendarGroups, getLocs } from "@/server/get-actions";
import StandardError from "@/components/errors/Standard";
import { handleResult } from "@/functions/promiseResults";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

function calculateEventDate(
	baseDate: Date,
	dayOfWeek: number,
	time: string
): string {
	const timeZone = "Europe/Warsaw";

	// Obliczenie nowej daty, przesuwając do odpowiedniego dnia tygodnia
	const dayDifference = (dayOfWeek + 7 - baseDate.getDay()) % 7;
	let targetDate = new Date(
		baseDate.getFullYear(),
		baseDate.getMonth(),
		baseDate.getDate() + dayDifference
	);

	// Ustaw godzinę i minuty z ciągu `time`
	const [hours, minutes] = time.split(":").map(Number);
	targetDate.setHours(hours);
	targetDate.setMinutes(minutes);
	targetDate.setSeconds(0);
	targetDate.setMilliseconds(0);

	// Ustawienie daty jako strefy czasowej Warszawy
	const zonedDate = toZonedTime(targetDate, timeZone);

	// Formatowanie daty w polskiej strefie czasowej
	return formatInTimeZone(zonedDate, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
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
			start: calculateEventDate(currentDate, term.dayOfWeek, term.timeS),
			end: calculateEventDate(currentDate, term.dayOfWeek, term.timeE),
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
