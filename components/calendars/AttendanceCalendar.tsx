"use client";
import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import plLocale from "@fullcalendar/core/locales/pl";
interface Props {
	events: any;
}
const AttendanceCalendar = ({ events }: Props) => {
	const eventss = events.map((e: any) => {
		const parts = e.date.split("-");
		const reversedDateString = parts[2] + "-" + parts[1] + "-" + parts[0];
		return {
			title: e.groupName ? e.groupName : "Nieznana",
			start: reversedDateString,
			end: reversedDateString,
			backgroundColor: e.belongs ? "#3788d8" : "#f200ff",
			borderColor: e.belongs ? "#3788d8" : "#f200ff",
		};
	});
	return (
		<FullCalendar
			plugins={[dayGridPlugin]}
			initialView='dayGridMonth'
			locale={plLocale}
			events={eventss}
			height={500}
		/>
	);
};

export default AttendanceCalendar;
