import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  eRTA: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  fullName: {
    maxWidth: 300,
    paddingLeft: 10,
    overflow: "hidden !important",
    whiteSpace: "nowrap !important",
    textOverflow: "ellipsis !important",
  },
});
export default styles;
