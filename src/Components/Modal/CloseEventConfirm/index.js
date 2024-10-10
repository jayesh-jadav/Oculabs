import React, { useState } from "react";
import {
  Typography,
  Backdrop,
  Fade,
  Box,
  Modal,
  Button,
  CircularProgress,
  Grid,
} from "@mui/material";
import useStyles from "./styles";
import { isMobile } from "react-device-detect";
import { isEmpty } from "lodash";

export default function CloseEventConfirm(props) {
  const {
    visible = false,
    handleModal = () => null,
    child,
    title = "",
    btnLoad = false,
    subTitle = "",
    btnTitle,
    maxWidth = "",
  } = props;
  const classes = useStyles();

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? 300 : maxWidth || 400,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 3,
  };

  return (
    <Modal
      open={visible}
      closeAfterTransition
      disableAutoFocus
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={visible}>
        <Box sx={style}>
          <Grid container alignItems={"center"}>
            <Typography
              variant="title"
              className={classes.modalTitle}
              style={{
                marginBottom: 10,
              }}
            >
              {title || ""}
            </Typography>
          </Grid>
          {!isEmpty(subTitle) && (
            <Grid container style={{ marginBottom: 20 }}>
              <Typography>
                <Typography variant="subTitle">Note: </Typography>{" "}
                {subTitle || ""}
              </Typography>
            </Grid>
          )}
          {child}
          <div className={classes.splitViewStyle}>
            <Button
              variant="outlined"
              className={classes.modalBtnStyle}
              style={{ marginRight: 16 }}
              fullWidth
              onClick={() => {
                handleModal("close");
              }}
            >
              Cancel
            </Button>
            <Button
              variant={"contained"}
              color="primary"
              className={classes.modalBtnStyle}
              fullWidth
              onClick={() => {
                handleModal("success");
              }}
              disabled={btnLoad}
            >
              {btnLoad ? <CircularProgress size={22} /> : btnTitle}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
