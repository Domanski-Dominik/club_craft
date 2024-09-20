"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import Loading from "@/context/Loading";
import ParticipantList from "@/components/participants/ParticipantList";
import { sortAndAddNumbers } from "@/functions/sorting";
import StandardError from "@/components/errors/Standard";

interface Props {
	params: {
		id: string;
	};
}
//TODO: zrobić zabezpieczenia by nie móc podglądać grup nie ze swojego klubu
const Group = ({ params }: Props) => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const groupId = parseInt(params.id, 10);
	const clubInfo = useQuery({
		queryKey: ["clubInfo"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/club/${session?.user.id}`).then((res) => res.json()),
	});
	const participants = useQuery({
		queryKey: ["participants", params.id],
		queryFn: () =>
			fetch(`/api/participant/${params.id}`).then((res) => res.json()),
		select: (data) => sortAndAddNumbers(data, params.id, "normal"),
	});
	const group = useQuery({
		queryKey: ["group", params.id],
		queryFn: () =>
			fetch(`/api/groups/gr/${params.id}`).then((res) => res.json()),
	});
	//console.log(group.data);
	if (status === "loading" || participants.isLoading) return <Loading />;
	if (participants.isError || participants.data.length === 0)
		return (
			<StandardError
				message={
					participants.isError
						? participants.error.message
						: "Nie znaleziono uczestników"
				}
				addParticipants={true}
			/>
		);
	if (group.isError)
		return (
			<StandardError
				message={group.error.message}
				addParticipants={true}
			/>
		);
	return (
		<>
			{participants.data.length > 0 && group.isSuccess ? (
				<Box
					sx={{
						height: "calc(100vh - 180px)",
						width: "calc(100% - 10px)",
						backgroundColor: "white",
						borderRadius: 4,
						mb: 1,
						px: 1,
					}}>
					<ParticipantList
						participants={participants.data}
						groupId={groupId}
						group={group.data}
						clubInfo={clubInfo.isSuccess ? clubInfo.data : {}}
						isOwner={session.user.role === "owner"}
					/>
				</Box>
			) : (
				<Loading />
			)}
		</>
	);
};

export default Group;
