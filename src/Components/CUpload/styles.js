import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  btn: {
    border: `1px solid ${color.primary} !important`,
    borderRadius: "12px !important",
    maxHeight: "40px !important",
    maxWidth: "40px !important",
    minWidth: "40px !important",
    minHeight: "40px !important",
    display: "flex !important",
    alignItems: "center !important",
    justifyContent: "center !important",
    fontSize: "30px !important",
    overflow: "hidden !important",
  },
});
export default styles;
