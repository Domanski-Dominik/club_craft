import { GridValidRowModel } from "@mui/x-data-grid";
const ExcelJS = require("exceljs");
import { saveAs } from "file-saver";
import { format } from "date-fns/format";
import { Participant } from "@/types/type";
import PolishDayName from "@/functions/PolishDayName";
import { headers } from "next/headers";
interface Props {
	data: (GridValidRowModel | Participant)[];
	date: any;
}

const formatDateMonth = (date: Date) => {
	return format(date, "MM-yyyy");
};
function ExportToExel({ data, date }: Props) {
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
		{ headers: "Urodziny", key: "birthday", width: 20 },
		{ header: "Umowa", key: "regulamin", width: 10 },
		{ header: "Nazwisko Rodzica", key: "parentLastName", width: 20 },
		{ header: "Imię Rodzica", key: "parentFirstName", width: 20 },
		{ header: "Notatka", key: "note", width: 20 },
		{ header: "Grupy", key: "groups", width: 60 },
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
			birthday: prt.birthday,
			regulamin: prt.regulamin ? "Tak" : "Nie",
			parentLastName: prt.parentLastName,
			parentFirstName: prt.parentFirstName,
			note: prt.note,
			groups: prt.participantgroup
				.map((g: any) => {
					const groupName = g.name;
					const terms = g.terms
						.map(
							(t: any) =>
								`${t.location.name} ${PolishDayName(t.dayOfWeek)} ${t.timeS}-${
									t.timeE
								}`
						)
						.join("\n"); // Każdy termin zaczyna się od nowej linii

					return `${groupName}\n${terms}`; // Dodajemy grupę oraz terminy oddzielone nową linią
				})
				.join("\n"),
			attendance: prt.attendance
				.filter((a: any) => {
					const attendanceMonthYear = a.date.substring(3); // Ucinamy pierwsze trzy znaki z daty
					return attendanceMonthYear === formatDateMonth(date);
				})
				.map((a: any) => a.date)
				.join(", "),
		});

		const groupCell = row.getCell("groups");
		groupCell.alignment = { wrapText: true };

		//
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

		const numTerms = prt.participantgroup.reduce(
			(total: number, group: any) => total + group.terms.length,
			1
		);
		//const numPayments = prt.payments.length;
		const defaultRowHeight = 15; // Set your default row height here
		const calculatedRowHeight = defaultRowHeight + (numTerms - 1) * 10; // Adjust the multiplier based on your preference
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
