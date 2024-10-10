import { makeStyles } from "@mui/styles";
import { color, FontFamily } from "../../Config/theme";

const styles = makeStyles({
  title: {
    fontSize: "12px !important",
    fontWeight: "400 !important",
    opacity: "0.7 !important",
    paddingBottom: 5,
  },

  roundDateIcon: {
    padding: "8px !important",
    borderRadius: "50% !important",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px !important",
    minWidth: "40px !important",
    minHeight: "40px !important",
  },
  tbRoundContainer: {
    backgroundColor: color.main,
    padding: 10,
    borderRadius: "30px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    maxWidth: "45px",
  },
  calendarHeader: {
    backgroundColor: "#f0f0f0",
    color: "red",
    fontWeight: "bold",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginBottom: 20,
  },
  calendarIconContainer: {
    padding: "8px !important",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    position: "absolute !important",
    top: 10,
    left: 10,
  },
  scrollBar: {
    overflow: "scroll",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
  text: {
    whiteSpace: "nowrap",
    width: "200px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    fontSize: "15px",
    fontFamily: FontFamily.Regular,
    color: color.textColor,
    textTransform: "capitalize",
  },
});

export default styles;
