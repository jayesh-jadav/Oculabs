import { makeStyles } from "@mui/styles";
import { isMobile, isTablet } from "react-device-detect";
import { color } from "../../Config/theme";
const styles = makeStyles({
  nav: {
    width: "100%",
    position: "fixed",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    boxShadow: "0px 4px 3px 0px rgba(0,0,0,0.1)",
    height: "auto",
    zIndex: 10,
  },

  headerSubCon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuCon: {
    padding: "15px",
    cursor: "pointer",
    color: color.secondary,
  },

  verticle_line: {
    borderLeft: "1.5px solid #ffa500",
    height: "20px",
  },
  logOutText: {
    fontSize: 14,
    cursor: "pointer",
    color: color.yellow,
    "&:hover": {
      borderBottom: `1px solid ${color.yellow}`,
    },
  },
});

export default styles;
