import { makeStyles } from "@mui/styles";
import { isMobile, isTablet } from "react-device-detect";
import { color } from "../../Config/theme";

const styles = makeStyles({
  card: {
    backgroundColor: color.white,
    padding: isMobile ? 10 : 15,
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    width: isTablet ? "auto !important" : "365px !important",
  },
  imgContainer: {
    backgroundColor: color.borderColor,
    padding: 10,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  IconContainer: {
    padding: 6,
    backgroundColor: color.primary,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
