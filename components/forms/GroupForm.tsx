"use client"; //      sprawdzenie formularza dla przerw i terminów

import React, { useState } from "react";
import {
  StyledAccordionSummary,
  StyledAccordionDetails,
  StyledAccordionSummaryNoExpand,
  Stack2,
  TypographyStack,
  StyledSwitch,
  TextFieldStack,
  InputLabelStack,
} from "@/components/styled/StyledComponents";
import {
  Accordion,
  Box,
  Divider,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  styled,
  Button,
  Collapse,
  Stack,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { format } from "date-fns/format";
import { parse } from "date-fns";

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
  name: string;
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
};
type Errors = {
  server: string;
  name: string;
  locId: string;
  firstLesson: string;
  lastLesson: string;
  price: string;
  xClasses: string;
  terms: string;
  breaks: { [index: number]: { name: string; begin: string; end: string } };
  termsErrors: {
    [index: number]: {
      dayOfWeek: string;
      timeS: string;
      timeE: string;
      locId: string;
    };
  };
};
type Props = {
  clubInfo: any;
  user: any;
  locs: any;
  groupInfo: any;
};
const GroupForm = ({ clubInfo, user, locs, groupInfo }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [openDialogLoc, setOpenDialogLoc] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "name" in groupInfo ? groupInfo.name : "",
    color: "color" in groupInfo ? groupInfo.color : "#3788d8",
    prtCount: "prtCount" in groupInfo ? groupInfo.prtCount : "0",
    locId: "locationId" in groupInfo ? groupInfo.locationId : "",
    signInfo: "signInfo" in groupInfo ? groupInfo.signInfo : "",
    firstLesson:
      "firstLesson" in groupInfo
        ? parse(groupInfo.firstLesson, "dd-MM-yyyy", new Date())
        : null,
    lastLesson:
      "lastLesson" in groupInfo
        ? parse(groupInfo.lastLesson, "dd-MM-yyyy", new Date())
        : null,
    diffrentPlaces: false,
    breaks:
      "breaks" in groupInfo
        ? groupInfo.breaks.map((b: any) => {
            return {
              begin: parse(b.begin, "dd-MM-yyyy", new Date()),
              end: parse(b.end, "dd-MM-yyyy", new Date()),
              name: b.name,
            };
          })
        : [],
    terms:
      "terms" in groupInfo
        ? groupInfo.terms.map((t: any) => {
            return {
              timeE: parse(t.timeE, "HH:mm", new Date()),
              timeS: parse(t.timeS, "HH:mm", new Date()),
              dayOfWeek: t.dayOfWeek,
              locId: t.locationId,
            };
          })
        : [{ dayOfWeek: 1, timeE: null, timeS: null, locId: "" }],
    price:
      "price" in groupInfo
        ? groupInfo.price
        : clubInfo !== undefined
        ? clubInfo.paymentGroup
        : "",
    payOption:
      "payOption" in groupInfo
        ? groupInfo.payOption
        : clubInfo !== undefined
        ? clubInfo.optionGroup
        : "za miesiąc",
    clientsPay: "clientsPay" in groupInfo ? groupInfo.clientsPay : "co miesiąc",
    xClasses: "xClasses" in groupInfo ? groupInfo.xClasses : "0",
    club: clubInfo !== undefined ? clubInfo.name : user.club,
    type: "group",
  });
  console.log(groupInfo);
  console.log(formData);
  console.log(clubInfo);

  const [errors, setErrors] = useState<Errors>({
    server: "",
    name: "",
    locId: "",
    firstLesson: "",
    lastLesson: "",
    terms: "",
    price: "",
    xClasses: "",
    breaks: {},
    termsErrors: {},
  });
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
  const validate = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (formData.name.trim() === "") {
      newErrors.name = "Podaj nazwę grupy";
      valid = false;
    } else {
      newErrors.name = "";
    }

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
      formData.terms.forEach((term, index) => {
        if (!term.dayOfWeek) {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            dayOfWeek: "Wybierz dzień tygodnia",
          };
          valid = false;
        } else {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            dayOfWeek: "",
          };
        }

        if (!term.timeS) {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            timeS: "Wybierz godzinę rozpoczęcia",
          };
          valid = false;
        } else {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            timeS: "",
          };
        }

        if (!term.timeE) {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            timeE: "Wybierz godzinę zakończenia",
          };
          valid = false;
        } else {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            timeE: "",
          };
        }

        if (formData.diffrentPlaces && !term.locId) {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            locId: "Wybierz lokalizację",
          };
          valid = false;
        } else {
          newErrors.termsErrors[index] = {
            ...newErrors.termsErrors[index],
            locId: "",
          };
        }
      });
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
    if (formData.breaks.length > 0) {
      formData.breaks.forEach((breakItem, index) => {
        if (!breakItem.name.trim()) {
          newErrors.breaks[index] = {
            ...newErrors.breaks[index],
            name: "Podaj nazwę przerwy",
          };
          valid = false;
        } else {
          newErrors.breaks[index] = { ...newErrors.breaks[index], name: "" };
        }

        if (!breakItem.begin) {
          newErrors.breaks[index] = {
            ...newErrors.breaks[index],
            begin: "Wybierz datę początku",
          };
          valid = false;
        } else {
          newErrors.breaks[index] = { ...newErrors.breaks[index], begin: "" };
        }

        if (!breakItem.end) {
          newErrors.breaks[index] = {
            ...newErrors.breaks[index],
            end: "Wybierz datę końca",
          };
          valid = false;
        } else {
          newErrors.breaks[index] = { ...newErrors.breaks[index], end: "" };
        }
      });
    }

    setErrors(newErrors);
    return valid;
  };
  const handleSubmit = async () => {
    const isOk = validate();
    if (isOk) {
      const info = {
        ...formData,
        firstLesson: format(formData.firstLesson || new Date(), "dd-MM-yyyy"),
        lastLesson: format(formData.lastLesson || new Date(), "dd-MM-yyyy"),
        prtCount: parseInt(formData.prtCount, 10),
        price: parseInt(formData.price, 10),
        xClasses: parseInt(formData.xClasses, 10),
        breaks: formData.breaks.map((b) => {
          return {
            ...b,
            begin: format(b.begin || new Date(), "dd-MM-yyyy"),
            end: format(b.end || new Date(), "dd-MM-yyyy"),
          };
        }),
        terms: formData.terms.map((t) => {
          return {
            ...t,
            timeS: format(t.timeS || new Date(), "HH:mm"),
            timeE: format(t.timeE || new Date(), "HH:mm"),
            locId: formData.diffrentPlaces ? t.locId : formData.locId,
          };
        }),
      };
      const response = await fetch(`/api/groups`, {
        method: "POST",
        body: JSON.stringify(info),
      });
      const message = await response.json();
      if (!message.error) {
        router.push("/home");
      } else {
        setErrors({ ...errors, server: message.error });
      }
    }
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
          <Typography align="center" color="red">
            {errors.server}
          </Typography>
          <Stack2>
            <TypographyStack>Nazwa Grupy:</TypographyStack>
            <TextFieldStack
              id="name"
              label="Nazwa Grupy"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </Stack2>
          <Typography align="center" color="red">
            {errors.name}
          </Typography>
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Kolor:</TypographyStack>
            <Box width="50%">
              <FormControl fullWidth>
                <InputLabelStack id="color-label">Kolor</InputLabelStack>
                <Select
                  labelId="color-label"
                  id="color"
                  name="color"
                  label="Kolor"
                  size="small"
                  value={formData.color}
                  onChange={handleSelectChange}
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
          <Divider variant="middle" />
          <Stack2>
            <TypographyStack>Liczba miejsc:</TypographyStack>
            <TextFieldStack
              autoComplete="off"
              id="count"
              type="number"
              label="Liczba miejsc"
              name="prtCount"
              value={formData.prtCount}
              inputProps={{ min: 0 }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "+") {
                  e.preventDefault();
                }
              }}
              onChange={handleInputChange}
            />
          </Stack2>
          <Collapse in={!formData.diffrentPlaces}>
            <Divider variant="middle" />
            <Stack2>
              <TypographyStack>Lokalizcja:</TypographyStack>
              <Box
                width="50%"
                flexWrap="wrap"
                flexDirection="row"
                display="flex">
                <BoxLoc>
                  <FormControl fullWidth sx={{ mp: 1, mt: 1 }}>
                    <InputLabelStack id="loc-label">
                      Lokalizacja
                    </InputLabelStack>
                    <Select
                      required
                      labelId="loc-label"
                      id="loc"
                      name="locId"
                      label="Lokalizacja"
                      size="small"
                      value={formData.locId}
                      onChange={handleSelectChange}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: 200, // Ustawienie maksymalnej wysokości menu
                          },
                        },
                      }}>
                      {locs.map((loc: any) => (
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
            <TypographyStack>Informacje do zapisów:</TypographyStack>
            <TextFieldStack
              autoComplete="off"
              id="info"
              label="Informacje do zapisów"
              name="signInfo"
              value={formData.signInfo}
              multiline
              rows={6}
              onChange={handleInputChange}
            />
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
                  onChange={(newValue) => {
                    if (newValue)
                      setFormData({ ...formData, firstLesson: newValue });
                  }}
                  slotProps={{ textField: { size: "small" } }}
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
                  value={formData.lastLesson}
                  minDate={
                    formData.firstLesson ? formData.firstLesson : new Date()
                  }
                  onChange={(newValue) => {
                    if (newValue)
                      setFormData({ ...formData, lastLesson: newValue });
                  }}
                  slotProps={{ textField: { size: "small" } }}
                />
              </LocalizationProvider>
            </Box>
          </Stack2>
          <Typography align="center" color="red">
            {errors.lastLesson}
          </Typography>
          {formData.breaks.map((b, index) => (
            <div key={index}>
              <Divider variant="middle" color="darkviolet" />
              <Stack2>
                <TypographyStack sx={{ display: "flex", alignItems: "center" }}>
                  Przerwa {index + 1}:{" "}
                  <DeleteIcon
                    color="error"
                    sx={{ ml: 1 }}
                    onClick={() => removeBreak(index)}
                  />
                </TypographyStack>
                <TextFieldStack
                  label="Nazwa przerwy"
                  value={b.name}
                  onChange={(e) =>
                    handleBreakChange(index, "name", e.target.value)
                  }
                />
              </Stack2>
              {errors.breaks[index]?.name && (
                <Typography color="error" align="center">
                  {errors.breaks[index].name}
                </Typography>
              )}
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
                      sx={{ marginRight: 1 }}
                      slotProps={{ textField: { size: "small" } }}
                    />
                  </LocalizationProvider>
                  {errors.breaks[index]?.begin && (
                    <Typography color="error">
                      {errors.breaks[index].begin}
                    </Typography>
                  )}
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
                  {errors.breaks[index]?.end && (
                    <Typography color="error">
                      {errors.breaks[index].end}
                    </Typography>
                  )}
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
              <Divider variant="middle" color="darkviolet" />
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
                    <InputLabelStack id="dayOfWeek-label">
                      Dzień tygodnia
                    </InputLabelStack>
                    <Select
                      required
                      labelId="dayOfWeek-label"
                      id="dayOfWeek"
                      name="dayOfWeek"
                      label="Dzień tygodnia"
                      size="small"
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
                    {errors.termsErrors[index]?.dayOfWeek && (
                      <Typography color="error">
                        {errors.termsErrors[index].dayOfWeek}
                      </Typography>
                    )}
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
                      sx={{ mr: 1 }}
                      slotProps={{ textField: { size: "small" } }}
                      onChange={(newValue) =>
                        handleTermChange(index, "timeS", newValue)
                      }
                    />
                  </LocalizationProvider>
                  {errors.termsErrors[index]?.timeS && (
                    <Typography color="error">
                      {errors.termsErrors[index].timeS}
                    </Typography>
                  )}
                </Box>
                <Box width="50%">
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <TimePicker
                      label="Do"
                      minTime={b.timeS || new Date()}
                      value={b.timeE}
                      slotProps={{ textField: { size: "small" } }}
                      onChange={(newValue) =>
                        handleTermChange(index, "timeE", newValue)
                      }
                    />
                  </LocalizationProvider>
                  {errors.termsErrors[index]?.timeE && (
                    <Typography color="error">
                      {errors.termsErrors[index].timeE}
                    </Typography>
                  )}
                </Box>
              </Stack2>
              <Collapse in={formData.diffrentPlaces}>
                <Stack2>
                  <Typography width="50%">Inna lokalizacja:</Typography>
                  <Box width="50%">
                    <FormControl fullWidth>
                      <InputLabelStack id="loc-label">
                        Inna lokalizacja
                      </InputLabelStack>
                      <Select
                        required
                        labelId="loc-label"
                        id="loc"
                        name="locId"
                        label="Inna lokalizacja"
                        size="small"
                        value={b.locId}
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
                        {locs.map((loc: any) => (
                          <MenuItem key={loc.id} value={loc.id}>
                            {loc.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.termsErrors[index]?.locId && (
                        <Typography color="error">
                          {errors.termsErrors[index].locId}
                        </Typography>
                      )}
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
                <InputLabelStack id="payOption-label">Za</InputLabelStack>
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
                <InputLabelStack id="clientsPay-label">Opcja</InputLabelStack>
                <Select
                  required
                  labelId="clientsPay-label"
                  id="clientsPay"
                  name="clientsPay"
                  label="Opcja"
                  size="small"
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
              <TextFieldStack
                sx={{ width: "25%" }}
                label="X"
                type="number"
                name="xClasses"
                value={formData.xClasses}
                onChange={handleInputChange}
              />
            )}
          </Stack2>
          <Typography align="center" color="red">
            {errors.xClasses}
          </Typography>
        </StyledAccordionDetails>
      </Accordion>
      <Stack
        spacing={2}
        mt={2}
        direction="row"
        display="flex"
        justifyContent="flex-end">
        <Button onClick={() => router.push("/home")}>Anuluj</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Zapisz
        </Button>
      </Stack>
      <DialogLoc
        open={openDialogLoc}
        club={clubInfo !== undefined ? clubInfo.name : user.club}
        onClose={() => {
          setOpenDialogLoc((prev) => !prev);
          queryClient.refetchQueries({
            queryKey: ["locs"],
            type: "all",
          });
        }}
      />
    </Box>
  );
};

export default GroupForm;
