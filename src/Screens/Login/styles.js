import { makeStyles } from "@mui/styles";
import { isMobile } from "react-device-detect";
import { color } from "../../Config/theme";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: isMobile ? "4rem !important" : "6rem !important",
    height: isMobile ? "90vh" : "100vh",
  },
  forgot: {
    color: `${color.primary} !important`,
    fontSize: "16px !important",
    textAlign: "center",
    cursor: "pointer",
  },
}));
export default useStyles;
