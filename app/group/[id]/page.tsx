"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import Loading from "@/context/Loading";
import MobileNavigation from "@/components/navigation/BreadCrumbs";
import PolishDayName from "@/context/PolishDayName";
import { DataGrid, plPL, GridApi, GridFooter } from "@mui/x-data-grid";
import { Box } from "@mui/material";

const rows = [
	{ id: 1, firstname: "John", lastName: "Doe" },
	{ id: 2, firstname: "Jane", lastName: "Smith" },
	{ id: 3, firstname: "Tom", lastName: "Brown" },
];
interface Props {
	params: {
		id: string;
	};
}

const Group = ({ params }: Props) => {
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [list, setList] = useState(null);
	const [allLocs, setAllLocs] = useState();
	const [pages, setPages] = useState([
		{ id: 1, title: "Lokalizacje", path: "/locations" },
	]);
	const { status, data: session } = useSession({
		required: true,
		onUnauthenticated() {
			redirect("/login");
		},
	});

	useEffect(() => {
		const fetchParticipants = async () => {
			try {
				const response = await fetch(`/api/participant/${params.id}`, {
					method: "GET",
				});
				if (response.ok) {
					console.log(response);
				}
			} catch (error) {
				console.log(error);
			}
		};

		if (params?.id) fetchParticipants();
	}, [params.id]);

	useEffect(() => {
		const loadName = async (grId: string) => {
			try {
				const response = await fetch(`/api/gr/${grId}`, { method: "GET" });
				if (response.ok) {
					const group = await response.json();
					console.log(group);
					const dayName = PolishDayName(group.dayOfWeek);
					setPages([
						...pages,
						{
							id: 2,
							title: `${group.locationName}`,
							path: `/locations/${group.locationId}`,
						},
						{
							id: 3,
							title: `${dayName}`,
							path: `/locations/${group.locationId}/${group.dayOfWeek}`,
						},
						{
							id: 4,
							title: `${group.name}`,
							path: `group/${group.id}`,
						},
					]);
				}
			} catch (error) {
				console.log("Error", error);
			}
		};
		loadName(params.id);
	}, [params.id]);

	if (status === "loading") return <Loading />;

	return (
		<>
			<MobileNavigation pages={pages} />
			<Box sx={{ position: "absolute", top: "8rem", minWidth: "95vw" }}>
				<DataGrid
					columns={[
						{
							field: "lastName",
							headerName: "Nazwisko",
							minWidth: 130,
							maxWidth: 150,
						},
						{ field: "firstName", headerName: "Imię", minWidth: 120 },
						{ field: "presence", headerName: "Obecność" },
					]}
					rows={rows}
					autoHeight
					localeText={plPL.components.MuiDataGrid.defaultProps.localeText}
					autoPageSize
					disableColumnMenu
					hideFooterPagination
				/>
			</Box>
		</>
	);
};

export default Group;
