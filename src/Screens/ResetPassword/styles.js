import { makeStyles } from "@mui/styles";
import { isMobile } from "react-device-detect";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: isMobile ? "4rem !important" : "6rem !important",
    height: isMobile ? "90vh" : "100vh",
  },
}));
export default useStyles;
