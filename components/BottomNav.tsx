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
import { IconButton } from "@mui/material";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material";

export default function BottomNav() {
	const [value, setValue] = React.useState("locations");
	const router = useRouter();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleChange = (event: React.SyntheticEvent, newValue: string) => {
		setValue(newValue);
		router.push(`/${newValue}`);
	};

	return (
		<BottomNavigation
			value={value}
			onChange={handleChange}
			sx={{
				width: "100vw",
				position: "fixed",
				bottom: 0,
				zIndex: 50,
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
			{/*<IconButton
				id='basic-button'
				aria-controls={open ? "basic-menu" : undefined}
				aria-haspopup='true'
				aria-expanded={open ? "true" : undefined}
				onClick={handleClick}>
				<AddCircleOutlineOutlinedIcon />
			</IconButton>
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}>
				<MenuItem onClick={handleClose}>Profile</MenuItem>
				<MenuItem onClick={handleClose}>My account</MenuItem>
				<MenuItem onClick={handleClose}>Logout</MenuItem>
			</Menu>*/}
			<BottomNavigationAction
				label='Dodaj'
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
