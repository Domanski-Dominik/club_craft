"use client";
import Loading from "@/context/Loading";
import { User } from "@/context/User";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const ProfilPage = () => {
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});
	if (status === "loading") return <Loading />;
	return <User id={session?.user.id} />;
};

export default ProfilPage;
