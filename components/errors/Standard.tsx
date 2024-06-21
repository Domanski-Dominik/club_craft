import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { Typography, Fab } from "@mui/material";
import CachedIcon from "@mui/icons-material/Cached";

interface Props {
	message: string;
}
const StandardError = (props: Props) => {
	return (
		<>
			<WarningAmberIcon
				color='error'
				sx={{ width: 100, height: 100, m: 4 }}
			/>
			<Typography
				variant='h5'
				align='center'
				color='red'
				mb={2}>
				{props.message}
			</Typography>
			<Fab
				variant='extended'
				color='primary'
				onClick={() => window.location.reload()}>
				<CachedIcon sx={{ mr: 1 }} />
				Odśwież stronę
			</Fab>
		</>
	);
};

export default StandardError;
