import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 20,
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  gridContainer: {
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
    padding: 20,
  },

  scrollbar: {
    overflow: "auto",
    paddingRight: 10,
    "&::-webkit-scrollbar": {
      width: 1,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
  },
});

export default styles;
