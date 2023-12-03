"use client";

import LocForm from "@/components/forms/LocForm";
import GoBack from "@/components/GoBack";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";

const CreateLoc = () => {
	const { status } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	if (status === "loading") return <Loading />;
	if (status === "authenticated") {
		return (
			<>
				<LocForm />
			</>
		);
	}
};

export default CreateLoc;
