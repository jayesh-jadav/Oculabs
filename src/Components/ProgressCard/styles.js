import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  container: {
    border: `1px solid ${color.lightBorder}`,
    padding: "10px",
    borderRadius: 12,
    backgroundColor: color.white,
    transition: "500ms",
    boxShadow: color.dashCardShadow,
    "&:hover": {
      boxShadow: color.shadow,
      transform: "translatey(-0.1rem)",
    },
  },
  avatarContainer: {
    paddingLeft: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  IconContainer: {
    padding: 5,
    backgroundColor: color.primary,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: "14px !important",
    fontWeight: "400 !important",
    opacity: "0.7 !important",
    color: `${color.textColor} !important`,
  },
});
export default styles;
