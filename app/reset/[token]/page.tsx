import { useState, useEffect } from "react";
import Loading from "@/context/Loading";
import ChangePassword from "@/components/forms/ChangePassword";
import { Typography, Button } from "@mui/material";
import { checkResetToken } from "@/server/authorize";
import StandardError from "@/components/errors/Standard";

interface Props {
	params: Promise<{
		token: string;
	}>;
}

const ResetPasswordtoken = async ({ params }: Props) => {
	const rtoken = (await params).token;
	const data = await checkResetToken(rtoken);

	if ("error" in data)
		return (
			<>
				<StandardError
					message={data.error}
					redirectLink='/reset'
					redirectText='Zacznij od nowa'
				/>
			</>
		);

	return <ChangePassword user={data} />;
};

export default ResetPasswordtoken;
/*
{success ? (
				<ChangePassword user={data} />
			) : (
				<>
					<Typography
						align='center'
						variant='h4'
						mb={2}
						color={"red"}>
						{data.error}
					</Typography>
					<Button
						variant='contained'
						onClick={() => {
							router.push("/reset");
						}}>
						Zacznij od nowa
					</Button>
				</>
			)}
*/
