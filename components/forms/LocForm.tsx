import React, { useState } from "react";
import {
  FormControl,
  TextField,
  InputLabel,
  Typography,
  Container,
  FormLabel,
  Button,
  Box,
} from "@mui/material";

import Grid from "@mui/material/Unstable_Grid2";
const LocForm = () => {
  const [newLoc, setNewLoc] = useState({
    name: "",
    street: "",
    city: "",
    postalCode: "",
    streetNr: "",
  });
  const handleSubmit = () => {};
  return (
    <>
      <Container>
        <Typography
          variant="h2"
          align="center"
          color="secondary"
          sx={{
            marginBottom: "1rem",
          }}>
          Utwórz Lokalizacje
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          sx={{ marginBottom: "2rem" }}>
          Dodaj nową lokalizację do swojego klubu!
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid
            container
            spacing={2}
            direction={"row"}
            sx={{ justifyContent: "center" }}>
            <Grid xs={11} md={15}>
              <FormControl fullWidth>
                <TextField
                  id={"outlined-basic"}
                  type="text"
                  value={newLoc.name}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, name: e.target.value })
                  }
                  label="Nazwa Lokalizacji"
                  variant="outlined"
                  required
                />
              </FormControl>
            </Grid>
            <Grid xs={8}>
              <FormControl fullWidth>
                <TextField
                  id={"outlined-basic"}
                  type="text"
                  value={newLoc.street}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, street: e.target.value })
                  }
                  label="Ulica"
                  variant="outlined"
                />
              </FormControl>
            </Grid>
            <Grid xs={3}>
              <FormControl fullWidth>
                <TextField
                  id={"outlined-basic"}
                  type="text"
                  value={newLoc.streetNr}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, streetNr: e.target.value })
                  }
                  label="Numer"
                  variant="outlined"
                />
              </FormControl>
            </Grid>
            <Grid xs={6}>
              <FormControl fullWidth>
                <TextField
                  id={"outlined-basic"}
                  type="text"
                  value={newLoc.city}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, city: e.target.value })
                  }
                  label="Miasto"
                  variant="outlined"
                />
              </FormControl>
            </Grid>
            <Grid xs={5}>
              <FormControl fullWidth>
                <TextField
                  id={"outlined-basic"}
                  type="text"
                  value={newLoc.postalCode}
                  onChange={(e) =>
                    setNewLoc({ ...newLoc, postalCode: e.target.value })
                  }
                  label="Kod pocztowy"
                  variant="outlined"
                />
              </FormControl>
            </Grid>
          </Grid>
          <Grid
            container
            sx={{ marginTop: "2rem", justifyContent: "center" }}
            columnSpacing={3}>
            <Grid>
              <Button variant="outlined" color="error" size="large">
                Analuj
              </Button>
            </Grid>
            <Grid>
              <Button
                variant="outlined"
                type="submit"
                color="success"
                size="large">
                Dodaj
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
    </>
  );
};

export default LocForm;
