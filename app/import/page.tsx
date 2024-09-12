"use client";
import { Box, Button, TextField } from "@mui/material";
import React, { useState } from "react";
import {
	DeleteInactiveP,
	ImportP,
	UpdateRegulaminForClub,
} from "@/server/actions";

const Import = () => {
	const crone = async () => {
		fetch(`/api/crone`, { method: "POST" });
		console.log("crone");
	};
	const [clubName, setClubName] = useState("");
	return (
		<Box
			sx={{
				height: "80vh",
				display: "flex",
				flexDirection: "column",
				justifyContent: "space-around",
			}}>
			<Button
				onClick={() => ImportP()}
				variant='contained'>
				Import
			</Button>
			<Button
				onClick={() => crone()}
				variant='contained'>
				Crone job
			</Button>
			<Box>
				<TextField
					value={clubName}
					onChange={(e) => setClubName(e.target.value)}
				/>
				<Button
					onClick={() => DeleteInactiveP(clubName)}
					variant='contained'>
					Usuń nieaktywnych
				</Button>
				<Button
					onClick={() => UpdateRegulaminForClub(clubName)}
					variant='contained'>
					Zmień regulamin na niepodpisany
				</Button>
			</Box>
		</Box>
	);
};

export default Import;
