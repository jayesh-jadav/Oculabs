import { makeStyles } from "@mui/styles";
import { isMobile } from "react-device-detect";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    backgroundColor: color.white,
    padding: 10,
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    marginBottom: "10px !important",
  },
  scroll: {
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  icon: {
    backgroundColor: color.primary,
    color: color.white,
    borderRadius: "50%",
    width: 40,
    height: 40,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  arrowIcon: {
    fontSize: "30px",
    cursor: "pointer",
  },

  value: {
    paddingTop: 10,
    color: color.textColor,
    textAlign: "center",
    fontWeight: 500,
    fontSize: "16px !important",
  },

  imgContainer: {
    backgroundColor: color.borderColor,
    padding: 15,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
