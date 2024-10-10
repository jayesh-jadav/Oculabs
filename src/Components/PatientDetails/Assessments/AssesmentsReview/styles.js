import { makeStyles } from "@mui/styles";
import { color } from "../../../../Config/theme";

const styles = makeStyles({
  container: {
    padding: "5px 10px",
    backgroundColor: color.white,
    borderRadius: 12,
    boxShadow: color.shadow,
  },
  scroll: {
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  tabScrollBar: {
    overflow: "auto",
    "&::-webkit-scrollbar": {
      height: 4,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: color.skyBlue,
      padding: 0,
      margin: 0,
    },
  },
});

export default styles;
