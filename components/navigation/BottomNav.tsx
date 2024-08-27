"use client";
import * as React from "react";
import {
  Menu,
  MenuItem,
  BottomNavigationAction,
  BottomNavigation,
  Divider,
} from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HowToRegSharpIcon from "@mui/icons-material/HowToRegSharp";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
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

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    handleCloseMenu();
    router.push(`/${value}`);
  };
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    if (newValue === "add") {
      handleOpenMenu(event as React.MouseEvent<HTMLElement>);
    } else {
      router.push(`/${newValue}`);
    }
  };

  return (
    <>
      <BottomNavigation
        showLabels
        value={name}
        onChange={handleChange}
        sx={{
          width: "100vw",
          position: "fixed",
          bottom: 0,
          zIndex: 10,
          height: "80px",
          paddingBottom: 2,
        }}
        color={"primary"}>
        <BottomNavigationAction
          label="Klub"
          value="home"
          icon={<HomeOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Uczestnicy"
          value="participants"
          icon={<PeopleAltOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Dodaj"
          value="add"
          icon={<AddCircleOutlineOutlinedIcon />}
        />
        <BottomNavigationAction
          label="Obecność"
          value="locations"
          icon={<HowToRegSharpIcon />}
        />
        <BottomNavigationAction
          label="Statystyki"
          value="stats"
          icon={<LeaderboardIcon />}
        />
      </BottomNavigation>
      <Menu
        id="add-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}>
        <MenuItem onClick={() => handleMenuItemClick("add/onetime")}>
          Zajęcia jednorazowe
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("add/solo")}>
          Zajęcia indywidualne
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("add/group")}>
          Zajęcia grupowe
        </MenuItem>
        <MenuItem onClick={() => handleMenuItemClick("add")}>
          Uczestnika
        </MenuItem>
      </Menu>
    </>
  );
}
