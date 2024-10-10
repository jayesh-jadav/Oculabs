import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  btn: {
    border: `1px solid ${color.borderColor} !important`,
    borderRadius: "12px !important",
    maxHeight: "100px !important",
    maxWidth: "100px !important",
    minWidth: "100px !important",
    minHeight: "100px !important",
    display: "flex !important",
    alignItems: "center !important",
    justifyContent: "center !important",
    color: `${color.primary} !important`,
    fontSize: "30px !important",
    overflow: "hidden !important",
    boxShadow: color.shadow,
  },
});
export default styles;
