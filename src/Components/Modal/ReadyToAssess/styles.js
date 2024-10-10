import { makeStyles } from "@mui/styles";

const styles = makeStyles({
  scrollbar: {
    width: "100%",
    marginBottom: 20,
    overflowY: "scroll",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
