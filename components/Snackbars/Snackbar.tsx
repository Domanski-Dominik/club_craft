import ReactDOM from "react-dom";
import { Snackbar, Alert, useMediaQuery, Theme, useTheme } from "@mui/material";

interface ResponsiveSnackbarProps {
	open: boolean;
	onClose: () => void;
	message: string;
	severity?: "error" | "warning" | "info" | "success";
	autoHide?: number;
}

const ResponsiveSnackbar: React.FC<ResponsiveSnackbarProps> = ({
	open,
	onClose,
	message,
	severity,
	autoHide,
}) => {
	const isMobile = useMediaQuery((theme: Theme) =>
		theme.breakpoints.down("sm")
	);
	// Sprawdź, czy kod działa po stronie klienta
	if (typeof window === "undefined" || typeof document === "undefined") {
		return null;
	}

	return ReactDOM.createPortal(
		<Snackbar
			open={open}
			autoHideDuration={autoHide ? autoHide : 4000}
			onClose={onClose}
			anchorOrigin={{
				vertical: isMobile ? "bottom" : "top",
				horizontal: isMobile ? "center" : "right",
			}}
			sx={{
				position: "fixed",
				zIndex: 10000,
				top: isMobile ? undefined : "7px !important",
				right: isMobile ? undefined : "70px !important",
				bottom: isMobile ? "90px !important" : undefined,
			}}>
			<Alert
				severity={severity}
				onClose={onClose}>
				{message}
			</Alert>
		</Snackbar>,
		document.getElementById("snackbar-root")!
	);
};

export default ResponsiveSnackbar;
