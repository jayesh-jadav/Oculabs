import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 20,
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  gridContainer: {
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
