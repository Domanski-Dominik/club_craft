"use client";

import { GridColDef } from "@mui/x-data-grid";
import { StyledDataGrid } from "@/components/styled/StyledDataGrid";

interface Props {
	payments: any;
}
const ParticipantPaymentsDataGrid = (props: Props) => {
	const columns: GridColDef[] = [
		{
			field: "amount",
			headerName: "Kwota",
			flex: 1,
		},
		{
			field: "month",
			headerName: "Miesiąc",
			flex: 1,
		},
		{
			field: "paymentDate",
			headerName: "Dzień Wpłaty",
			flex: 1,
			sortable: false,
		},
		{
			field: "description",
			headerName: "Opis",
			flex: 1,
		},
	];
	return (
		<StyledDataGrid
			columns={columns}
			rows={props.payments}
			disableColumnMenu
		/>
	);
};

export default ParticipantPaymentsDataGrid;
