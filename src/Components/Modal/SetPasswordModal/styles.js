import { makeStyles } from "@mui/styles";

const useStyles = makeStyles((theme) => ({
  splitViewStyle: {
    display: "flex",
    justifyContent: "center",
  },
  modalBtnStyle: { minWidth: "140px !important" },
  modalTitle: {
    marginBottom: "30px !important",
    lineHeight: "36px !important",
    "@media (max-width:1024px)": {
      fontSize: "24px !important",
    },
    "@media (max-width:768px)": {
      lineHeight: "30px !important",
    },
  },
}));

export default useStyles;
