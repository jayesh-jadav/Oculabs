import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  container: {
    backgroundColor: color.white,
    padding: 10,
    borderRadius: 12,
    boxShadow: color.shadow,
  },
  scrollBar: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  flagViewScroll: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
