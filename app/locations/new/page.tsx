"use client";

import LocForm from "@/components/forms/LocForm";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import { Location } from "@/types/type";

const CreateLoc = () => {
	const { status } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	const CreateLoc: Location = {
		id: 0,
		name: "",
		street: "",
		city: "",
		postalCode: "",
		streetNr: "",
		club: "",
	};
	if (status === "loading") return <Loading />;
	if (status === "authenticated") {
		return (
			<>
				<LocForm
					locInfo={CreateLoc}
					type={"create"}
				/>
			</>
		);
	}
};

export default CreateLoc;
