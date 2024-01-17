import React from "react";
import { Card, Skeleton, CardContent, Box } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
const CardS = () => {
	return (
		<Card variant='outlined'>
			<CardContent>
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
			</CardContent>
		</Card>
	);
};

const LocCardsSkeleton = () => {
	return (
		<Grid
			container
			paddingTop={3}
			spacing={1}
			width={"100%"}>
			<Grid
				xs={12}
				sm={6}
				md={6}
				lg={4}
				xl={3}>
				<CardS />
			</Grid>
			<Grid
				xs={12}
				sm={6}
				md={6}
				lg={4}
				xl={3}>
				<CardS />
			</Grid>
			<Grid
				xs={12}
				sm={6}
				md={6}
				lg={4}
				xl={3}>
				<CardS />
			</Grid>
			<Grid
				xs={12}
				sm={6}
				md={6}
				lg={4}
				xl={3}>
				<CardS />
			</Grid>
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
