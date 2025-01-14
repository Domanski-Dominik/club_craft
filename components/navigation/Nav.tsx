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
import { Collapse, ListItemIcon } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { usePathname, useRouter } from "next/navigation";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SportsIcon from "@mui/icons-material/Sports";
import { Session } from "next-auth";
import { useMediaQuery, Theme, Badge } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HowToRegSharpIcon from "@mui/icons-material/HowToRegSharp";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import WidgetsIcon from "@mui/icons-material/Widgets";
import SettingsIcon from "@mui/icons-material/Settings";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import GroupsIcon from "@mui/icons-material/Groups";
import { CountAwaitingParticipants } from "@/server/participant-actions";
import { isNumber } from "@mui/x-data-grid/internals";

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
	const pathname = usePathname();
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [mobileOpen, setMobileOpen] = React.useState(false);
	const [isAddOpen, setIsAddOpen] = React.useState(false); // Kontrola rozwinięcia opcji "Dodaj"
	const [awaitingCount, setAwaitingCount] = React.useState(0);

	const handleDrawerToggle = () => setMobileOpen((prev) => !prev);
	const handleMenu = (event: React.MouseEvent<HTMLElement>) =>
		setAnchorEl(event.currentTarget);
	const handleClose = () => setAnchorEl(null);
	const toggleAddMenu = () => setIsAddOpen((prev) => !prev);

	// Dodajemy media query, aby określić, czy jesteśmy na urządzeniu mobilnym
	const isMobile = useMediaQuery((theme: Theme) =>
		theme.breakpoints.down("sm")
	);
	const isActive = (link: string) => {
		if (link === "/calendar" && pathname.startsWith("/group")) return true;
		return pathname === link; // Sprawdza dokładne dopasowanie
	};
	const pushTo = (link: string) => {
		if (isMobile) {
			setMobileOpen(false);
		}
		router.push(link);
	};
	React.useEffect(() => {
		const fetchAwaitingCount = async () => {
			try {
				const response = await CountAwaitingParticipants(
					`${props.session?.user.club}`
				); // Upewnij się, że masz odpowiedni endpoint API
				if (isNumber(response)) {
					setAwaitingCount(response);
				}
			} catch (error) {
				console.error(
					"Błąd podczas pobierania liczby oczekujących uczestników:",
					error
				);
			}
		};

		fetchAwaitingCount();
	}, []);

	// Elementy BottomNav dostępne tylko na urządzeniach mobilnych
	const mobileNavItems = [
		{ label: "Klub", value: "home", icon: <HomeOutlinedIcon /> },
		{
			label: "Uczestnicy",
			value: "participants",
			icon: <PeopleAltOutlinedIcon />,
		},
		{ label: "Dodaj", value: "add", icon: <AddCircleOutlineOutlinedIcon /> },
		{ label: "Obecność", value: "calendar", icon: <HowToRegSharpIcon /> },
		{ label: "Statystyki", value: "stats", icon: <LeaderboardIcon /> },
	];

	// Drawer - elementy tylko dla mobilnych i desktopowych użytkowników
	const drawer = (
		<Box sx={{ textAlign: "center", height: "100%" }}>
			{/* Wyświetl nazwę aplikacji tylko na desktopie */}
			<Typography
				variant='h6'
				sx={{
					my: 2,
					display: "block",
				}}>
				Club Craft
			</Typography>
			{/* Elementy dolnej nawigacji tylko na telefonie */}
			{!isMobile && (
				<>
					<Divider />
					<List>
						{mobileNavItems.map((item) =>
							item.value === "add" ? (
								<React.Fragment key={item.value}>
									<ListItem disablePadding>
										<ListItemButton onClick={toggleAddMenu}>
											<ListItemIcon>{item.icon}</ListItemIcon>
											<ListItemText primary={item.label} />
											{isAddOpen ? <ExpandLess /> : <ExpandMore />}
										</ListItemButton>
									</ListItem>
									<Collapse
										in={isAddOpen}
										timeout='auto'
										unmountOnExit>
										<List
											component='div'
											disablePadding>
											<ListItem disablePadding>
												<ListItemButton
													sx={{ pl: 4 }}
													onClick={() => router.push("/add")}
													selected={isActive("/add")}>
													<ListItemIcon>
														<PersonAddIcon />
													</ListItemIcon>
													<ListItemText primary='Uczestnika' />
												</ListItemButton>
											</ListItem>
											<ListItem disablePadding>
												<ListItemButton
													sx={{ pl: 4 }}
													onClick={() => router.push("/add/group")}
													selected={isActive("/add/group")}>
													<ListItemIcon>
														<GroupAddIcon />
													</ListItemIcon>
													<ListItemText primary='Grupę' />
												</ListItemButton>
											</ListItem>
										</List>
									</Collapse>
								</React.Fragment>
							) : (
								<ListItem
									key={item.value}
									disablePadding>
									<ListItemButton
										onClick={() => pushTo(`/${item.value}`)}
										selected={isActive(`/${item.value}`)}>
										<ListItemIcon>{item.icon}</ListItemIcon>
										<ListItemText primary={item.label} />
									</ListItemButton>
								</ListItem>
							)
						)}
					</List>
				</>
			)}
			{/* Stałe elementy nawigacji */}
			<Divider />
			<List>
				{props.session?.user.role === "owner" && (
					<>
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => pushTo("/balance")}
								selected={isActive("/balance")}>
								<ListItemIcon>
									<ManageSearchIcon />
								</ListItemIcon>
								<ListItemText primary={"Zaległości"} />
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => pushTo("/awaiting")}
								selected={isActive("/awaiting")}>
								<ListItemIcon>
									{" "}
									<Badge
										badgeContent={awaitingCount}
										color='error'
										anchorOrigin={{
											vertical: "bottom",
											horizontal: "right",
										}}>
										<PendingActionsIcon />
									</Badge>
								</ListItemIcon>
								<ListItemText primary={"Oczekujący"} />
							</ListItemButton>
						</ListItem>
						<ListItem disablePadding>
							<ListItemButton
								onClick={() => pushTo("/home/coaches")}
								selected={isActive("/home/coaches")}>
								<ListItemIcon>
									<SportsIcon />
								</ListItemIcon>
								<ListItemText primary={"Prowadzący"} />
							</ListItemButton>
						</ListItem>
					</>
				)}
				{navItems.map((item) => (
					<ListItem
						key={item.name}
						disablePadding>
						<ListItemButton
							onClick={() => pushTo(item.link)}
							selected={isActive(item.link)}>
							<ListItemIcon>{item.icon}</ListItemIcon>
							<ListItemText primary={item.name} />
						</ListItemButton>
					</ListItem>
				))}
			</List>
		</Box>
	);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<AppBar position='fixed'>
				<Toolbar sx={{ justifyContent: "end" }}>
					{/* Drawer Toggle dla telefonu */}
					{props.session?.user && (
						<IconButton
							color='inherit'
							aria-label='open drawer'
							edge='start'
							onClick={handleDrawerToggle}
							sx={{ display: { xs: "block", sm: "none" } }}>
							<MenuIcon />
						</IconButton>
					)}
					{/* Wyśrodkowany tekst dla telefonu */}
					<Typography
						variant='h6'
						sx={{
							flexGrow: 1,
							textAlign: "center",
							display: { xs: "block", sm: "none" },
						}}>
						Club Craft
					</Typography>
					{!props.session?.user && (
						<Typography
							variant='h6'
							sx={{
								flexGrow: 1,
								textAlign: "center",
								display: { xs: "none", sm: "block" },
							}}>
							Club Craft
						</Typography>
					)}
					{/* Menu użytkownika */}
					{props.session?.user && (
						<>
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
						</>
					)}
				</Toolbar>
			</AppBar>
			{/* Drawer Persistent dla desktopu */}
			{props.session?.user && (
				<Drawer
					variant='persistent'
					open
					sx={{
						display: { xs: "none", sm: "block" },
						width: drawerWidth,
						flexShrink: 0,
						"& .MuiDrawer-paper": {
							width: drawerWidth,
							boxSizing: "border-box",
						},
					}}>
					{drawer}
				</Drawer>
			)}
			{/* Drawer tymczasowy dla telefonu */}
			{props.session?.user && (
				<Drawer
					variant='temporary'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					sx={{
						display: { xs: "block", sm: "none" },
						"& .MuiDrawer-paper": { width: drawerWidth },
					}}>
					{drawer}
				</Drawer>
			)}
		</Box>
	);
}
