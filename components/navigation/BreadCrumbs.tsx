import React from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { useRouter } from "next/navigation";

interface Props {
	pages: { id: number; title: string; path: string }[];
}

const MobileNavigation = ({ pages }: Props) => {
	const router = useRouter();
	return (
		<Box
			sx={{
				position: "absolute",
				marginBottom: 1,
				top: "4rem",
				left: "0.5rem",
				maxWidth: "95vw",
			}}>
			<Breadcrumbs
				aria-label='breadcrumb'
				separator='/'>
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
