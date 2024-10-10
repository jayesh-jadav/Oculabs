import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  gridContainer: {
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
    padding: 16,
  },
});

export default styles;
