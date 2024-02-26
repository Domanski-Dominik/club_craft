import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { DialogPresentType } from "@/types/type";
import { Participant } from "@/types/type";
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Autocomplete,
	Typography,
} from "@mui/material";

interface Option {
	label: string;
	id: number;
}

const DialogPresent: React.FC<DialogPresentType> = ({ onClose, open }) => {
	const [participants, setParticipants] = useState<Participant[] | []>([]);
	const [selected, setSelected] = useState<Option | null>(null);
	const [options, setOptions] = useState<Option[] | []>([]);
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(true);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	useEffect(() => {
		const fetchParticipants = async () => {
			if (session?.user && status === "authenticated") {
				const response = await fetch(
					`/api/participant/all/${session.user.role}/${session.user.club}`,
					{
						method: "GET",
					}
				);
				const data: Participant[] | { error: string } = await response.json();

				if (Array.isArray(data)) {
					if (data.length > 0) {
						const opt = data.map((p: Participant) => {
							return {
								label: `${p.lastName} ${p.firstName}`,
								id: p.id,
							};
						});

						setOptions(opt);
						setError("");
						setParticipants(data);
						setLoading(false);
					} else {
						setError("Pobrana tablica jest pusta");
					}
				} else {
					setError(data.error);
				}
				setLoading(false);
			}
		};
		fetchParticipants();
	}, [session]);
	const handleClose = () => {
		onClose(null);
	};
	const handleOptionClick = (value: string) => {
		if (value === "yes") {
			const selectedPrt = participants.find((p) => p.id === selected?.id);
			if (selectedPrt) {
				onClose(selectedPrt);
				setSelected(null);
			} else {
				onClose(null);
			}
		} else {
			onClose(null);
		}
	};
	const handleAutocompleteChange = (event: any, newValue: Option | null) => {
		setSelected(newValue);
		//console.log(selected);
	};
	return (
		<Dialog
			open={open}
			onClose={handleClose}>
			<DialogTitle>Wyszukaj uczestników którzy odrabiają zajęcia</DialogTitle>
			<DialogContent dividers>
				{error !== "" && <Typography>{error}</Typography>}
				<Autocomplete
					value={selected}
					//multiple
					isOptionEqualToValue={(option, value) => option.id === value.id}
					onChange={handleAutocompleteChange}
					options={options.sort((a, b) => -b.label.localeCompare(a.label))}
					groupBy={(option) => option.label[0]}
					getOptionLabel={(option) => option.label}
					renderInput={(params) => (
						<TextField
							{...params}
							label='Uczestnicy'
						/>
					)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={() => handleOptionClick("no")}>Anuluj</Button>
				<Button onClick={() => handleOptionClick("yes")}>Dodaj</Button>
			</DialogActions>
		</Dialog>
	);
};

export default DialogPresent;
