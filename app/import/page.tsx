"use client";
import { Button } from "@mui/material";
import React from "react";
import { ImportP } from "@/server/actions";

const Import = () => {
	const crone = async () => {
		fetch(`/api/crone`, { method: "POST" });
		console.log("crone");
	};
	return (
		<>
			<Button onClick={() => ImportP()}>Import</Button>
			<Button onClick={() => crone()}>Crone job</Button>
		</>
	);
};

export default Import;
