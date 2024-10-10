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
  FormHelperText,
  Select,
  FormControl,
  MenuItem,
  IconButton,
} from "@mui/material";
import useStyles from "./styles";
import { isTablet } from "react-device-detect";
import { isEmpty, isNumber } from "lodash";
import { CTypography } from "../../CTypography";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { color } from "../../../Config/theme";
import { reasonToClose, referral } from "../../../Config/Static_Data";
import { KeyboardArrowDown } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";

const errorObj = {
  descriptionErr: false,
  descriptionMsg: "",
  refereErr: false,
  refereMsg: "",
  refereTxtErr: false,
  refereTxtMsg: "",
  refereReasonErr: false,
  refereReasonMsg: "",
  otherErr: false,
  otherMsg: "",
};

export default function CloseEvent(props) {
  const {
    visible = false,
    handleModal = () => null,
    maxWidth = "",
    data = {},
    type = "",
  } = props;
  const classes = useStyles();
  const [btnLoad, setBtnLoad] = useState(false);
  const [description, setDescription] = useState("");
  const [errObj, setErrObj] = useState(errorObj);
  const [reason, setReason] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredText, setReferredText] = useState("");
  const [referredReason, setReferredReason] = useState("");
  const [other, setOther] = useState("");

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

    if (!isNumber(reason)) {
      valid = false;
      error.reasonErr = true;
      error.reasonMsg = "";
    }
    if (reason === 1 && isEmpty(description)) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = "Please enter description";
    }
    if (reason === 3 && isEmpty(referredTo)) {
      valid = false;
      error.refereErr = true;
      error.refereMsg = "Please select whom to refere";
    }
    if (referredTo === "Other" && isEmpty(referredText)) {
      valid = false;
      error.refereTxtErr = true;
      error.refereTxtMsg = "Please enter whom to refere";
    }
    if (reason === 3 && isEmpty(referredReason)) {
      valid = false;
      error.refereReasonErr = true;
      error.refereReasonMsg = "Please enter reason for referral";
    }
    if (reason === 4 && isEmpty(other)) {
      valid = false;
      error.otherErr = true;
      error.otherMsg = "Please enter patient's outcome";
    }

    setErrObj(error);
    if (valid) {
      return closeEvent();
    }
  }

  // this function is used for close event
  async function closeEvent() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.closeEvent}?`,
        "POST",
        {
          event_id: data?.event_id,
          patient_id: data?.patient_id,
          RRA: reason === 0 ? 1 : 0,
          RNRA: description || null,
          lost_follow_up: reason === 2 ? 1 : 0,
          provider_referral: referredTo === "Other" ? referredText : referredTo,
          referral_description: referredReason || null,
          other: other || null,
        }
      );
      if (response?.status) {
        if (type === "diagnosis") {
          generateDiagnose(data?.event_id);
        }
        toast.success(response.message);
        handleModal("success");
        clear();
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

  // this function is used to generate a diagnose logs
  async function generateDiagnose(eventId) {
    try {
      const response = await getApiData(
        Setting.endpoints.updateDiagnose,
        "PATCH",
        {
          event_id: +eventId,
        }
      );
      if (response.status) {
        // toast.success(response.message.toString());
      } else {
        toast.error(response.message.toString());
      }
    } catch (error) {
      toast.error(error.toString());
    } finally {
    }
  }

  function clear() {
    setReason("");
    setDescription("");
    setReferredTo("");
    setReferredText("");
    setReferredReason("");
    setOther("");
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
              You are about to close this event!
            </Typography>
          </Grid>

          <Grid container style={{ marginBottom: 20 }}>
            <Typography>
              <Typography variant="subTitle">Note: </Typography> Once the event
              outcome is selected below and this event is closed, the outcome
              will be permanently recorded and no additional assessments will be
              recorded for this event. You will need to reopen the event to make
              any changes or resume assessments.
            </Typography>
          </Grid>

          <Grid container className={classes.scrollbar}>
            <Grid item xs={12} mb={2}>
              <CTypography title="Select reason" required />
              <FormControl fullWidth error={errObj.reasonErr}>
                <Select
                  fullWidth
                  displayEmpty
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrObj({ ...errObj, reasonErr: false, reasonMsg: "" });
                  }}
                  style={isNumber(reason) ? {} : { color: color.disable }}
                  IconComponent={!isNumber(reason) && KeyboardArrowDown}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: isNumber(reason) ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setReason("");
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value="" selected hidden disabled>
                    Please select reason to close event
                  </MenuItem>
                  {reasonToClose.map((item, index) => {
                    return (
                      <MenuItem key={index} value={index}>
                        {item}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              {errObj.reasonErr && (
                <FormHelperText
                  style={{
                    color: color.error,
                  }}
                >
                  Please select a reason for closing event
                </FormHelperText>
              )}
            </Grid>
            {reason === 1 && (
              <Grid item xs={12} mb={2}>
                <CTypography title="Please describe" required />
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  maxRows={5}
                  placeholder="Please describe"
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
            )}
            {reason === 3 && (
              <>
                <Grid item xs={12} mb={2}>
                  <CTypography title="Referred to" required />
                  <FormControl fullWidth error={errObj.refereErr}>
                    <Select
                      displayEmpty
                      fullWidth
                      value={referredTo}
                      onChange={(e) => {
                        setReferredTo(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereErr: false,
                          refereMsg: "",
                        });
                      }}
                      style={
                        isEmpty(referredTo) ? { color: color.disable } : {}
                      }
                      IconComponent={!referredTo && KeyboardArrowDown}
                      endAdornment={
                        <IconButton
                          sx={{
                            display: referredTo ? "visible" : "none",
                            padding: 0,
                          }}
                          onClick={() => {
                            setReferredTo("");
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      }
                    >
                      <MenuItem value="" selected hidden disabled>
                        Please select
                      </MenuItem>
                      {referral.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  {errObj.refereErr && (
                    <FormHelperText
                      style={{
                        color: color.error,
                      }}
                    >
                      {errObj.refereMsg}
                    </FormHelperText>
                  )}
                </Grid>
                {referredTo === "Other" && (
                  <Grid item xs={12} mb={2}>
                    <CTypography title="Referred to" required />
                    <TextField
                      fullWidth
                      placeholder="Referred to..."
                      value={referredText}
                      onChange={(e) => {
                        setReferredText(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereTxtErr: false,
                          refereTxtMsg: "",
                        });
                      }}
                      error={errObj.refereTxtErr}
                      helperText={errObj.refereTxtMsg}
                    />
                  </Grid>
                )}
                {!isEmpty(referredTo) && (
                  <Grid item xs={12} mb={2}>
                    <CTypography title="Reason for referral" required />
                    <TextField
                      fullWidth
                      placeholder="Reason for referral"
                      value={referredReason}
                      onChange={(e) => {
                        setReferredReason(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereReasonErr: false,
                          refereReasonMsg: "",
                        });
                      }}
                      error={errObj.refereReasonErr}
                      helperText={errObj.refereReasonMsg}
                    />
                  </Grid>
                )}
              </>
            )}
            {reason === 4 && (
              <Grid item xs={12} mb={2}>
                <CTypography
                  title="Please describe the patient's outcome"
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  maxRows={5}
                  placeholder="Please describe the patient's outcome"
                  value={other}
                  onChange={(e) => {
                    setOther(e.target.value);
                    setErrObj({
                      ...errObj,
                      otherErr: false,
                      otherMsg: "",
                    });
                  }}
                  error={errObj.otherErr}
                  helperText={errObj.otherMsg}
                />
              </Grid>
            )}
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
              {btnLoad ? <CircularProgress size={22} /> : "Close Event"}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
