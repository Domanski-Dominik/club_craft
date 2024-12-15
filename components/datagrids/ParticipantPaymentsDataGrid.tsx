"use client";

import { GridColDef } from "@mui/x-data-grid";
import { StyledDataGrid } from "@/components/styled/StyledDataGrid";
import { Box, Typography } from "@mui/material";

interface Props {
	payments: any;
}
const ParticipantPaymentsDataGrid = (props: Props) => {
	const columns: GridColDef[] = [
		{
			field: "amount",
			headerName: "Kwota",
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
						py: 2,
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "month",
			headerName: "Miesiąc",
			flex: 1,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
						py: 2,
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "paymentDate",
			headerName: "Dzień Wpłaty",
			flex: 1,
			sortable: false,
			renderCell: (params) => (
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						height: "100%",
						py: 2,
					}}>
					{params.value}
				</Box>
			),
		},
		{
			field: "description",
			headerName: "Opis",
			flex: 2, // Zwiększ szerokość kolumny
			renderCell: (params) => (
				<Typography
					variant='body2'
					sx={{
						whiteSpace: "normal", // Wymusza zawijanie tekstu
						wordWrap: "break-word", // Rozdziela długie słowa
						py: 2,
					}}>
					{params.value}
				</Typography>
			),
		},
	];
	return (
		<StyledDataGrid
			columns={columns}
			rows={props.payments}
			disableColumnMenu
			getRowHeight={() => "auto"} // Dynamicznie dopasowuje wysokość wierszy
		/>
	);
};

export default ParticipantPaymentsDataGrid;
