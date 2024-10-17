import PolishDayName from "./PolishDayName";
import { Participant } from "@/types/type";
import { GridValidRowModel } from "@mui/x-data-grid";

export const sortAndAddNumbers = (
	data: any,
	groupId: any,
	status: "info" | "normal"
) => {
	if (data && data.length > 0) {
		data.sort((a: any, b: any) => {
			if (a.lastName === b.lastName) {
				return a.firstName.localeCompare(b.firstName);
			}
			return a.lastName.localeCompare(b.lastName);
		});
		/*if (status === "info") {
			const rowsWithNumbers = data.map((row: any) => {
				return { ...row, num: 0, groupId: groupId, status: status };
			});
			return rowsWithNumbers;
		} else if (status === "normal") {*/
		const rowsWithNumbers = data.map((row: any, index: any) => {
			return { ...row, groupId: groupId, status: status };
		});
		return rowsWithNumbers;
		//}
	}
	return [];
};

export const sortAll = (rows: (Participant | GridValidRowModel)[]) => {
	const sortedRows = [...rows];
	sortedRows.sort((a, b) => {
		if (a.lastName === b.lastName) {
			return a.firstName.localeCompare(b.firstName);
		}
		return a.lastName.localeCompare(b.lastName);
	});

	// Dodaj numery do posortowanych uczestników
	const addHiddenGroups = sortedRows.map((row) => {
		return {
			...row,
			hiddengroups:
				row.participantgroup.length > 0
					? row.participantgroup
							.map(
								(g: any) =>
									`${g.name} ${g.terms.map(
										(t: any) =>
											`${t.location.name} ${PolishDayName(t.dayOfWeek)}`
									)}`
							)
							.join(",")
					: "Nie przypisany do żadnej grupy",
		};
	});

	// Zaktualizuj stan z posortowaną i ponumerowaną listą uczestników
	return addHiddenGroups;
};

export const sort = (rows: GridValidRowModel[]) => {
	const sortedRows = [...rows];
	sortedRows.sort((a, b) => {
		if (a.surname === b.surname) {
			return a.name.localeCompare(b.name);
		}
		return a.surname.localeCompare(b.surname);
	});
	return sortedRows;
};
