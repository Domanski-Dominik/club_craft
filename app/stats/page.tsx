"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { Typography } from "@mui/material";

const Payments = () => {
	const { status } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

	if (status === "loading") return <Loading />;

	return <Typography variant='h2'>Już wkrótce!</Typography>;
};

export default Payments;
