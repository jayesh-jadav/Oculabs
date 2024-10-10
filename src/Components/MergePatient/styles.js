import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

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

  scrollContainer: {
    overflow: "auto",
    paddingRight: 10,
    "&::-webkit-scrollbar": {
      width: 1,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
  },
});

export default styles;
