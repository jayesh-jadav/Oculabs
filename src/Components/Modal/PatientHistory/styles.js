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
    width: "100%",
    height: "60vh",
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

  btn: {
    textTransform: "capitalize !important",
  },
});
export default styles;
