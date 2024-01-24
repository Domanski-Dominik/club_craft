"use client";
import ChangePassword from "@/components/forms/ChangePassword";
import ResetPasswordForm from "@/components/forms/ResetPassword";
import { Button, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ResetPasswordPageProps {
	searchParams: { [key: string]: string | string[] | undefined };
}

const ResetPasswordPage = ({ searchParams }: ResetPasswordPageProps) => {
	const [data, setData] = useState<any>({});
	const router = useRouter();
	useEffect(() => {
		const check = async () => {
			if (searchParams.token) {
				const response = await fetch(
					`/api/register/resetPassword/${searchParams.token}`
				);
				const data = await response.json();
				setData(data);
			}
		};
		check();
	}, []);
	if (data.id) {
		return <ChangePassword user={data} />;
	} else if (data.error) {
		return (
			<>
				<Typography
					align='center'
					variant='h4'
					color={"red"}>
					{data.error}
				</Typography>
				<Button
					variant='contained'
					onClick={() => {
						router.push("/reset");
						setData({});
					}}>
					Zacznij od nowa
				</Button>
			</>
		);
	} else {
		return <ResetPasswordForm />;
	}
};

export default ResetPasswordPage;
