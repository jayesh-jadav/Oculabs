import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  scrollbar: {
    width: "100%",
    height: "65vh",
    padding: "0 10px",
    marginBottom: 20,
    overflowY: "scroll",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 5,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
  },
});
export default styles;
