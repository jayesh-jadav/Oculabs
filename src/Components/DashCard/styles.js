import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  card: {
    backgroundColor: color.white,
    padding: "8px 16px",
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    width: "100%",
    height: "100%",
  },
  cardArrow: {
    backgroundColor: color.white,
    padding: "8px 16px",
    border: `1px solid ${color.borderColor}`,
    borderRadius: 12,
    boxShadow: color.shadow,
    width: "100%",
    height: "100%",
    cursor: "pointer",
    transition: "500ms",
    "&:hover": {
      transform: "translatey(-0.4rem)",
    },
  },
  imgContainer: {
    backgroundColor: color.borderColor,
    // padding: 15,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxHeight: 50,
    maxWidth: 50,
    minWidth: 50,
    minHeight: 50,
  },
  tabImgContainer: {
    backgroundColor: color.borderColor,
    padding: 10,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
