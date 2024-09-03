"use client";

import LocForm from "@/components/forms/LocForm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { useQuery } from "@tanstack/react-query";
import StandardError from "@/components/errors/Standard";

interface Props {
	params: {
		id: string;
	};
}

const EditLoc = ({ params }: Props) => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const loc = useQuery({
		queryKey: ["loc", params.id],
		enabled: !!session,
		queryFn: () => fetch(`/api/loc/${params.id}`).then((res) => res.json()),
	});
	if (status === "loading" || loc.isFetching) return <Loading />;
	if (loc.isError || loc.data === undefined)
		return (
			<StandardError
				addParticipants={false}
				message={
					loc.isError ? loc.error.message : "Błąd przy pobieraniu lokalizacji"
				}
			/>
		);
	if (loc.data) {
		return (
			<LocForm
				locInfo={loc.data}
				type={"edit"}
			/>
		);
	}
};

export default EditLoc;
