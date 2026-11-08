// Re-export the @mui/x-date-pickers surface consumers need to compose custom
// date/time inputs (e.g. moment-adapter usage in enterprise kits). Fabric's
// opinionated wrappers (`FabricDatePicker`, `FabricTimePicker`) sit alongside
// these raw exports for the common case — reach for the raw ones when you need
// a non-dayjs adapter or a custom slot layout.
export {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
export { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
