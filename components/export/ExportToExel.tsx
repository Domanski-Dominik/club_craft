import React from "react";
import { GridValidRowModel } from "@mui/x-data-grid";
const ExcelJS = require("exceljs");
import { saveAs } from "file-saver";
import format from "date-fns/format";
import { Participant } from "@/types/type";
import PolishDayName from "@/context/PolishDayName";
interface Props {
	data: (GridValidRowModel | Participant)[];
	date: any;
}

const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};
function ExportToExel({ data, date }: Props) {
	console.log(data);
	// Sortujemy dane według nazwiska, a jeśli są takie same, to według imienia
	const sortedData = data.sort((a, b) => {
		if (a.lastName === b.lastName) {
			return a.firstName.localeCompare(b.firstName);
		}
		return a.lastName.localeCompare(b.lastName);
	});
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet("Uczestnicy");
	sheet.columns = [
		{ header: "Nazwisko", key: "lastName", width: 20, bold: true },
		{ header: "Imię", key: "firstName", width: 20, bold: true },
		{ header: "Telefon", key: "phoneNumber", width: 20, bold: true },
		{ header: "Umowa", key: "regulamin", width: 10 },
		{ header: "Grupy", key: "groups", width: 40 },
		{ header: "Kwota", key: "amount", width: 10 },
		{ header: `${formatDateMonth(date)}`, key: "info", width: 60 },
		{ header: "Obecności", key: "attendance", width: 150 },
	];
	sheet.getRow(1).font = {
		bold: true,
	};
	sheet.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "ffa4ffa4" },
	};
	sortedData.forEach((prt: any) => {
		const row = sheet.addRow({
			lastName: prt.lastName,
			firstName: prt.firstName,
			phoneNumber: prt.phoneNumber,
			regulamin: prt.regulamin ? "Tak" : "Nie",
			groups: prt.participantgroup
				.map((gr: any) => `${gr.location} ${PolishDayName(gr.day)} ${gr.name},`)
				.join("\n"),
			attendance: prt.attendance
				.filter((a: any) => {
					const attendanceMonthYear = a.date.substring(3); // Ucinamy pierwsze trzy znaki z daty
					return attendanceMonthYear === formatDateMonth(date);
				})
				.map((a: any) => a.date)
				.join(", "),
		});

		const paymentsForDate = prt.payments.filter(
			(payment: any) => formatDateMonth(date) === payment.month
		);

		row.getCell("amount").value = paymentsForDate
			.map((payment: any) => payment.amount)
			.join("\n");

		row.getCell("info").value = paymentsForDate
			.map(
				(payment: any) =>
					`Wpłacono: ${payment.paymentDate}, metoda: ${
						payment.paymentMethod === "cash" ? "gotówka" : "przelew"
					}, ${payment.description !== "" ? payment.description : ""}`
			)
			.join("\n");

		const numGroups = prt.participantgroup.length;
		//const numPayments = prt.payments.length;
		const defaultRowHeight = 15; // Set your default row height here
		const calculatedRowHeight = defaultRowHeight + (numGroups - 1) * 10; // Adjust the multiplier based on your preference
		row.height = Math.max(defaultRowHeight, calculatedRowHeight);
	});

	const totalPaymentAmount = sortedData.reduce((total: number, prt: any) => {
		const paymentsForDate = prt.payments.filter(
			(payment: any) => formatDateMonth(date) === payment.month
		);
		return (
			total +
			paymentsForDate.reduce(
				(sum: number, payment: any) => sum + payment.amount,
				0
			)
		);
	}, 0);

	// Dodajemy ostatni wiersz z sumą kwot płatności
	const lastRow = sheet.addRow({ amount: totalPaymentAmount });

	workbook.xlsx.writeBuffer().then(function (data: any) {
		const blob = new Blob([data], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});
		const url = window.URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "Uczestnicy.xlsx";
		anchor.click();
		window.URL.revokeObjectURL(url);
	});
}
export default ExportToExel;
