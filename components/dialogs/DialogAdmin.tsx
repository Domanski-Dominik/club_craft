import { DialogDeleteType } from "@/types/type";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Typography,
} from "@mui/material";
import { useChangeRole } from "@/hooks/coachesHooks";

const DialogAdmin: React.FC<DialogDeleteType> = ({ onClose, open, row }) => {
	const [error, setError] = useState("");
	const changeRole = useChangeRole();
	const queryClient = useQueryClient();
	const handleClose = () => {
		onClose("no");
	};
	const handleOptionClick = (value: string) => {
		onClose(value);
	};
	if (row === null) {
		return null;
	}
	const changeRoleClick = async (role: string) => {
		const message = await changeRole.mutateAsync({
			userId: row.id,
			role: role,
		});
		if (!message.error) {
			row.role = message.role;
			queryClient.invalidateQueries({
				queryKey: ["coaches"],
				refetchType: "all",
			});
			setError("");
		} else {
			setError(message.error);
		}
	};
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>
				<Typography sx={{ fontSize: 20 }}>
					{" "}
					Uprawnienia: <br />
					<span style={{ fontWeight: "bold" }}>
						{" "}
						{row.name} {row.surname}
					</span>
					{error !== "" && (
						<>
							<br />
							<span style={{ fontSize: 15, color: "red" }}>{error}</span>
						</>
					)}
				</Typography>
			</DialogTitle>
			<DialogContent dividers>
				<Typography
					variant='h5'
					align='center'
					color={row.role === "owner" ? "green" : "black"}>
					{row.role === "owner" ? "Administrator" : "Trener"}
				</Typography>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={() => changeRoleClick("owner")}
					disabled={row.role === "owner"}
					variant='contained'>
					Administrator
				</Button>
				<Button
					onClick={() => changeRoleClick("coach")}
					disabled={row.role !== "owner"}
					variant='contained'>
					trener
				</Button>
				<Button
					onClick={() => handleOptionClick("yes")}
					variant='outlined'>
					Zamknij
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogAdmin;
