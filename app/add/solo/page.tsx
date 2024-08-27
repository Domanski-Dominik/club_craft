"use client";

//TODO: handleSubmit i schemat prisma
//      sprawdzenie formularza dla przerw i terminów

import React, { useEffect, useState } from "react";
import {
  StyledAccordionSummary,
  StyledAccordionDetails,
  StyledAccordionSummaryNoExpand,
  Stack2,
  TypographyStack,
  StyledSwitch,
  TextFieldStack,
} from "@/components/styled/StyledComponents";
import {
  Accordion,
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  styled,
  Button,
  Collapse,
  Stack,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import pl from "date-fns/locale/pl";
import DialogLoc from "@/components/dialogs/DialogLoc";

const colorsOptions = [
  { value: "#3788d8", label: "Niebieski" },
  { value: "#228B22", label: "Zielony" },
  { value: "#9400D3", label: "Fioletowy" },
  { value: "#DC143C", label: "Czerwony" },
  { value: "#FFD700", label: "Złoty" },
  { value: "#FF8C00", label: "Pomarańczowy" },
  { value: "#00ffc8", label: "Cyjan" },
  { value: "#f200ff", label: "Różowy" },
];
const daysOfWeekOptions = [
  { value: 1, label: "Poniedziałek" },
  { value: 2, label: "Wtorek" },
  { value: 3, label: "Środa" },
  { value: 4, label: "Czwartek" },
  { value: 5, label: "Piątek" },
  { value: 6, label: "Sobota" },
  { value: 0, label: "Niedziela" },
];
const BoxLoc = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "100%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50%",
  },
  alignContent: "center",
  justifyContent: "center",
  justifyItems: "center",
  display: "flex",
}));
type Break = {
  name: string;
  begin: Date | null;
  end: Date | null;
};
type Term = {
  dayOfWeek: number;
  locId: number | string;
  timeS: Date | null;
  timeE: Date | null;
};
type FormData = {
  color: string;
  prtCount: string;
  locId: string;
  signInfo: string;
  firstLesson: Date | null;
  lastLesson: Date | null;
  diffrentPlaces: boolean;
  breaks: Break[];
  terms: Term[];
  price: string;
  payOption: string;
  clientsPay: string;
  xClasses: string;
  club: string;
  type: string;
  coach: string;
  prt: string;
};
const AddClass = () => {
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const clubInfo = useQuery({
    queryKey: ["clubInfo"],
    enabled: !!session,
    queryFn: () =>
      fetch(`/api/club/${session?.user.id}`).then((res) => res.json()),
  });
  const locs = useQuery({
    queryKey: ["locs"],
    enabled: !!session,
    queryFn: () =>
      fetch(
        `/api/loc/club/${session?.user.club}/${session?.user.role}/${session?.user.id}`
      ).then((res) => res.json()),
  });
  const [openDialogLoc, setOpenDialogLoc] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    color: "#3788d8",
    prtCount: "0",
    locId: "",
    signInfo: "",
    firstLesson: null,
    lastLesson: null,
    diffrentPlaces: false,
    breaks: [],
    terms: [{ dayOfWeek: 1, timeE: null, timeS: null, locId: "" }],
    price: "",
    payOption: "za miesiąc",
    clientsPay: "co miesiąc",
    xClasses: "",
    club: "",
    type: "group",
    coach: "",
    prt: "",
  });
  const [errors, setErrors] = useState({
    server: "",
    name: "",
    locId: "",
    firstLesson: "",
    lastLesson: "",
    terms: "",
    price: "",
    xClasses: "",
    breaks: [],
    termsErrors: [],
  });
  useEffect(() => {
    if (clubInfo.data !== undefined) {
      setFormData({
        ...formData,
        payOption: clubInfo.data.optionGroup,
        price: clubInfo.data.paymentGroup,
        club: clubInfo.data.name,
      });
    }
  }, [clubInfo.data]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleBreakChange = (
    index: number,
    field: keyof Break,
    newValue: any
  ) => {
    const updatedBreaks = formData.breaks.map((b, i) => {
      if (i === index) {
        return { ...b, [field]: newValue };
      }
      return b;
    });
    setFormData({ ...formData, breaks: updatedBreaks });
  };
  const handleTermChange = (
    index: number,
    field: keyof Term,
    newValue: any
  ) => {
    console.log(newValue);
    const updatedTerms = formData.terms.map((b, i) => {
      if (i === index) {
        return { ...b, [field]: newValue };
      }
      return b;
    });
    setFormData({ ...formData, terms: updatedTerms });
  };
  const addBreak = () => {
    setFormData({
      ...formData,
      breaks: [...formData.breaks, { name: "", begin: null, end: null }],
    });
  };
  const addTerm = () => {
    setFormData({
      ...formData,
      terms: [
        ...formData.terms,
        { dayOfWeek: 1, timeE: null, timeS: null, locId: "" },
      ],
    });
  };
  const removeBreak = (index: number) => {
    const updatedBreaks = formData.breaks.filter((_, i) => i !== index);
    setFormData({ ...formData, breaks: updatedBreaks });
  };
  const removeTerm = (index: number) => {
    const updatedTerms = formData.terms.filter((_, i) => i !== index);
    if (updatedTerms.length === 1) {
      setFormData({ ...formData, terms: updatedTerms, diffrentPlaces: false });
    } else {
      setFormData({ ...formData, terms: updatedTerms });
    }
  };
  console.log(clubInfo.data);
  console.log(formData);
  const validate = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (formData.locId === "") {
      newErrors.locId = "Proszę wybrać lokalizację";
      valid = false;
    } else {
      newErrors.locId = "";
    }

    if (formData.firstLesson === null) {
      newErrors.firstLesson = "Wybierz datę";
      valid = false;
    } else {
      newErrors.firstLesson = "";
    }

    if (formData.lastLesson === null) {
      newErrors.lastLesson = "Wybierz datę";
      valid = false;
    } else {
      newErrors.lastLesson = "";
    }

    if (formData.terms.length < 1) {
      newErrors.terms = "Wybierz minimum 1 termin zajęć";
      valid = false;
    } else {
      newErrors.terms = "";
    }

    if (formData.price === "") {
      newErrors.price = "Podaj cenę";
      valid = false;
    } else {
      newErrors.price = "";
    }

    if (formData.clientsPay === "co x zajęć" && formData.xClasses === "") {
      newErrors.xClasses = "Podaj ilość zajęć";
      valid = false;
    } else {
      newErrors.xClasses = "";
    }

    setErrors(newErrors);
    return valid;
  };
  const handleSubmit = async () => {
    const isOk = validate();
    console.log(isOk);
  };
  return (
    <Box sx={{ width: "calc(100% - 20px)" }}>
      <Accordion expanded={true}>
        <StyledAccordionSummaryNoExpand>
          <Typography variant="h6" color="white">
            Ogólne dane
          </Typography>
        </StyledAccordionSummaryNoExpand>
        <StyledAccordionDetails>
          <Stack2>
            <TypographyStack>Kolor:</TypographyStack>
            <Box width="50%">
              <FormControl fullWidth>
                <InputLabel size="small" id="color-label">
                  Kolor
                </InputLabel>
                <Select
                  labelId="color-label"
                  id="color"
                  name="color"
                  label="Kolor"
                  value={formData.color}
                  onChange={handleSelectChange}
                  size="small"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                      },
                    },
                  }}>
                  {colorsOptions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      <div
                        style={{
                          width: "12px",
                          height: "12px",
                          marginRight: "8px",
                          backgroundColor: c.value,
                          border: "1px solid #ddd",
                          display: "inline-block",
                        }}></div>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack2>
          <Collapse in={!formData.diffrentPlaces}>
            <Divider variant="middle" />
            <Stack2>
              <TypographyStack>Lokalizacja:</TypographyStack>
              <Box
                width="50%"
                flexWrap="wrap"
                flexDirection="row"
                display="flex">
                <BoxLoc>
                  <FormControl fullWidth sx={{ mp: 1, mt: 1 }}>
                    <InputLabel size="small" id="loc-label">
                      Lokalizacja
                    </InputLabel>
                    <Select
                      required
                      labelId="loc-label"
                      id="loc"
                      name="locId"
                      size="small"
                      label="Lokalizacja"
                      value={formData.locId}
                      onChange={handleSelectChange}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                          },
                        },
                      }}>
                      {locs.isSuccess &&
                        locs.data.map((loc: any) => (
                          <MenuItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </BoxLoc>
                <BoxLoc>
                  <Button
                    sx={{ mt: 1, mx: 1 }}
                    variant="contained"
                    size="small"
                    onClick={() => setOpenDialogLoc((prev) => !prev)}
                    startIcon={<AddIcon />}>
                    Nowa
                  </Button>
                </BoxLoc>
              </Box>
            </Stack2>
            <Typography align="center" color="red">
              {errors.locId}
            </Typography>
          </Collapse>
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Prowadzący:</TypographyStack>
            <Box width="50%">
              <FormControl fullWidth>
                <InputLabel size="small" id="coach-label">
                  Prowadzący
                </InputLabel>
                <Select
                  labelId="coach-label"
                  id="coach"
                  name="coach"
                  label="Prowadzący"
                  value={formData.coach}
                  onChange={handleSelectChange}
                  size="small"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                      },
                    },
                  }}>
                  {colorsOptions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack2>
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Uczestnik</TypographyStack>
            <Box width="50%">
              <FormControl fullWidth>
                <InputLabel size="small" id="prt-label">
                  Uczestnik
                </InputLabel>
                <Select
                  labelId="prt-label"
                  id="prt"
                  name="prt"
                  label="Uczestnik"
                  value={formData.coach}
                  onChange={handleSelectChange}
                  size="small"
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                      },
                    },
                  }}>
                  {colorsOptions.map((c) => (
                    <MenuItem key={c.value} value={c.value}>
                      {c.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack2>
        </StyledAccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <StyledAccordionSummary>
          <Typography variant="h6" color="white">
            Harmonogram
          </Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Stack2>
            <TypographyStack>Pierwsze zajęcia:</TypographyStack>
            <Box width="50%">
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={pl}>
                <DatePicker
                  label="Pierwsze zajęcia"
                  value={formData.firstLesson}
                  slotProps={{ textField: { size: "small" } }}
                  onChange={(newValue) => {
                    if (newValue)
                      setFormData({ ...formData, firstLesson: newValue });
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Stack2>
          <Typography align="center" color="red">
            {errors.firstLesson}
          </Typography>
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Ostatnie zajęcia:</TypographyStack>
            <Box width="50%">
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={pl}>
                <DatePicker
                  label="Ostatnie zajęcia"
                  slotProps={{ textField: { size: "small" } }}
                  value={formData.lastLesson}
                  minDate={
                    formData.firstLesson ? formData.firstLesson : new Date()
                  }
                  onChange={(newValue) => {
                    if (newValue)
                      setFormData({ ...formData, lastLesson: newValue });
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Stack2>
          <Typography align="center" color="red">
            {errors.lastLesson}
          </Typography>
          {formData.breaks.map((b, index) => (
            <div key={index}>
              <Divider variant="middle" />
              <Stack2>
                <TypographyStack sx={{ display: "flex", alignItems: "center" }}>
                  Przerwa {index + 1}:{" "}
                  <DeleteIcon
                    color="error"
                    sx={{ ml: 2 }}
                    onClick={() => removeBreak(index)}
                  />
                </TypographyStack>
                <TextFieldStack
                  label="Nazwa przerwy"
                  value={b.name}
                  onChange={(e) =>
                    handleBreakChange(index, "name", e.target.value)
                  }
                  sx={{ width: "50%" }}
                />
              </Stack2>
              <Stack2>
                <Box width="50%">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <DatePicker
                      label="Data początku"
                      value={b.begin}
                      minDate={formData.firstLesson || new Date()}
                      onChange={(newValue) =>
                        handleBreakChange(index, "begin", newValue)
                      }
                      slotProps={{ textField: { size: "small" } }}
                      sx={{ marginRight: 1 }}
                    />
                  </LocalizationProvider>
                </Box>
                <Box width="50%">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <DatePicker
                      label="Data końca"
                      value={b.end}
                      minDate={b.begin || formData.firstLesson || new Date()}
                      onChange={(newValue) =>
                        handleBreakChange(index, "end", newValue)
                      }
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                </Box>
              </Stack2>
            </div>
          ))}
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Przerwa:</TypographyStack>
            <Button variant="contained" onClick={addBreak}>
              Dodaj przerwę
            </Button>
          </Stack2>
          <Collapse in={formData.terms.length > 1}>
            <Divider variant="middle" />
            <Stack2>
              <TypographyStack>
                W różnych terminach są różne miejsca
              </TypographyStack>
              <StyledSwitch
                checked={formData.diffrentPlaces}
                onChange={() =>
                  setFormData({
                    ...formData,
                    diffrentPlaces: !formData.diffrentPlaces,
                  })
                }
              />
            </Stack2>
          </Collapse>
          {formData.terms.map((b, index) => (
            <div key={index}>
              <Divider variant="middle" />
              <Stack2>
                <TypographyStack sx={{ display: "flex", alignItems: "center" }}>
                  Termin {index + 1}:{" "}
                  <DeleteIcon
                    color="error"
                    sx={{ ml: 2 }}
                    onClick={() => removeTerm(index)}
                  />
                </TypographyStack>
                <Box width="50%">
                  <FormControl fullWidth>
                    <InputLabel id="dayOfWeek-label">Dzień tygodnia</InputLabel>
                    <Select
                      required
                      labelId="dayOfWeek-label"
                      id="dayOfWeek"
                      name="dayOfWeek"
                      size="small"
                      label="Dzień tygodnia"
                      value={b.dayOfWeek}
                      onChange={(newValue) =>
                        handleTermChange(
                          index,
                          "dayOfWeek",
                          newValue.target.value
                        )
                      }
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                          },
                        },
                      }}>
                      {daysOfWeekOptions.map((day) => (
                        <MenuItem key={day.value} value={day.value}>
                          {day.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Stack2>
              <Stack2>
                <Box width="50%">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <TimePicker
                      label="Od"
                      value={b.timeS}
                      slotProps={{ textField: { size: "small" } }}
                      sx={{ mr: 1 }}
                      onChange={(newValue) =>
                        handleTermChange(index, "timeS", newValue)
                      }
                    />
                  </LocalizationProvider>
                </Box>
                <Box width="50%">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <TimePicker
                      label="Do"
                      minTime={b.timeS || new Date()}
                      value={b.timeE}
                      onChange={(newValue) =>
                        handleTermChange(index, "timeE", newValue)
                      }
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                </Box>
              </Stack2>
              <Collapse in={formData.diffrentPlaces}>
                <Stack2>
                  <Typography width="50%">Inna lokalizacja</Typography>
                  <Box width="50%">
                    <FormControl fullWidth>
                      <InputLabel size="small" id="loc-label">
                        Lokalizacja
                      </InputLabel>
                      <Select
                        required
                        labelId="loc-label"
                        id="loc"
                        name="locId"
                        label="Lokalizacja"
                        value={b.locId}
                        size="small"
                        onChange={(newValue) =>
                          handleTermChange(
                            index,
                            "locId",
                            newValue.target.value
                          )
                        }
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                            },
                          },
                        }}>
                        {locs.isSuccess &&
                          locs.data.map((loc: any) => (
                            <MenuItem key={loc.id} value={loc.id}>
                              {loc.name}
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Stack2>
              </Collapse>
            </div>
          ))}
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Termin</TypographyStack>
            <Button variant="contained" onClick={addTerm}>
              Dodaj termin
            </Button>
          </Stack2>
          <Typography align="center" color="red">
            {errors.terms}
          </Typography>
        </StyledAccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <StyledAccordionSummary>
          <Typography variant="h6" color="white">
            Cennik
          </Typography>
        </StyledAccordionSummary>
        <StyledAccordionDetails>
          <Stack2>
            <TypographyStack>Cena</TypographyStack>
            <TextFieldStack
              label="Cena"
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              sx={{ width: "25%" }}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "+") {
                  e.preventDefault();
                }
              }}
            />
            <Box width="25%">
              <FormControl fullWidth>
                <InputLabel size="small" id="payOption-label">
                  Za
                </InputLabel>
                <Select
                  required
                  labelId="payOption-label"
                  id="payOption"
                  name="payOption"
                  label="Za"
                  size="small"
                  value={formData.payOption}
                  onChange={handleSelectChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                      },
                    },
                  }}>
                  <MenuItem value="za zajęcia">za zajęcia</MenuItem>
                  <MenuItem value="za miesiąc">za miesiąc</MenuItem>
                  <MenuItem value="z góry">z góry za całość</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Stack2>
          <Typography align="center" color="red">
            {errors.price}
          </Typography>
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Klienci płacą</TypographyStack>
            <Box width={formData.clientsPay === "co x zajęć" ? "25%" : "50%"}>
              <FormControl fullWidth>
                <InputLabel size="small" id="clientsPay-label">
                  Opcja
                </InputLabel>
                <Select
                  required
                  labelId="clientsPay-label"
                  size="small"
                  id="clientsPay"
                  name="clientsPay"
                  label="Opcja"
                  value={formData.clientsPay}
                  onChange={handleSelectChange}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                      },
                    },
                  }}>
                  <MenuItem
                    value="co zajęcia"
                    disabled={
                      formData.payOption === "za miesiąc" ||
                      formData.payOption === "z góry"
                    }>
                    co zajęcia
                  </MenuItem>
                  <MenuItem
                    value="co x zajęć"
                    disabled={
                      formData.payOption === "za miesiąc" ||
                      formData.payOption === "z góry"
                    }>
                    co X zajęć
                  </MenuItem>
                  <MenuItem
                    value="co miesiąc"
                    disabled={formData.payOption === "z góry"}>
                    co miesiąc
                  </MenuItem>
                  <MenuItem value="z góry">z góry za całość</MenuItem>
                </Select>
              </FormControl>
            </Box>
            {formData.clientsPay === "co x zajęć" && (
              <Box width="25%">
                <TextField
                  label="X"
                  type="number"
                  size="small"
                  name="xClasses"
                  value={formData.xClasses}
                  onChange={handleInputChange}
                />
              </Box>
            )}
          </Stack2>
          <Typography align="center" color="red">
            {errors.xClasses}
          </Typography>
        </StyledAccordionDetails>
      </Accordion>
      <Stack
        spacing={2}
        direction="row"
        display="flex"
        justifyContent="flex-end">
        <Button>Anuluj</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Zapisz
        </Button>
      </Stack>
      <DialogLoc
        open={openDialogLoc}
        club={
          clubInfo.isSuccess
            ? clubInfo.data.name
            : session
            ? session.user.club
            : ""
        }
        onClose={() => {
          setOpenDialogLoc((prev) => !prev);
          locs.refetch();
        }}
      />
    </Box>
  );
};

export default AddClass;
/*

            */
