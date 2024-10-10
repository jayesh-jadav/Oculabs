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
    overflowY: "auto",
    overflowX: "hidden",
  },
  splitViewStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "20px 0px",
    padding: "0px 30px",
  },
  modalBtnStyle: { minWidth: "auto !important" },
});
export default styles;
