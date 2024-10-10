import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
  },
  btnStyle: {
    minWidth: "120px !important",
  },
  gridContainer: {
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
    padding: 16,
  },
  numberInput: {
    "& input[type=number]": {
      "-moz-appearance": "textfield",
    },
    "& input[type=number]::-webkit-outer-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
    "& input[type=number]::-webkit-inner-spin-button": {
      "-webkit-appearance": "none",
      margin: 0,
    },
  },
});

export default styles;
