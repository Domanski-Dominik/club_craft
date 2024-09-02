"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import GroupForm from "@/components/forms/GroupForm";
interface Props {
	params: {
		id: string;
	};
}
const EditClass = ({ params }: Props) => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const clubInfo = useQuery({
		queryKey: ["clubInfo"],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/club/${session?.user.id}`).then((res) => res.json()),
	});
	const locs = useQuery({
		queryKey: ["locs"],
		enabled: !!session,
		queryFn: () =>
			fetch(
				`/api/loc/club/${session?.user.club}/${session?.user.role}/${session?.user.id}`
			).then((res) => res.json()),
	});
	const group = useQuery({
		queryKey: ["group", `${params.id}`],
		enabled: !!session,
		queryFn: () =>
			fetch(`/api/groups/gr/${params.id}`).then((res) => res.json()),
	});
	if (locs.isSuccess && clubInfo.isSuccess && group.isSuccess)
		return (
			<GroupForm
				clubInfo={clubInfo.data}
				locs={locs.data.length > 0 ? locs.data : []}
				user={session?.user}
				groupInfo={group.data}
				edit={true}
			/>
		);
};

export default EditClass;
