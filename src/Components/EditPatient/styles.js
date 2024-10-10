import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  dottedBorder: {
    border: `1px dashed ${color.primary} !important`,
    borderWidth: "2px !important",
    boxShadow: `${color.shadow} !important`,
  },
  modalContainer: {
    borderRadius: "12px",
    backgroundColor: color.white,
    overFlow: "hidden",
    position: "relative",
  },
  scrollbar: {
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
