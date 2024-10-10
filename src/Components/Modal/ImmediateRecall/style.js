import { makeStyles } from "@mui/styles";

const styles = makeStyles({
  scrollbar: {
    width: "100%",
    height: "60vh",
    padding: "0 10px",
    marginBottom: 20,
    overflowY: "scroll",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },

  loader: {
    height: "50vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});
export default styles;
