"use client";
import * as React from "react";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HowToRegSharpIcon from "@mui/icons-material/HowToRegSharp";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function BottomNav() {
	const router = useRouter();
	const pathname = usePathname();
	const pathParts = pathname.split("/");
	const firstPathPart = pathParts[1];
	const name = firstPathPart === "group" ? "locations" : firstPathPart;
	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		router.push(`/${newValue}`);
	};

	return (
		<BottomNavigation
			showLabels
			value={name}
			onChange={handleChange}
			sx={{
				width: "100vw",
				position: "fixed",
				bottom: 0,
				zIndex: 20,
				height: "80px",
				paddingBottom: 2,
			}}
			color={"primary"}>
			<BottomNavigationAction
				label='Klub'
				value='home'
				icon={<HomeOutlinedIcon />}
			/>
			<BottomNavigationAction
				label='Uczestnicy'
				value='participants'
				icon={<PeopleAltOutlinedIcon />}
			/>
			<BottomNavigationAction
				label='Nowy'
				value='add'
				icon={<AddCircleOutlineOutlinedIcon />}
			/>
			<BottomNavigationAction
				label='Obecność'
				value='locations'
				icon={<HowToRegSharpIcon />}
			/>
			<BottomNavigationAction
				label='Płatności'
				value='payments'
				icon={<PaidOutlinedIcon />}
			/>
		</BottomNavigation>
	);
}
