"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import ChangePassword from "@/components/forms/ChangePassword";
import { Typography, Button } from "@mui/material";
interface Props {
	params: Promise<{
		token: string;
	}>;
}

const ResetPasswordtoken = async ({ params }: Props) => {
	const rtoken = (await params).token;
	const router = useRouter();
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any>({});
	useEffect(() => {
		const VerifyUser = async () => {
			const response = await fetch(`/api/user/resetPassword/${rtoken}`);
			const data = await response.json();
			if (!data.error) {
				setSuccess(true);
				setLoading(false);
				setData(data);
			} else {
				setLoading(false);
				setData(data);
			}
		};
		VerifyUser();
	}, [rtoken]);
	if (loading) return <Loading />;
	return (
		<>
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
		</>
	);
};

export default ResetPasswordtoken;
