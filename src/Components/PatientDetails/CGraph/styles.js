import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: "10px",
    boxShadow: color.shadow,
  },
  scrollBar: {
    overflow: "auto",
    width: "100%",
    "&::-webkit-scrollbar": {
      width: 0,
      height: 0,
    },
  },
  scrollBarWidth: {
    "&::-webkit-scrollbar": {
      width: 0,
      height: 0,
    },
  },
  sticky: {
    position: "sticky",
    left: 0,
    background: color.white,
  },
  stickyBL: {
    position: "sticky",
    bottom: 0,
    left: 0,
    background: color.white,
  },
  stickyB: {
    position: "sticky",
    bottom: 0,
    background: color.white,
  },
  stickyT: {
    position: "sticky",
    top: 0,
    background: color.white,
  },
  notes: {
    borderRadius: "8px !important",
    display: "flex !important",
    alignItems: "center !important",
    justifyContent: "center !important",
    padding: "0px !important",
  },
});

export default styles;
