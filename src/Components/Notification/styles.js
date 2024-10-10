import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  scrollBar: {
    overflow: "auto",
    "&::-webkit-scrollbar": {
      width: 5,
    },
    "&::-webkit-scrollbar-thumb": {
      background: color.primary,
      borderRadius: 10,
    },
    "&::-webkit-scrollbar-track": {
      background: color.placeholder,
    },
  },
});
export default styles;
