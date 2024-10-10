import { makeStyles } from "@mui/styles";
import { isMobile, isTablet } from "react-device-detect";
import theme, { color } from "../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    overflowY: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  btn: {
    minWidth: isMobile && !isTablet ? "100px !important" : "140px !important",
  },
  progressCardContainer: {
    padding: "10px 0px 10px 10px",
    backgroundColor: color.white,
    borderRadius: 12,
    boxShadow: color.shadow,
  },

  // bottom card
  bottomCardContainer: {
    padding: "10px",
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
  },
  scrollContainer: {
    overflow: "auto",
    paddingRight: 10,
    "&::-webkit-scrollbar": {
      width: 5,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
    [theme.breakpoints.down("md")]: {
      "&::-webkit-scrollbar": {
        display: "block",
      },
    },
  },
  subBottomCardContainer: {
    border: `1px solid ${color.lightBorder}`,
    padding: "10px",
    borderRadius: 12,
    backgroundColor: color.white,
    transition: "500ms",
    boxShadow: color.dashCardShadow,
    "&:hover": {
      boxShadow: color.shadow,
      transform: "translatey(-0.1rem)",
    },
  },
  title: {
    fontSize: "12px !important",
    fontWeight: "400 !important",
    opacity: "0.7 !important",
    paddingBottom: 5,
  },
  roundDateIcon: {
    padding: "8px !important",
    borderRadius: "50% !important",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px !important",
  },
});

export default styles;
