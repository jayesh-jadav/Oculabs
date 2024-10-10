import { makeStyles } from "@mui/styles";

const styles = makeStyles({
  scrollbar: {
    overflowY: "auto",
    overflowX: "hidden",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
