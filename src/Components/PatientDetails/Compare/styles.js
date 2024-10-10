import { makeStyles } from "@mui/styles";
import { isMobile } from "react-device-detect";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    backgroundColor: color.white,
    padding: isMobile ? 10 : 20,
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    marginBottom: "16px !important",
  },

  select: {
    width: "40%",
    "@media (max-width:950px)": {
      width: "100%",
    },
    "@media (max-width:1200px)": {
      width: "65%",
    },
    backgroundColor: color.white,
    padding: 10,
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    marginBottom: "10px !important",
  },

  scrollbar: {
    overflowY: "scroll",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  eventMenuItem: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
});

export default styles;
