import React from "react";
import { Card, Skeleton, CardContent } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

const CardS = () => {
	return (
		<Card variant='outlined'>
			<CardContent
				style={{
					width: "100%",
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
				}}>
				<Skeleton
					animation='wave'
					height={40}
					width='40%'
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

const CardsSkeleton = () => {
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

export default CardsSkeleton;
