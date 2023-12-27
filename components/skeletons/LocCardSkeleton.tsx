import React from "react";
import { Card, Skeleton, CardContent, Box } from "@mui/material";

const LocCardsSkeleton = () => {
  return (
    <Box sx={{ minWidth: 275, "& > :not(style)": { marginBottom: "20px" } }}>
      <Card variant="outlined" sx={{ width: "81vw" }}>
        <CardContent>
          <Skeleton animation="wave" height={40} width="50%" />

          <Skeleton animation="wave" height={30} width="100%" />
        </CardContent>
      </Card>
      <Card variant="outlined" sx={{ width: "81vw" }}>
        <CardContent>
          <Skeleton animation="wave" height={40} width="50%" />

          <Skeleton animation="wave" height={30} width="100%" />
        </CardContent>
      </Card>
    </Box>
  );
};

export default LocCardsSkeleton;
