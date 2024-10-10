import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  btnStyle: {
    minWidth: "120px !important",
  },
  gridContainer: {
    width: "100%",
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
    padding: 20,
  },
  datePicker: {
    "& .MuiButton-root": {
      color: color.primary,
    },
    "& .MuiSvgIcon-root": {
      color: color.primary,
    },
  },
});

export default styles;
