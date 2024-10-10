import { makeStyles } from "@mui/styles";
import { isMobile, isTablet } from "react-device-detect";
import { color } from "../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    overflow: "hidden",
  },
  btn: {
    minWidth: isMobile && !isTablet ? "100px !important" : "140px !important",
  },
  topCardContainer: {
    backgroundColor: color.white,
    borderRadius: 12,
    padding: "10px",
    boxShadow: color.shadow,
    // display: "flex",
  },
  roundDateIcon: {
    padding: "10px !important",
    borderRadius: "50% !important",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px !important",
  },
  tbRoundContainer: {
    backgroundColor: color.main,
    padding: "24px 4px 24px 4px",
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  },
  scrollBar: {
    height: "40vh",
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  detailBtn: {
    backgroundColor: `${color.skyBlue} !important`,
    color: `${color.primary} !important`,
    minWidth: isMobile && !isTablet ? "100px !important" : "140px !important",
    transition: "500ms !important",
    "&:hover": {
      backgroundColor: `${color.primary} !important`,
      color: `${color.white} !important`,
    },
    "@media (hover: none)": {
      "&:hover": {
        backgroundColor: `${color.skyBlue} !important`,
        color: `${color.primary} !important`,
      },
    },
  },
  pertientText: {
    color: `${color.primary} !important`,
    whiteSpace: "nowrap important",
  },
  eventMenuItem: {
    display: "flex",
    gap: 5,
    alignItems: "center",
  },
  loaderContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  noEventContainer: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column !important",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
