import { makeStyles } from "@mui/styles";

const styles = makeStyles({
  scrollBar: {
    overflowY: "auto",
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
});
export default styles;
