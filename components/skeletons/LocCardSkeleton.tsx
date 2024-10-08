import React from "react";
import { Card, Skeleton, CardContent, Box } from "@mui/material";
import Grid from "@mui/material/Grid2";
const CardS = () => {
	return (
		<Grid size={{ xs: 12, sm: 6, md: 6, lg: 4, xl: 3 }}>
			<Card variant='outlined'>
				<CardContent
					style={{
						display: "flex",
						alignItems: "center",
					}}>
					<Box
						height={35}
						width={35}>
						<Skeleton
							variant='circular'
							height={35}
							width={35}
						/>
					</Box>
					<Box
						width={"100%"}
						ml={2}>
						<Skeleton
							animation='wave'
							height={40}
							width='50%'
						/>
						<Skeleton
							animation='wave'
							height={30}
							width='100%'
						/>
					</Box>
				</CardContent>
			</Card>
		</Grid>
	);
};

const LocCardsSkeleton = () => {
	return (
		<Grid
			container
			paddingTop={3}
			spacing={1}
			width={"100%"}>
			<CardS />
			<CardS />
			<CardS />
			<CardS />
		</Grid>
	);
};

export default LocCardsSkeleton;
/*
<Box sx={{ minWidth: 275, "& > :not(style)": { marginBottom: "20px" } }}>
			<CardS />
			<CardS />
			<CardS />
			<CardS />
		</Box>
*/
