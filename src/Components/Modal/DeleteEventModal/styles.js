import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  splitViewStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBtnStyle: { minWidth: "auto !important" },
  modalTitle: {
    lineHeight: "30px !important",
    "@media (max-width:768px)": {
      lineHeight: "30px !important",
    },
  },
  scrollBar: {
    "&::-webkit-scrollbar": {
      width: 0,
    },
  },
}));

export default useStyles;
