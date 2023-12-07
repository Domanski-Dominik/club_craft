import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

interface Page {
	id: number;
	title: string;
	path: string;
}

const MobileNavigation = ({ pages }: { pages: Page[] }) => {
	const router = useRouter();
	return (
		<Box sx={{ position: "absolute", top: "4.5rem", left: "1rem" }}>
			<Breadcrumbs
				separator={<NavigateNextIcon fontSize='small' />}
				aria-label='breadcrumb'>
				{pages.map((page, index) => {
					if (index === pages.length - 1) {
						return (
							<Typography
								color='primary'
								key={page.id}>
								{page.title}
							</Typography>
						);
					} else {
						return (
							<Link
								underline='hover'
								color='inherit'
								onClick={() => router.push(page.path)}
								key={page.id}>
								{page.title}
							</Link>
						);
					}
				})}
			</Breadcrumbs>
		</Box>
	);
};

export default MobileNavigation;
