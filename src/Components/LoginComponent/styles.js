import { makeStyles } from "@mui/styles";
import { isMobile, isTablet } from "react-device-detect";
import { color } from "../../Config/theme";

const useStyles = makeStyles((theme) => ({
  container: {
    paddingTop: isMobile || isTablet ? "4rem !important" : "6rem !important",
    backgroundColor: color.white,
    overflow: "auto !important",
    paddingBottom: 20,
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  img: {
    width: "235px",
    marginBottom: (!isMobile || !isTablet) && 30,
  },
  cText: {
    fontSize: "16px !important",
    textAlign: "center",
    padding: isMobile || isTablet ? "20px 10px" : "0 30px",
  },

  cms: {
    color: `${color.blue700} !important`,
    cursor: "pointer",
    fontSize: "16px !important",
    textAlign: "center",
    lineHeight: "24px !important",
    padding: isMobile ? "0px 10px" : "0 20px",
  },

  subText: {
    color: `${color.white} !important`,
    fontSize: "20px !important",
    fontWeight: "400 !important",
    marginTop: "20px !important",
    "@media (max-width:1200px)": {
      fontSize: "16px !important",
    },
  },
  mainHeading: {
    color: `${color.white} !important`,
    fontSize: "44px !important",
    marginRight: "20% !important",
    "@media (max-width:1200px)": {
      fontSize: "36px !important",
    },
  },
}));
export default useStyles;
