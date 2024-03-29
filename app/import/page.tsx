"use client";
import { Button } from "@mui/material";
import React from "react";
import { ImportP } from "@/server/actions";

const Import = () => {
	return <Button onClick={() => ImportP()}>Import</Button>;
};

export default Import;
