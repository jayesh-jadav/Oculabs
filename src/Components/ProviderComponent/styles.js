import { makeStyles } from "@mui/styles";
import { color } from "../../Config/theme";

const styles = makeStyles({
  container: {
    padding: "16px 16px",
    backgroundColor: color.white,
    borderRadius: 12,
    boxShadow: color.shadow,
  },

  cardContainer: {
    dispplay: "flex",
    alignItems: "center",
  },
  btn: {
    minWidth: "150px !important",
  },
  // bottom card
  bottomCardContainer: {
    padding: "24px 16px",
    backgroundColor: color.white,
    boxShadow: color.shadow,
    borderRadius: 12,
  },
  subBottomCardContainer: {
    border: `1px solid ${color.lightBorder}`,
    padding: "16px 24px",
    borderRadius: 12,
    backgroundColor: color.white,
  },
  title: {
    fontSize: "12px !important",
    fontWeight: "400 !important",
    opacity: "0.7 !important",
    paddingBottom: 5,
  },
});

export default styles;
