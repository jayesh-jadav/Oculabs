import { makeStyles } from "@mui/styles";

const styles = makeStyles({
  container: {
    width: "100%",
    height: "100%",
    padding: 16,
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});

export default styles;
