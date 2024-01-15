import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import pl from "date-fns/locale/pl";
import format from "date-fns/format";
import { MobileDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {
  Select,
  TextField,
  InputLabel,
  FormControl,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Box,
  Grid,
  SelectChangeEvent,
  Typography,
  InputAdornment,
} from "@mui/material";
import { DialogPayType, Payment } from "@/types/type";

const formatDate = (date: Date) => {
  return format(date, "dd-MM-yyyy");
};
const formatDateMonth = (date: Date) => {
  return format(date, "MM-yyyy");
};
const DialogPay: React.FC<DialogPayType> = ({ open, row, onClose }) => {
  if (row === null) {
    return null;
  }
  const [paymentData, setPaymentData] = React.useState({
    amount: "",
    description: "",
    paymentMethod: "cash",
    selectedMonth: new Date(),
    paymentDate: formatDate(new Date()),
  });
  const [errors, setErrors] = React.useState({
    amount: "",
  });
  React.useEffect(() => {
    // Aktualizuj dane formularza, gdy obiekt `row` zostanie dostarczony
    if (row && paymentData.selectedMonth) {
      const selectedRowPayment = row?.payments.find(
        (payment: any) =>
          payment.month === formatDateMonth(paymentData.selectedMonth)
      );
      setPaymentData({
        ...paymentData,
        amount: `${selectedRowPayment?.amount}` || "",
        description: selectedRowPayment?.description || "",
        paymentMethod: selectedRowPayment?.paymentMethod || "cash",
        selectedMonth: paymentData.selectedMonth,
      });
    }
  }, [row]);
  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    // Walidacja pola powtórz hasło
    if (paymentData.amount.startsWith("0")) {
      newErrors.amount = "Nie może zaczynać się od zera";
      valid = false;
    } else if (/[\s,.]/.test(paymentData.amount)) {
      newErrors.amount = "Nie może zawierać przecinków i kropek";
      valid = false;
    } else if (paymentData.amount === "") {
      newErrors.amount = "Podaj kwotę";
      valid = false;
    } else {
      newErrors.amount = "";
    }
    setErrors(newErrors);
    return valid;
  };
  const handleChange =
    (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPaymentData({ ...paymentData, [name]: event.target.value });
    };
  const handleSelectChange = (name: string) => (event: SelectChangeEvent) => {
    setPaymentData({ ...paymentData, [name]: event.target.value });
  };
  const handleDateChange = (date: Date | null) => {
    if (date !== null) {
      const selectedRowPayment = row?.payments.find(
        (payment: Payment) => payment.month === formatDateMonth(date)
      );

      setPaymentData({
        amount: `${selectedRowPayment?.amount}` || "",
        description: selectedRowPayment?.description || "",
        paymentMethod: selectedRowPayment?.paymentMethod || "cash",
        selectedMonth: date,
        paymentDate: formatDate(date),
      });
    }
  };
  const handleClose = () => {
    setPaymentData({
      amount: "",
      description: "",
      paymentMethod: "cash",
      selectedMonth: new Date(),
      paymentDate: formatDate(new Date()),
    });
    onClose(null, null, null);
  };
  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(row);
    const formattedData = {
      ...paymentData,
      selectedMonth: formatDateMonth(paymentData.selectedMonth),
    };
    onClose(formattedData, row, "delete");
    setPaymentData({
      amount: "",
      description: "",
      paymentMethod: "cash",
      selectedMonth: new Date(),
      paymentDate: formatDate(new Date()),
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const formattedData = {
        ...paymentData,
        selectedMonth: formatDateMonth(paymentData.selectedMonth),
      };
      onClose(formattedData, row, "save");
      setPaymentData({
        amount: "",
        description: "",
        paymentMethod: "cash",
        selectedMonth: new Date(),
        paymentDate: formatDate(new Date()),
      });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        Płatność {row.firstName} {row.lastName}
      </DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit}>
          <Grid
            sx={{ marginTop: 0.1, marginBottom: 1 }}
            container
            columnSpacing={3}
            rowSpacing={2}>
            <Grid item xs={12} sm={12}>
              <TextField
                label="Kwota"
                type="number"
                value={paymentData.amount}
                onChange={handleChange("amount")}
                required
                fullWidth
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">zł</InputAdornment>
                  ),
                }}
              />
              <Typography color="error">{errors.amount}</Typography>
            </Grid>
            <Grid item xs={12} sm={12}>
              <TextField
                label="Opis"
                value={paymentData.description}
                onChange={handleChange("description")}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <FormControl fullWidth>
                <InputLabel>Metoda płatności</InputLabel>
                <Select
                  label="Metoda płatności"
                  value={paymentData.paymentMethod}
                  onChange={handleSelectChange("paymentMethod")}
                  required>
                  <MenuItem value="cash">Gotówka</MenuItem>
                  <MenuItem value="transfer">Przelew</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={12}>
              <LocalizationProvider
                dateAdapter={AdapterDateFns}
                adapterLocale={pl}>
                <MobileDatePicker
                  label="Miesiąc"
                  value={paymentData.selectedMonth}
                  onChange={handleDateChange}
                  views={["month", "year"]}
                  sx={{ width: "100%" }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Grid container sx={{ justifyContent: "space-around" }}>
          <Grid>
            <Button color="primary" variant="outlined" onClick={handleClose}>
              Anuluj
            </Button>
          </Grid>
          <Grid>
            <Button
              onClick={handleDelete}
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}>
              Usuń
            </Button>
          </Grid>
          <Grid>
            <Button
              onClick={handleSubmit}
              type="submit"
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}>
              Dodaj
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};
export default DialogPay;
