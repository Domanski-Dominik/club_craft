import React from "react";
import { GridValidRowModel } from "@mui/x-data-grid";
const ExcelJS = require("exceljs");
import { saveAs } from "file-saver";
import { Participant } from "@/types/type";
import PolishDayName from "@/context/PolishDayName";
interface Props {
	data: (GridValidRowModel | Participant)[];
}

function ExportToExel({ data }: Props) {
	console.log(data);
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet("Uczestnicy");
	sheet.columns = [
		{ header: "Nazwisko", key: "lastName", width: 20, bold: true },
		{ header: "Imię", key: "firstName", width: 20, bold: true },
		{ header: "Telefon", key: "phoneNumber", width: 20, bold: true },
		{ header: "Umowa", key: "regulamin", width: 10 },
		{ header: "Grupy", key: "groups", width: 40 },
		{ header: "Płatności", key: "payments", width: 60 },
		{ header: "Obecności", key: "attendance", width: 100 },
	];
	sheet.getRow(1).font = {
		bold: true,
	};
	sheet.getRow(1).fill = {
		type: "pattern",
		pattern: "solid",
		fgColor: { argb: "ffa4ffa4" },
	};
	data.forEach((prt: any) => {
		const row = sheet.addRow({
			lastName: prt.lastName,
			firstName: prt.firstName,
			phoneNumber: prt.phoneNumber,
			regulamin: prt.regulamin ? "Tak" : "Nie",
			groups: prt.participantgroup
				.map((gr: any) => `${gr.location} ${PolishDayName(gr.day)} ${gr.name},`)
				.join("\n"),
			payments: prt.payments
				.map(
					(p: any) =>
						`${p.amount} zł, za: ${p.month}, wpłacono: ${
							p.paymentDate
						}, metoda: ${p.paymentMethod === "cash" ? "gotówka" : "przelew"}, ${
							p.description !== "" ? p.description : ""
						}`
				)
				.join("\n"),
			attendance: prt.attendance.map((a: any) => a.date).join(", "),
		});
		const numGroups = prt.participantgroup.length;
		const numPayments = prt.payments.length;
		const defaultRowHeight = 15; // Set your default row height here
		const calculatedRowHeight =
			defaultRowHeight + (numGroups - 1) * 10 + (numPayments - 1) * 10; // Adjust the multiplier based on your preference
		row.height = Math.max(defaultRowHeight, calculatedRowHeight);
	});

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
