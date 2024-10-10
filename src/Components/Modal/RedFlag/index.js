import React, { useState } from "react";
import CModal from "../CModal";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { color } from "../../../Config/theme";
import { isEmpty, isNumber } from "lodash";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { CTypography } from "../../CTypography";
import { KeyboardArrowDown } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import styles from "./styles";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useDispatch } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";

const errorObj = {
  rejectErr: false,
  rejectMsg: "",
  reasonErr: false,
  reasonMsg: "",
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

export default function RedFlag(props) {
  const { visible, handleModal = () => null, data, id } = props;
  const className = styles();
  const { setEventID } = authActions;
  const dispatch = useDispatch();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const reasonToClose = [
    "Recovered and Returned to Activity",
    "Recovered but not Returned to Activity",
    "Lost to Follow Up",
    "Provider Referral",
    "Other",
  ];

  const referral = [
    "Visual Specialist",
    "Vestibular Specialist",
    "Occupational Therapist",
    "Cognitive/Behavioral Therapist",
    "Other",
  ];

  const [open, setOpen] = useState({});
  const [pNote, setPnote] = useState("");
  const [pNoteErr, setPnoteErr] = useState("");
  const [errObj, setErrObj] = useState(errorObj);
  const [btnLoad, setBtnLoad] = useState(false);

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredText, setReferredText] = useState("");
  const [referredReason, setReferredReason] = useState("");
  const [other, setOther] = useState("");

  function pNoteValidation() {
    if (isEmpty(pNote)) {
      setPnoteErr("Please enter provider note");
    } else {
      addProviderNoteApi();
    }
  }

  async function addProviderNoteApi() {
    try {
      const response = await getApiData(
        Setting.endpoints.addRedFlagReason,
        "POST",
        {
          text: pNote,
          event_id:
            id?.eventId ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          patient_id:
            id?.patientId ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          id: data?.ipi_id,
        }
      );

      if (response?.status) {
        toast.success(response?.message);
        setPnote("");
        setOpen({ ...open, continue: false });
        handleModal("success");
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:1024 ~ addProviderNoteApi ~ er:", er);
    }
  }

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
      closeEvent();
    }
  }

  async function closeEvent() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.closeEvent}?`,
        "POST",
        {
          event_id:
            id?.eventId ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          patient_id:
            id?.patientId ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          RRA: reason === 0 ? 1 : 0,
          RNRA: description || null,
          lost_follow_up: reason === 2 ? 1 : 0,
          provider_referral: referredTo === "Other" ? referredText : referredTo,
          referral_description: referredReason || null,
          other: other || null,
        }
      );
      if (response?.status) {
        toast.success(response.message);
        setOpen({ ...open, close: false });
        handleModal("close");
        clear();
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
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
    <>
      <CModal
        visible={visible}
        handleModal={() => {
          dispatch(setEventID(""));
          handleModal("close");
        }}
        title={"Red Flags Present"}
        children={
          <>
            <Grid container justifyContent={"center"}>
              <Grid item xs={12} textAlign={"center"} mb={2}>
                <Typography variant="tableTitle" color={color.error}>
                  Consider immediate referral for advanced care
                </Typography>
              </Grid>
              <Grid item mb={2}>
                <Typography
                  variant="title"
                  color={data?.gcs_score < 13 && color.error13}
                >
                  GCS Score : {data?.gcs_score}
                </Typography>
              </Grid>
              {data?.responses?.map((item, index) => {
                if (index < 13) {
                  return (
                    <Grid
                      key={index}
                      container
                      item
                      sm={item?.type === "6" ? 12 : 5.6}
                      marginBottom={2}
                      marginLeft={index === 3 && 0}
                    >
                      {item?.type === "6" && (
                        <Grid item xs={12} mb={1} textAlign={"center"}>
                          <Typography variant="tableTitle">
                            {item?.question}
                          </Typography>
                        </Grid>
                      )}
                      {item?.type !== "6" && (
                        <>
                          <Grid item xs={12}>
                            <Typography
                              variant="subTitle"
                              color={index > 4 && item?.answer && color.error}
                            >
                              Que: {item?.question}
                            </Typography>
                          </Grid>
                          <Grid item xs={12}>
                            <Typography
                              variant="subTitle"
                              color={index > 4 && item?.answer && color.error}
                            >
                              Ans: {}
                              {index < 4
                                ? `+${item?.answer} points`
                                : item?.answer
                                ? "Yes"
                                : "No"}
                            </Typography>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  );
                }
              })}
            </Grid>
            <Grid container justifyContent={"flex-end"} gap={1} mb={1}>
              <Grid item xs={2.5} md={1.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    handleModal("back");
                  }}
                >
                  Back
                </Button>
              </Grid>

              <Grid item xs={2.5} md={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setOpen({ ...open, close: true })}
                >
                  Close event
                </Button>
              </Grid>
              <Grid item xs={2.5} md={1.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => setOpen({ ...open, continue: true })}
                >
                  Continue to Potential Concussive Event Information
                </Button>
              </Grid>
            </Grid>
          </>
        }
      />

      <CModal
        visible={open?.continue}
        handleModal={() => {
          setPnote("");
          setOpen({ ...open, continue: false });
        }}
        title="Provider Note"
        children={
          <Grid container>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={5}
                placeholder="Please enter provider note"
                value={pNote}
                onChange={(e) => {
                  setPnoteErr("");
                  setPnote(e.target.value);
                }}
                error={!isEmpty(pNoteErr)}
                helperText={pNoteErr}
              />
            </Grid>
            <Grid
              item
              xs={12}
              mt={2}
              display={"flex"}
              justifyContent={"flex-end"}
              gap={1}
            >
              <Grid item xs={2.5} md={4}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setPnote("");
                    setOpen({ ...open, continue: false });
                  }}
                >
                  Back
                </Button>
              </Grid>

              <Grid item xs={2.5} md={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => pNoteValidation()}
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
          </Grid>
        }
      />

      <CModal
        maxWidth={"600px"}
        visible={open?.close}
        handleModal={() => {
          clear();
          setOpen({ ...open, close: false });
        }}
        title="You are about to close this event!"
        subTitle="Once the event outcome is selected below and this event is closed, the outcome will be permanently recorded and no additional assessments will be recorded for this event.
        You will need to reopen the event to make any changes or resume assessments."
        children={
          <>
            <Grid container className={className.scrollbar}>
              <Grid container style={{ marginBottom: 20 }}>
                <Typography>
                  <Typography variant="subTitle">
                    Note: Once the event outcome is selected below and this
                    event is closed, the outcome will be permanently recorded
                    and no additional assessments will be recorded for this
                    event. You will need to reopen the event to make any changes
                    or resume assessments.
                  </Typography>
                </Typography>
              </Grid>
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
                          Please selected
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
            <Grid
              item
              xs={12}
              mt={2}
              display={"flex"}
              justifyContent={"flex-end"}
              gap={1}
            >
              <Grid item xs={2.5}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    clear();
                    setOpen({ ...open, close: false });
                  }}
                >
                  Back
                </Button>
              </Grid>

              <Grid item xs={2.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => validation()}
                  disabled={btnLoad}
                >
                  {btnLoad ? <CircularProgress size={22} /> : "Close Event"}
                </Button>
              </Grid>
            </Grid>
          </>
        }
      />
    </>
  );
}
