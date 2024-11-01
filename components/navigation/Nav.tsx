"use client";
import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import AccountCircle from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { signOut, useSession } from "next-auth/react";
import { ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useRouter } from "next/navigation";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsIcon from "@mui/icons-material/Settings";
import { Session } from "next-auth";

interface Props {
	session: Session | null;
}
const drawerWidth = 240;
const navItems = [
	{
		name: "Zarządzaj grupami",
		icon: <WidgetsIcon />,
		link: "/home/manageGroups",
	},
	{
		name: "Ustawienia",
		icon: <SettingsIcon />,
		link: "/settings",
	},
	// {
	// 	name: "Typy zajęć",
	// 	icon: <AppRegistrationIcon />,
	// 	link: "/home/manageSportTypes",
	// },
	//{ name: "Informacje", icon: <InfoIcon />, link: "/home/info" },
];

export default function TopNav(props: Props) {
	const router = useRouter();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

	const [mobileOpen, setMobileOpen] = React.useState(false);

	const handleDrawerToggle = () => {
		setMobileOpen((prevState) => !prevState);
	};

	const drawer = (
		<Box
			onClick={handleDrawerToggle}
			sx={{ textAlign: "center" }}>
			<Typography
				variant='h6'
				sx={{ my: 2 }}>
				Club Craft
			</Typography>
			<Divider />
			<List>
				{navItems.map((item) => (
					<ListItem
						key={item.name}
						onClick={() => router.push(item.link)}>
						<ListItemIcon>{item.icon}</ListItemIcon>
						<ListItemText primary={item.name} />
					</ListItem>
				))}
			</List>
		</Box>
	);

	const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar component='nav'>
				<Toolbar
					sx={{
						alignItems: "center",
						display: "flex",
						justifyContent: "space-between",
					}}>
					<IconButton
						color='inherit'
						aria-label='open drawer'
						edge='start'
						onClick={handleDrawerToggle}
						sx={{ mr: 2, display: { sm: "none" } }}>
						<MenuIcon />
					</IconButton>
					<Typography
						variant='h6'
						component='div'
						sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}>
						Club Craft
					</Typography>

					<Box sx={{ display: { xs: "none", sm: "block" } }}>
						{navItems.map((item) => (
							<Button
								startIcon={item.icon}
								key={item.name}
								sx={{ color: "#fff" }}
								onClick={() => router.push(item.link)}>
								{item.name}
							</Button>
						))}
					</Box>
					{props.session?.user ? (
						<div>
							<IconButton
								size='large'
								aria-label='account of current user'
								aria-controls='menu-appbar'
								aria-haspopup='true'
								onClick={handleMenu}
								color='inherit'>
								<AccountCircle />
							</IconButton>
							<Menu
								id='menu-appbar'
								anchorEl={anchorEl}
								anchorOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								keepMounted
								transformOrigin={{
									vertical: "top",
									horizontal: "right",
								}}
								open={Boolean(anchorEl)}
								onClose={handleClose}>
								<MenuItem
									onClick={() => {
										router.push("/profile");
										handleClose();
									}}>
									<ListItemIcon>
										<AccountCircleIcon />
									</ListItemIcon>
									<ListItemText>Profil</ListItemText>
								</MenuItem>

								<MenuItem
									onClick={() => {
										signOut();
										handleClose();
									}}>
									<ListItemIcon>
										<LogoutIcon />
									</ListItemIcon>
									<ListItemText>Wyloguj się</ListItemText>
								</MenuItem>
							</Menu>
						</div>
					) : (
						<></>
					)}
				</Toolbar>
			</AppBar>
			<nav>
				<Drawer
					variant='temporary'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": {
							boxSizing: "border-box",
							width: drawerWidth,
						},
					}}>
					{drawer}
				</Drawer>
			</nav>
		</Box>
	);
}
