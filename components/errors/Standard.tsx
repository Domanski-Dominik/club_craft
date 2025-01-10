"use client";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import { Typography, Fab, Box } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";
import { useRouter } from "next/navigation";

interface Props {
	message: string;
	addParticipants: boolean;
}
const StandardError = (props: Props) => {
	const router = useRouter();
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				backgroundColor: "white",
				height: "calc(100vh - 180px)",
				width: "calc(100% - 10px)",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 4,
			}}>
			<WarningAmberIcon
				color='error'
				sx={{ width: 150, height: 150 }}
			/>
			<Typography
				variant='h5'
				align='center'
				color='red'
				my={4}>
				{props.message}
			</Typography>
			<Fab
				sx={{ m: 2 }}
				variant='extended'
				size='large'
				color='primary'
				onClick={() => window.location.reload()}>
				<CachedIcon sx={{ mr: 1 }} />
				Odśwież stronę
			</Fab>
			{props.addParticipants && (
				<Fab
					sx={{ m: 2 }}
					size='large'
					variant='extended'
					color='primary'
					onClick={() => router.push(`/add`)}>
					<AddIcon sx={{ mr: 1 }} />
					Dodaj uczestników
				</Fab>
			)}
		</Box>
	);
};

export default StandardError;
