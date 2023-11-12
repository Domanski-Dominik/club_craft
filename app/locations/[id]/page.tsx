"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import Loading from "@/context/Loading";
import DaysCard from "@/components/cards/DaysCard";
import { Group } from "@/types/type";

interface Props {
	params: {
		id: string;
	};
}
export default function Days({ params }: Props) {
	const [groups, setGroups] = useState<Group[] | []>([]);
	const router = useRouter();
	const locId = params.id;
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

	useEffect(() => {
		const fetchLoc = async (locId: string) => {
			try {
				const response = await fetch(`/api/loc/days/${locId}`, {
					method: "GET",
				});
				const data: Group[] = await response.json();
				console.log(data);
				setGroups(data);
			} catch (error) {
				console.log("Error", error);
			}
		};
		fetchLoc(locId);
	}, [session]);

	if (status === "loading") return <Loading />;

	return <>{params?.id}</>;
}
