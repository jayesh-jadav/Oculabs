import { makeStyles } from "@mui/styles";
import { color, FontFamily } from "../Config/theme";

const styles = makeStyles({
  patientList: {
    padding: "16px 0px",
    overflow: "hidden",
  },
  scrollBar: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 5,
      cursor: "pointer",
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
  },
  mainContainer: {
    display: "flex",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      width: 2,
    },
  },
  roundIcon: {
    backgroundColor: color.primary,
    color: color.white,
    padding: "8px !important",
    borderRadius: "50% !important",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    maxWidth: 40,
    maxHeight: 40,
  },
  drawerListText: {
    whiteSpace: "nowrap !important",
    width: "200px !important",
    overflow: "hidden !important",
    textOverflow: "ellipsis !important",
    fontSize: "16px !important",
    marginLeft: "10px !important",
    textTransform: "capitalize !important",
  },
  avatar: {
    width: "30px !important",
    height: "30px !important",
    fontSize: "14px !important",
    textTransform: "uppercase !important",
    backgroundColor: `${color.primary} !important`,
    boxShadow: `${color.shadow} !important`,
  },

  roundDrawerText: {
    fontSize: "12px",
    textTransform: "uppercase",
    height: "30px",
    width: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "500ms",
    "&:hover": {
      backgroundColor: color.primary,
      color: color.white,
      fontFamily: FontFamily.Bold,
    },
  },
});

export default styles;
