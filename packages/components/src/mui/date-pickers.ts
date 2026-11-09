// Re-export the @mui/x-date-pickers pieces needed to compose custom date/time
// inputs. Fabric's wrappers (`FabricDatePicker`, `FabricTimePicker`) cover the
// common case. Only the Day.js adapter is re-exported: Day.js is a dependency,
// while other adapters need packages (moment, luxon, date-fns) Fabric doesn't
// install. Import those from `@mui/x-date-pickers/Adapter*` yourself.
export {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
export { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
