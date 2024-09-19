"use client";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { styled } from "@mui/material/styles";
import {
  Stack,
  AccordionSummary,
  AccordionDetails,
  AccordionSummaryProps,
  Switch,
  switchClasses,
  Box,
  Typography,
  TypographyProps,
  DialogTitle,
  DialogTitleProps,
  TextField,
  TextFieldProps,
  SelectProps,
  Select,
  InputLabelProps,
  InputLabel,
  colors,
  Tabs,
  Tab,
  TabProps,
} from "@mui/material";
import {
  DatePickerProps,
  DatePicker,
  DateTimePickerProps,
  MobileDatePickerProps,
} from "@mui/x-date-pickers";
import { DataGrid } from "@mui/x-data-grid";

export const StyledAccordionSummary = styled((props: AccordionSummaryProps) => (
  <AccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ color: "white", fontSize: "2rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.light}`,
}));

export const StyledAccordionSummaryNoExpand = styled(
  (props: AccordionSummaryProps) => <AccordionSummary {...props} />
)(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.light}`,
}));
export const StyledDialogTitle = styled((props: DialogTitleProps) => (
  <DialogTitle {...props} />
))(({ theme }) => ({
  backgroundColor: `${theme.palette.primary.main}`,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
}));
export const StyledAccordionDetails = styled(AccordionDetails)(({ theme }) => ({
  padding: theme.spacing(1),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

export const Stack2 = styled(Stack)(({ theme }) => ({
  flexDirection: "row",
  padding: theme.spacing(2),
  justifyContent: "flex-start",
  alignItems: "center",
}));

export const StyledSwitch = styled(Switch)({
  width: 80,
  height: 48,
  padding: 8,
  [`& .${switchClasses.switchBase}`]: {
    padding: 11,
    color: "#ff6a00",
  },
  [`& .${switchClasses.thumb}`]: {
    width: 26,
    height: 26,
    backgroundColor: "#fff",
  },
  [`& .${switchClasses.track}`]: {
    background: "linear-gradient(to right, #ee0979, #ff6a00)",
    opacity: "1 !important",
    borderRadius: 20,
    position: "relative",
    "&:before, &:after": {
      display: "inline-block",
      position: "absolute",
      top: "50%",
      width: "50%",
      transform: "translateY(-50%)",
      color: "#fff",
      textAlign: "center",
      fontSize: "0.75rem",
      fontWeight: 500,
    },
    "&:before": {
      content: '"TAK"',
      left: 4,
      opacity: 0,
    },
    "&:after": {
      content: '"NIE"',
      right: 4,
    },
  },
  [`& .${switchClasses.checked}`]: {
    [`&.${switchClasses.switchBase}`]: {
      color: "#185a9d",
      transform: "translateX(32px)",
      "&:hover": {
        backgroundColor: "rgba(24,90,257,0.08)",
      },
    },
    [`& .${switchClasses.thumb}`]: {
      backgroundColor: "#fff",
    },
    [`& + .${switchClasses.track}`]: {
      background: "linear-gradient(to right, #43cea2, #185a9d)",
      "&:before": {
        opacity: 1,
      },
      "&:after": {
        opacity: 0,
      },
    },
  },
});

export const TypographySwitch = styled((props: TypographyProps) => (
  <Typography {...props} fontWeight="bold" />
))(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "75%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50%",
  },
  color: theme.palette.primary.main,
}));
export const BoxSwitch = styled(Box)(({ theme }) => ({
  [theme.breakpoints.down("sm")]: {
    width: "25%",
  },
  [theme.breakpoints.up("sm")]: {
    width: "50%",
  },
}));

export const TypographyStack = styled((props: TypographyProps) => (
  <Typography {...props} fontWeight="bold" />
))(({ theme }) => ({
  color: theme.palette.primary.main,
  width: "50%",
}));

export const TextFieldStack = styled((props: TextFieldProps) => (
  <TextField {...props} size="small" autoComplete="off" />
))({
  width: "50%",
});

export const InputLabelStack = styled((props: InputLabelProps) => (
  <InputLabel {...props} size="small" />
))({});

//TODO: zaputać gpt czemu nie działa
export const SelectStack = styled((props: SelectProps) => (
  <Select {...props} size="small" />
))({});
//TODO: same story
export const DatePickerStack = styled((props) => (
  <DatePicker {...props} slotProps={{ textField: { size: "small" } }} />
))({});

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  "& .MuiDataGrid-columnHeader": {
    backgroundColor: "white",
  },
  "& .MuiDataGrid-scrollbarFiller": {
    backgroundColor: "white",
  },
  "& .MuiDataGrid-columnsContainer": {
    backgroundColor: "white",
    border: 0,
  },
  "& .MuiDataGrid-iconSeparator": {
    display: "none",
  },
}));

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(2),
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    maxWidth: 40,
    width: "100%",
    backgroundColor: "#635ee7",
  },
}));
export const StyledTab = styled((props: TabProps) => (
  <Tab disableRipple {...props} />
))(({ theme }) => ({
  textTransform: "none",
  fontSize: theme.typography.pxToRem(15),
  backgroundColor: "rgb(230, 230, 230)",
  marginLeft: 1,
  borderTopLeftRadius: 10,
  borderTopRightRadius: 10,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: "#fff",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));
