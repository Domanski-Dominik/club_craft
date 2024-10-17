import Loading from "@/context/Loading";
import { Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AttendanceCalendar from "@/components/calendars/AttendanceCalendar";
import ParticipantPaymentsDataGrid from "@/components/datagrids/ParticipantPaymentsDataGrid";
import { auth } from "@/auth";
import { unstable_cache } from "next/cache";
import { getClubInfo } from "@/server/get-actions";
import { handleResult } from "@/functions/promiseResults";
import StandardError from "@/components/errors/Standard";
import { getParticipantById } from "@/server/participant-actions";
const tableStyle = {
	width: "100%",
	border: "1px solid #dddddd",
	borderRadius: "5px",
	height: "100%",
};

const tdStyle = {
	borderBottom: "1px solid #dddddd",
	padding: "8px",
	m: 0,
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
const getCachedClubInfo = unstable_cache(
	async (sesssion) => getClubInfo(sesssion),
	["participant-clubInfo"],
	{
		tags: ["club"],
	}
);
const ParticipantInfo = async ({ params }: Props) => {
	const session = await auth();
	const [clubInfoResult, participantResult] = await Promise.allSettled([
		getCachedClubInfo(session),
		getParticipantById(parseInt(params.id, 10)),
	]);
	const clubInfo = handleResult(clubInfoResult, "clubInfo");
	const participant = handleResult(participantResult, "particiapnt");
	if (!clubInfo || !participant) {
		return (
			<StandardError
				message={
					clubInfo
						? "Nie udało się pobrać informacji o uczestniku"
						: "Nie udało się pobrać info o klubie"
				}
				addParticipants={false}
			/>
		);
	}
	if (session) {
		return (
			<Grid
				container
				spacing={2}
				paddingTop={2}
				width={"100%"}>
				<Grid size={12}>
					<Box
						sx={{
							backgroundColor: "white",
							borderRadius: 4,
							p: 2,
						}}>
						<Typography
							variant='h4'
							align='center'>
							{participant.firstName} {participant.lastName}
						</Typography>
					</Box>
				</Grid>
				<Grid
					size={{
						xs: 12,
						sm: 6,
						md: 6,
						lg: 6,
						xl: 4,
					}}>
					<Box
						sx={{
							height: "100%",
							backgroundColor: "white",
							borderRadius: 4,
							p: 1.5,
						}}>
						<AttendanceCalendar events={participant.attendance} />
						<Box sx={{ mt: 2 }}>
							<div
								style={{
									width: "12px",
									height: "12px",
									marginRight: "8px",
									backgroundColor: "#3788d8",
									border: "1px solid #ddd",
									display: "inline-block",
									borderRadius: "50%",
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
									borderRadius: "50%",
								}}></div>
							<Typography sx={{ display: "inline-block" }}>Odrabia</Typography>
						</Box>
					</Box>
				</Grid>
				{clubInfo.coachPayments || session.user.role === "owner" ? (
					<Grid
						size={{
							xs: 12,
							sm: 6,
							md: 6,
							lg: 6,
							xl: 4,
						}}
						sx={{ minHeight: "400px" }}>
						<Box
							sx={{
								height: "100%",
								backgroundColor: "white",
								borderRadius: 4,
								p: 1.5,
							}}>
							<ParticipantPaymentsDataGrid payments={participant.payments} />
						</Box>
					</Grid>
				) : (
					<></>
				)}

				<Grid
					size={{
						xs: 12,
						sm: 12,
						md: 12,
						lg: 12,
						xl: 4,
					}}
					sx={{ minHeight: "400px" }}>
					<Box
						sx={{
							backgroundColor: "white",
							borderRadius: 4,
							p: 1,
							height: "100%",
						}}>
						<table style={tableStyle}>
							<tbody>
								<tr>
									<td style={tdStyleRight}>Telefon:</td>
									<td style={tdStyle}>{participant.phoneNumber}</td>
								</tr>
								<tr>
									<td style={tdStyleRight}>Email:</td>
									<td style={tdStyle}>
										{participant.email === null
											? "brak maila"
											: participant.email}
									</td>
								</tr>
								<tr>
									<td style={tdStyleRight}>Regulamin:</td>
									<td style={tdStyle}>
										{participant.regulamin ? "tak" : "nie"}
									</td>
								</tr>
								<tr>
									<td style={tdStyleRight}>Aktywny:</td>
									<td style={tdStyle}>{participant.active ? "tak" : "nie"}</td>
								</tr>
								<tr>
									<td style={tdStyleLastRight}>Notatka:</td>
									<td style={tdStyleLast}>
										{participant.note === null || participant.note === ""
											? "brak notatki"
											: participant.note}
									</td>
								</tr>
							</tbody>
						</table>
					</Box>
				</Grid>
			</Grid>
		);
	} else {
		return <Loading />;
	}
};

export default ParticipantInfo;
