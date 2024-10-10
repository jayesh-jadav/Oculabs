import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  splitViewStyle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalBtnStyle: { minWidth: "auto !important" },
  modalTitle: {
    // fontSize: "30px !important",
    marginBottom: "30px !important",
    lineHeight: "36px !important",
    "@media (max-width:1024px)": {
      fontSize: "24px !important",
    },
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
