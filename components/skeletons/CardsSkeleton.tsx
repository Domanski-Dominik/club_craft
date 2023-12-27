import React from "react";
import { Card, Skeleton, CardContent } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";

const CardS = (
  <Card variant="outlined" sx={{ width: "90vw" }}>
    <CardContent
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <Skeleton animation="wave" height={40} width="40%" />

      <Skeleton animation="wave" height={30} width="100%" />
    </CardContent>
  </Card>
);

const CardsSkeleton = () => {
  return (
    <Grid container columns={1} rowSpacing={2} direction="column">
      <Grid xs={1}>{CardS}</Grid>
      <Grid xs={1}>{CardS}</Grid>
      <Grid xs={1}>{CardS}</Grid>
    </Grid>
  );
};

export default CardsSkeleton;
