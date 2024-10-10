import { makeStyles } from "@mui/styles";
import { color } from "../../../Config/theme";

const styles = makeStyles({
  modalContainer: {
    borderRadius: "12px",
    backgroundColor: color.white,
    overFlow: "hidden",
    position: "relative",
  },
  scrollbar: {
    overflowY: "scroll",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
