import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";
const styles = makeStyles({
  container: {
    overflow: "auto",
    padding: "70px 50px 50px 50px",
    backgroundColor: color.white,
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  loaderContainer: {
    display: "grid",
    height: "80vh",
    placeItems: "center",
  },
});

export default styles;
