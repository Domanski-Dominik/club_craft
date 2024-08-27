"use client";

import PersonIcon from "@mui/icons-material/Person";
import CelebrationIcon from "@mui/icons-material/Celebration";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import pl from "date-fns/locale/pl";
import {
  Box,
  Typography,
  Container,
  Grid,
  Select,
  CssBaseline,
  TextField,
  Button,
  Avatar,
  Fade,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Accordion,
  useTheme,
  Divider,
  Collapse,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import type { Group, LocWithGroups } from "@/types/type";
import PolishDayName, { ReversePolishName } from "@/functions/PolishDayName";
import {
  StyledAccordionSummary,
  StyledAccordionSummaryNoExpand,
  StyledAccordionDetails,
  Stack2,
  StyledSwitch,
  TypographySwitch,
  BoxSwitch,
  TypographyStack,
} from "../styled/StyledComponents";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { useQuery } from "@tanstack/react-query";
import { useAddPrt } from "@/hooks/participantHooks";
import { format } from "date-fns";

type NGroup = {
  locId: string | number;
  locName: string;
  groupName: string;
  groupId: string | number;
  dayOfWeek: string;
};
type FormData = {
  email: string;
  name: string;
  surname: string;
  club: string;
  tel: string;
  groups: (number | string)[];
  regulamin: boolean;
  contactWithParent: boolean;
  parentFirstName: string;
  parentLastName: string;
  note: string;
  signGroup: boolean;
  birthday: Date | null;
};

const ParticipantForm = () => {
  const router = useRouter();
  const theme = useTheme();
  const addPrt = useAddPrt();
  const [succes, setSucces] = useState(false);
  const { status, data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });
  const [selectedLocation, setSelectedLocation] = useState<
    LocWithGroups | null | undefined
  >(null); // Wybrana lokalizacja
  const [days, setDays] = useState<string[]>([]);
  const [groups, setGroups] = useState<Group[] | null>();
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState<string>(""); // Wybrany dzień tygodnia
  const [selectedGroups, setSelectedGroups] = useState<NGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    surname: "",
    club: "",
    tel: "",
    groups: [],
    regulamin: false,
    contactWithParent: false,
    parentFirstName: "",
    parentLastName: "",
    note: "",
    signGroup: false,
    birthday: null,
  });
  const [errors, setErrors] = useState({
    email: "",
    tel: "",
    name: "",
    surname: "",
    serverError: "",
    group: "",
    parentFirstName: "",
    parentLastName: "",
    birthDay: "",
  });
  const LocWithGroups = useQuery<LocWithGroups[]>({
    queryKey: ["LocWithGroups"],
    enabled: !!session,
    queryFn: () =>
      fetch(`/api/components/form/${session?.user.club}`).then((res) =>
        res.json()
      ),
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({ ...formData, club: session.user.club });
    }
  }, [session]);

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (formData.name.trim() === "") {
      newErrors.name = "Podaj imię uczestnika";
      valid = false;
    } else if (formData.name !== "") {
      newErrors.name = "";
    }

    if (formData.surname.trim() === "") {
      newErrors.surname = "Podaj nazwisko uczestnika";
      valid = false;
    } else {
      newErrors.surname = "";
    }
    if (formData.parentFirstName.trim() === "" && formData.contactWithParent) {
      newErrors.parentFirstName = "Podaj imię opiekuna";
      valid = false;
    } else {
      newErrors.parentFirstName = "";
    }
    if (formData.parentLastName.trim() === "" && formData.contactWithParent) {
      newErrors.parentLastName = "Podaj nazwisko opiekuna";
      valid = false;
    } else {
      newErrors.parentLastName = "";
    }
    if (formData.tel !== "") {
      const hasOnlyDigits = /^\d+$/; // Sprawdzenie czy składa się tylko z cyfr
      if (!hasOnlyDigits.test(formData.tel.replace(/\s/g, ""))) {
        newErrors.tel = "Numer telefonu powinien składać się tylko z cyfr";
        valid = false;
      } else if (formData.tel.replace(/\s/g, "").length !== 9) {
        newErrors.tel = "Numer telefonu powinien składać się z 9 cyfr";
        valid = false;
      } else {
        newErrors.tel = "";
      }
    } else if (formData.tel === "") {
      newErrors.tel = "";
    }
    /*if (formData.groups.length === 0) {
			newErrors.group = "Wybierz grupę i kliknij + dodaj";
			valid = false;
		} else if (formData.groups.length > 0) {
			newErrors.group = "";
		}*/

    // Walidacja pola email za pomocą wyrażenia regularnego
    if (formData.email !== "") {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "Niepoprawny format adresu email";
        valid = false;
      } else {
        newErrors.email = "";
      }
    } else {
      newErrors.email = "";
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isOk = validateForm();
    console.log(formData);
    console.log(isOk);
    if (isOk) {
      try {
        const info = {
          ...formData,
          birthday: formData.birthday
            ? format(formData.birthday, "dd-MM-yyyy")
            : null,
        };
        const message = await addPrt.mutateAsync(info);
        console.log(message);
        if (message.error) {
          setErrors({
            parentFirstName: "",
            parentLastName: "",
            birthDay: "",
            email: "",
            tel: "",
            name: "",
            surname: "",
            group: "",
            serverError: `${message.error}`,
          });
        } else {
          setSucces(true);
        }
      } catch (error) {
        console.error(error);
        setErrors({
          parentFirstName: "",
          parentLastName: "",
          birthDay: "",
          email: "",
          tel: "",
          name: "",
          surname: "",
          group: "",
          serverError: "Wystąpił błąd podczas dodawania uczestnika",
        });
      }
    } else {
      console.log("Formularz zawiera błędy, proszę poprawić dane");
    }

    //router.push("/login");
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleLocationChange = (event: SelectChangeEvent) => {
    //console.log(event.target.value);
    if (LocWithGroups.isSuccess) {
      const id = parseInt(event.target.value, 10);
      const selectedLocationData = LocWithGroups.data.find(
        (location) => location.id === id
      );
      //console.log(selectedLocationData);
      setSelectedLocation(selectedLocationData);
      const daysOfWeek = selectedLocationData?.locationschedule.map(
        (schedule) => schedule.dayOfWeek
      );
      if (daysOfWeek) {
        const sortedDaysOfWeek = daysOfWeek.slice().sort((a, b) => {
          if (a === 0) return 1; // Jeśli a jest równa 0, umieść ją na końcu
          if (b === 0) return -1; // Jeśli b jest równa 0, umieść ją na koniec
          return a - b; // W przeciwnym razie sortuj normalnie
        });
        const uniqueDaysOfWeek = sortedDaysOfWeek.filter(
          (value, index, array) => {
            return index === array.indexOf(value);
          }
        );
        //console.log(uniqueDaysOfWeek);
        setDays(uniqueDaysOfWeek.map((day) => PolishDayName(day)));
      }
      setSelectedDayOfWeek("");
      setSelectedGroupId("");
    }
  };
  const handleDayOfWeekChange = (
    event: React.ChangeEvent<{ value: string }>
  ) => {
    //console.log(event.target.value);
    setSelectedDayOfWeek(event.target.value);
    const dayId = ReversePolishName(event.target.value);
    //console.log(dayId);
    const groupsInLoc = selectedLocation?.locationschedule.filter(
      (group) => group.dayOfWeek === dayId
    );
    groupsInLoc?.sort((a, b) => {
      const timeA = a.timeS.split(":").map(Number); // Konwersja czasu z formatu HH:mm na tablicę liczb (godzina, minuta)
      const timeB = b.timeS.split(":").map(Number);
      if (timeA[0] !== timeB[0]) {
        return Number(timeA[0]) - Number(timeB[0]);
      } else {
        return Number(timeA[1]) - Number(timeB[1]);
      }
    });
    //console.log(groupsInLoc);
    setGroups(groupsInLoc);
    setSelectedGroupId("");
  };
  const handleGroupChange = (event: React.ChangeEvent<{ value: string }>) => {
    //console.log(event.target.value);
    setSelectedGroupId(event.target.value);
  };
  const addGroup = (group: NGroup) => {
    if (selectedGroups.find((gr) => gr.groupId === group.groupId)) {
      setErrors({ ...errors, group: "Wybierz nową grupę" });
    } else {
      setSelectedGroups([...selectedGroups, group]);
      console.log(group);
      const id = [group.groupId];
      setFormData((prevData) => ({
        ...prevData,
        groups: [...prevData.groups, ...id],
      }));

      setErrors({ ...errors, group: "" });
    }
  };
  const removeGroup = (groupId: string | number) => {
    const updatedGroups = selectedGroups.filter(
      (group) => group.groupId !== groupId
    );
    const ids = updatedGroups.map((group) => group.groupId);
    console.log(formData, updatedGroups, ids);
    setFormData({ ...formData, groups: ids });
    setSelectedGroups(updatedGroups);
  };
  const handleFormClean = () => {
    setFormData({
      ...formData,
      email: "",
      name: "",
      surname: "",
      tel: "",
      groups: [],
      regulamin: false,
      contactWithParent: false,
      parentFirstName: "",
      parentLastName: "",
      note: "",
      signGroup: false,
      birthday: null,
    });
    setErrors({
      parentFirstName: "",
      parentLastName: "",
      birthDay: "",
      email: "",
      tel: "",
      name: "",
      surname: "",
      serverError: "",
      group: "",
    });
    setSelectedDayOfWeek("");
    setSelectedGroups([]);
    setSelectedGroupId("");
    setSelectedLocation(null);
    setSucces(false);
  };
  return (
    <Box sx={{ width: "calc(100% - 20px)" }}>
      {succes === false && (
        <>
          <Accordion expanded={true}>
            <StyledAccordionSummaryNoExpand>
              <Typography variant="h6" color="white">
                Uczestnik
              </Typography>
            </StyledAccordionSummaryNoExpand>
            <StyledAccordionDetails>
              <Typography color="error">{errors.serverError}</Typography>
              <Stack2>
                <TypographyStack>Imię:</TypographyStack>
                <TextField
                  name="name"
                  required
                  sx={{ width: "50%" }}
                  autoComplete="off"
                  id="name"
                  label="Imię"
                  onChange={handleInputChange}
                />
              </Stack2>
              <Typography color="error">{errors.name}</Typography>
              <Divider variant="middle" />
              <Stack2>
                <TypographyStack>Nazwisko:</TypographyStack>
                <TextField
                  required
                  sx={{ width: "50%" }}
                  autoComplete="off"
                  id="surname"
                  label="Nazwisko"
                  name="surname"
                  onChange={handleInputChange}
                />
              </Stack2>
              <Typography color="error">{errors.surname}</Typography>
              <Divider variant="middle" />
              <Stack2>
                <TypographyStack>Data urodzenia:</TypographyStack>
                <Box width={"50%"}>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={pl}>
                    <DatePicker
                      label="Data urodzenia"
                      value={formData.birthday}
                      onChange={(newValue) => {
                        if (newValue)
                          setFormData({ ...formData, birthday: newValue });
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Stack2>
              <Divider variant="middle" />
              <Stack2>
                <TypographySwitch>Kontakt przez opiekuna:</TypographySwitch>
                <BoxSwitch>
                  <StyledSwitch
                    checked={formData.contactWithParent}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        contactWithParent: !formData.contactWithParent,
                      })
                    }
                  />
                </BoxSwitch>
              </Stack2>
              <Collapse in={!formData.contactWithParent}>
                <Divider variant="middle" />
                <Stack2>
                  <TypographyStack>Telefon:</TypographyStack>
                  <TextField
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="tel"
                    label="Numer Telefonu"
                    name="tel"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.tel}</Typography>
                <Divider variant="middle" />
                <Stack2>
                  <TypographyStack>Email:</TypographyStack>
                  <TextField
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="email"
                    label="Adres Email"
                    name="email"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.email}</Typography>
              </Collapse>
            </StyledAccordionDetails>
          </Accordion>
          <Collapse in={formData.contactWithParent}>
            <Accordion defaultExpanded>
              <StyledAccordionSummary>
                <Typography variant="h6" color="white">
                  Rodzic
                </Typography>
              </StyledAccordionSummary>
              <StyledAccordionDetails>
                <Stack2>
                  <TypographyStack>Imię:</TypographyStack>
                  <TextField
                    name="parentFirstName"
                    required
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="name"
                    label="Imię opiekuna"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.parentFirstName}</Typography>
                <Divider variant="middle" />
                <Stack2>
                  <TypographyStack>Nazwisko:</TypographyStack>
                  <TextField
                    name="parentLastName"
                    required
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="name"
                    label="Nazwisko opiekuna"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.parentFirstName}</Typography>
                <Divider variant="middle" />
                <Stack2>
                  <TypographyStack>Telefony:</TypographyStack>
                  <TextField
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="tel"
                    label="Numer Telefonu"
                    name="tel"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.tel}</Typography>
                <Divider variant="middle" />
                <Stack2>
                  <TypographyStack>Email:</TypographyStack>
                  <TextField
                    sx={{ width: "50%" }}
                    autoComplete="off"
                    id="email"
                    label="Adres Email"
                    name="email"
                    onChange={handleInputChange}
                  />
                </Stack2>
                <Typography color="error">{errors.email}</Typography>
              </StyledAccordionDetails>
            </Accordion>
          </Collapse>
          <Accordion expanded={true}>
            <StyledAccordionSummaryNoExpand>
              <Typography variant="h6" color="white">
                Własne pola
              </Typography>
            </StyledAccordionSummaryNoExpand>
            <StyledAccordionDetails>
              <Stack2>
                <TypographyStack>Notatka:</TypographyStack>
                <TextField
                  sx={{ width: "50%" }}
                  autoComplete="off"
                  id="note"
                  label="Notatka"
                  name="note"
                  onChange={handleInputChange}
                />
              </Stack2>
              <Divider variant="middle" />
              <Stack2>
                <TypographySwitch>Podpisał regulamin/ umowę:</TypographySwitch>
                <BoxSwitch>
                  <StyledSwitch
                    checked={formData.regulamin}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        regulamin: !formData.regulamin,
                      })
                    }
                  />
                </BoxSwitch>
              </Stack2>
              <Divider variant="middle" />
              <Stack2>
                <TypographySwitch>Przypisz do grupy:</TypographySwitch>
                <BoxSwitch>
                  <StyledSwitch
                    checked={formData.signGroup}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        signGroup: !formData.signGroup,
                      })
                    }
                  />
                </BoxSwitch>
              </Stack2>
            </StyledAccordionDetails>
          </Accordion>
          <Collapse in={formData.signGroup}>
            <Accordion expanded={true}>
              <StyledAccordionSummaryNoExpand>
                <Typography variant="h6" color="white">
                  Grupy
                </Typography>
              </StyledAccordionSummaryNoExpand>
              <StyledAccordionDetails>
                {LocWithGroups.isSuccess && LocWithGroups.data.length > 0 ? (
                  <>
                    <Stack2>
                      <TypographyStack>Lokalizacja:</TypographyStack>
                      <Box width="50%">
                        <FormControl fullWidth>
                          <InputLabel id="loc">Lokalizacja</InputLabel>
                          <Select
                            labelId="loc"
                            id="loc"
                            label="Lokalizacja"
                            defaultValue=""
                            value={selectedLocation?.id || ""}
                            onChange={handleLocationChange as any}>
                            {LocWithGroups.isSuccess &&
                              LocWithGroups.data.length > 0 &&
                              LocWithGroups.data.map((loc) => (
                                <MenuItem key={loc.id} value={`${loc.id}`}>
                                  {loc.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack2>
                    <Divider variant="middle" />
                    <Stack2>
                      <TypographyStack>Dzień tygodnia:</TypographyStack>
                      <Box width="50%">
                        <FormControl fullWidth>
                          <InputLabel id="day">Dzień tygodnia</InputLabel>
                          <Select
                            labelId="day"
                            id="day"
                            label="Dzień tygodnia"
                            defaultValue=""
                            value={selectedDayOfWeek || ""}
                            onChange={handleDayOfWeekChange as any}>
                            {days.map((day) => (
                              <MenuItem key={day} value={day}>
                                {day}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack2>
                    <Divider variant="middle" />
                    <Stack2>
                      <TypographyStack>Grupa:</TypographyStack>
                      <Box width="50%">
                        <FormControl fullWidth>
                          <InputLabel id="group">Grupa</InputLabel>
                          <Select
                            labelId="group"
                            id="group"
                            label="Grupa"
                            defaultValue=""
                            value={selectedGroupId || ""}
                            onChange={handleGroupChange as any}>
                            {groups &&
                              groups !== null &&
                              groups.map((group) => (
                                <MenuItem key={group.timeS} value={group.id}>
                                  {group.name}
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Stack2>
                    <Divider variant="middle" />
                    <Stack2>
                      <Button
                        fullWidth
                        size="large"
                        variant="outlined"
                        disabled={selectedGroupId === ""}
                        sx={{ height: "100%" }}
                        startIcon={<AddIcon />}
                        onClick={() => {
                          if (selectedLocation) {
                            const foundGroup =
                              selectedLocation?.locationschedule.find(
                                (group) => group.id === Number(selectedGroupId)
                              );
                            if (foundGroup) {
                              addGroup({
                                locName: selectedLocation?.name,
                                locId: selectedLocation?.id,
                                dayOfWeek: selectedDayOfWeek,
                                groupId: selectedGroupId,
                                groupName: foundGroup.name,
                              });
                            }
                          }
                        }}>
                        Dodaj
                      </Button>
                    </Stack2>
                    <Divider variant="middle" />
                    {errors.group !== "" && (
                      <Typography color="error">{errors.group}</Typography>
                    )}
                    <Stack2>
                      <List
                        sx={{
                          border: 1,
                          borderColor: "blueviolet",
                          borderRadius: 2,
                          width: "100%",
                        }}>
                        {selectedGroups.length <= 0 && (
                          <Typography align="center">
                            Brak dodanych grup
                          </Typography>
                        )}
                        {selectedGroups.map((group) => (
                          <ListItem
                            key={group.groupId}
                            sx={{ justifyContent: "space-between" }}>
                            <Typography
                              color={"darkviolet"}
                              variant="subtitle1">
                              {group.locName}
                            </Typography>
                            <Typography variant="subtitle1">
                              {group.dayOfWeek}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={"bold"}>
                              {group.groupName}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => removeGroup(group.groupId)}>
                              Usuń
                            </Button>
                          </ListItem>
                        ))}
                      </List>
                    </Stack2>
                  </>
                ) : (
                  <>
                    <Typography variant="h6">
                      {LocWithGroups.isSuccess
                        ? "Brak dodanych grup, najpierw je utwórz"
                        : "Błąd w trakcie pobierania grup"}
                    </Typography>
                  </>
                )}
              </StyledAccordionDetails>
            </Accordion>
          </Collapse>
          <Box
            width="100%"
            sx={{
              marginY: "1rem",
              justifyContent: "end",
              display: "flex",
            }}>
            <Button
              variant="outlined"
              onClick={() => router.push("/home")}
              startIcon={<CloseIcon />}
              type="button"
              sx={{ mx: 1 }}>
              Anuluj
            </Button>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={handleSubmit}>
              Dodaj uczestnika
            </Button>
          </Box>
        </>
      )}
      {succes && (
        <Fade in={succes} timeout={1000}>
          <Box textAlign="center">
            <CelebrationIcon color="primary" sx={{ fontSize: "8rem" }} />

            <Typography
              variant="h3"
              mt={4}
              color="blueviolet"
              textAlign="center">
              Udało ci się dodać uczestnika
            </Typography>
            <Button
              fullWidth
              variant="contained"
              onClick={handleFormClean}
              sx={{ mt: 6, mb: 2 }}>
              Dodaj następnego uczestnika
            </Button>
          </Box>
        </Fade>
      )}
    </Box>
  );
};

export default ParticipantForm;
