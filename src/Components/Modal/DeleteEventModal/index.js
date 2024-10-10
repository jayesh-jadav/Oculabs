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
  TextField,
} from "@mui/material";
import useStyles from "./styles";
import { isTablet } from "react-device-detect";
import { isEmpty } from "lodash";
import { CTypography } from "../../CTypography";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";

const errorObj = {
  descriptionErr: false,
  descriptionMsg: "",
};

export default function DeleteEvent(props) {
  const {
    visible = false,
    handleModal = () => null,
    maxWidth = "",
    data = {},
  } = props;
  const classes = useStyles();
  const [btnLoad, setBtnLoad] = useState(false);
  const [description, setDescription] = useState("");
  const [errObj, setErrObj] = useState(errorObj);

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isTablet ? 300 : 600,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 3,
  };

  // this function is used for validation
  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (isEmpty(description)) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = `Please enter reason for  "deleting" this event`;
    }

    setErrObj(error);
    if (valid) {
      return deleteEvent();
    }
  }

  // this function is used for delete event
  async function deleteEvent() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.deleteEvent}?`,
        "POST",
        {
          patient_id: data?.patient_id,
          event_id: data?.event_id,
          reject_reason: description,
        }
      );
      if (response?.status) {
        toast.success(response.message);
        handleModal("success");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error =======>>>", error);
      toast.error(error.toString());
    } finally {
      setBtnLoad(false);
    }
  }

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
              You are about to delete this event!
            </Typography>
          </Grid>

          <Grid container style={{ marginBottom: 20 }}>
            <Typography>
              <Typography variant="subTitle">Note: </Typography> Delete this
              event will removed all stored event information and assessments.
              You will not be able to restore event information once this action
              is completed.
            </Typography>
          </Grid>

          <Grid container style={{ marginBottom: 20 }}>
            <CTypography
              title={"Please provide a reason for deleting this event:"}
              required
              variant={"subTitle"}
            />
            <TextField
              placeholder={"Please provide a reason for deleting this event"}
              fullWidth
              multiline
              maxRows={5}
              minRows={5}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrObj({
                  ...errObj,
                  descriptionErr: false,
                  descriptionMsg: "",
                });
              }}
              error={errObj.descriptionErr}
              helperText={errObj.descriptionMsg}
            />
          </Grid>
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
                validation();
              }}
              disabled={btnLoad}
            >
              {btnLoad ? <CircularProgress size={22} /> : "Delete"}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
