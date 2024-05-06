"use client";
import Loading from "@/context/Loading";
import { Typography, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import AttendanceCalendar from "@/components/calendars/AttendanceCalendar";

const tableStyle = {
	width: "100%",
	border: "1px solid #dddddd",
	borderRadius: "5px",
	height: "100%",
};

const tdStyle = {
	borderBottom: "1px solid #dddddd",
	padding: "8px",
	margin: 0,
};
const tdStyleRight = {
	borderBottom: "1px solid #dddddd",
	borderRight: "1px solid #dddddd",
	padding: "8px",
	margin: 0,
};
const tdStyleLast = {
	padding: "8px",
	margin: 0,
};
const tdStyleLastRight = {
	padding: "8px",
	borderRight: "1px solid #dddddd",
	margin: 0,
};
interface Props {
	params: {
		id: string;
	};
}
const ParticipantInfo = ({ params }: Props) => {
	const participant = useQuery({
		queryKey: ["participant", params.id],
		queryFn: () =>
			fetch(`/api/participant/solo/${params.id}`).then((res) => res.json()),
	});
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
	//console.log(participant.data);
	if (participant.isLoading) return <Loading />;
	if (participant.isSuccess)
		return (
			<Grid
				container
				spacing={2}
				paddingTop={2}
				width={"100%"}>
				<Grid
					xs={12}
					sm={12}
					md={12}
					lg={12}
					xl={12}>
					<Typography
						variant='h4'
						align='center'
						mb={2}>
						{participant.data.firstName} {participant.data.lastName}
					</Typography>
				</Grid>
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={6}
					xl={5}>
					<AttendanceCalendar events={participant.data.attendance} />
					<Box sx={{ mt: 2 }}>
						<div
							style={{
								width: "12px",
								height: "12px",
								marginRight: "8px",
								backgroundColor: "#3788d8",
								border: "1px solid #ddd",
								display: "inline-block",
							}}></div>
						<Typography sx={{ display: "inline-block" }}>
							Należy do grupy
						</Typography>
						<div
							style={{
								width: "12px",
								height: "12px",
								marginRight: "8px",
								marginLeft: "8px",
								backgroundColor: "#f200ff",
								border: "1px solid #ddd",
								display: "inline-block",
							}}></div>
						<Typography sx={{ display: "inline-block" }}>Odrabia</Typography>
					</Box>
				</Grid>
				<Grid
					xs={12}
					sm={6}
					md={6}
					lg={6}
					xl={5}>
					<DataGrid
						columns={columns}
						rows={participant.data.payments}
						disableColumnMenu
					/>
				</Grid>
				<Grid
					xs={12}
					sm={12}
					md={12}
					lg={12}
					xl={2}>
					<table style={tableStyle}>
						<tbody>
							<tr>
								<td style={tdStyleRight}>Telefon:</td>
								<td style={tdStyle}>{participant.data.phoneNumber}</td>
							</tr>
							<tr>
								<td style={tdStyleRight}>Email:</td>
								<td style={tdStyle}>
									{participant.data.email === null
										? "brak maila"
										: participant.data.email}
								</td>
							</tr>
							<tr>
								<td style={tdStyleRight}>Regulamin:</td>
								<td style={tdStyle}>
									{participant.data.regulamin ? "tak" : "nie"}
								</td>
							</tr>
							<tr>
								<td style={tdStyleRight}>Aktywny:</td>
								<td style={tdStyle}>
									{participant.data.active ? "tak" : "nie"}
								</td>
							</tr>
							<tr>
								<td style={tdStyleLastRight}>Notatka:</td>
								<td style={tdStyleLast}>
									{participant.data.note === null ||
									participant.data.note === ""
										? "brak notatki"
										: participant.data.note}
								</td>
							</tr>
						</tbody>
					</table>
				</Grid>
			</Grid>
		);
};

export default ParticipantInfo;
