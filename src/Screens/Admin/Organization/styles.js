import { makeStyles } from "@mui/styles";
import { color, FontFamily } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  linkStyle: {
    color: color.primary,
    fontSize: "14px !important",
    fontWeight: "600 !important",
    fontFamily: `${FontFamily.Regular} !important`,
  },

  gridContainer: {
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
    padding: 20,
  },
});

export default styles;
