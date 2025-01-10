"use client";
import Loading from "@/context/Loading";
import { Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
interface Props {
	params: Promise<{
		token: string;
	}>;
}
import React, { useEffect } from "react";

const VerifyEmail = async ({ params }: Props) => {
	const vtoken = (await params).token;
	const router = useRouter();
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(true);
	const [message, setMessage] = useState("");
	useEffect(() => {
		const VerifyUser = async () => {
			const response = await fetch("/api/auth/verifyEmail/token", {
				method: "POST",
				body: JSON.stringify({ token: vtoken }),
			});
			const data = await response.json();
			if (!data.error) {
				setSuccess(true);
				setLoading(false);
				setMessage(data.message);
			} else {
				setLoading(false);
				setMessage(data.error);
			}
		};
		VerifyUser();
	}, [vtoken]);
	if (loading) return <Loading />;
	return (
		<>
			{success ? (
				<Typography
					variant='h3'
					align='center'>
					{message}
				</Typography>
			) : (
				<Typography
					color={"red"}
					align='center'
					variant='h3'>
					{message}
				</Typography>
			)}
			<Button
				sx={{ mt: 3 }}
				variant='contained'
				onClick={() => router.push("/login")}>
				Wróc do strony logowania
			</Button>
		</>
	);
};

export default VerifyEmail;
