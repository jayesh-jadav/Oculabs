import React, { useEffect, useState } from "react";
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
  Tooltip,
} from "@mui/material";
import styles from "./styles";
import { toast } from "react-toastify";
import CloseEventConfirm from "../CloseEventConfirm";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isArray, isEmpty, isNull, isNumber } from "lodash";
import { CTypography } from "../../CTypography";
import ImmediatePostInjury from "../ImmediatePostInjury";
import InitialVisit from "../InitialVisit";
import RedFlag from "../RedFlag";
import { KeyboardArrowDown } from "@mui/icons-material";
import { color } from "../../../Config/theme";
import ClearIcon from "@mui/icons-material/Clear";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { reasonToClose, referral } from "../../../Config/Static_Data";
import RTAstageModal from "../RATstageModal";
import { hasPermission } from "../../../Utils/CommonFunctions";
import { useSelector } from "react-redux";

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
  RTAStageErr: false,
  RTAStageMsg: "",
};
export default function ManageEvent(props) {
  const {
    visible = false,
    handleModal = () => null,
    data,
    eventData,
    editEvent,
  } = props;
  const className = styles();
  const { permissionData, userType } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [open, setOpen] = useState({});
  const [confirmModalType, setConfirmModalType] = useState("");
  const [btnLoad, setBtnLoad] = useState({ delete: false, export: false });
  const [errObj, setErrObj] = useState(errorObj);
  const [eventType, setEventType] = useState(null);
  const [redFlagData, setRedFlagData] = useState({});
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredText, setReferredText] = useState("");
  const [referredReason, setReferredReason] = useState("");
  const [other, setOther] = useState("");
  const [rtaStage, setRtaStage] = useState({
    diagnosis: false,
    progress: false,
    notProgress: false,
    loader: false,
  });

  useEffect(() => {
    setErrObj(errorObj);
    setDescription("");
  }, [open]);

  useEffect(() => {
    if (editEvent === "IPI") {
      setOpen({ ...open, IPI: true });
    } else if (editEvent === "IV") {
      setOpen({ ...open, IV: true });
    }
  }, [editEvent]);

  useEffect(() => {
    if (searchParams.has("diagnosis")) {
      if (searchParams.get("diagnosis") === "close") {
        setConfirmModalType("close_event");
        setOpen({ ...open, confirm: true });
      } else if (searchParams.get("diagnosis") === "reopen") {
        setConfirmModalType("reopen_event");
        setOpen({ ...open, confirm: true });
      } else {
        setConfirmModalType("delete_event");
        setOpen({ ...open, confirm: true });
      }
    } else {
      setOpen({ ...open, confirm: false });
    }

    if (searchParams.has("RTA")) {
      if (searchParams.get("RTA") === "diagnosis") {
        setRtaStage({ ...rtaStage, diagnosis: true });
      } else if (searchParams.get("RTA") === "progress") {
        setRtaStage({ ...rtaStage, progress: true });
      } else if (searchParams.get("RTA") === "not_progress") {
        setRtaStage({ ...rtaStage, notProgress: true });
      }
    }
  }, [searchParams]);

  // this function is used for validation
  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (confirmModalType === "close_event") {
      if (!isNumber(reason)) {
        valid = false;
        error.reasonErr = true;
        error.reasonMsg = "Please select a reason for closing event";
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
    } else {
      if (isEmpty(description)) {
        valid = false;
        error.descriptionErr = true;
        error.descriptionMsg = `Please enter reason for ${
          confirmModalType === "delete_event" ? "deleting" : "reopening"
        } this event`;
      }
    }

    setErrObj(error);
    if (valid) {
      if (confirmModalType === "delete_event") {
        return deleteEvent();
      } else if (confirmModalType === "close_event") {
        return closeEvent();
      } else {
        return reopenEvent();
      }
    }
  }

  // this function is used for delete event
  async function deleteEvent() {
    setBtnLoad({ ...btnLoad, delete: true });
    try {
      const response = await getApiData(
        `${Setting.endpoints.deleteEvent}?`,
        "POST",
        {
          patient_id:
            data?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          event_id:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          reject_reason: description,
        }
      );
      if (response?.status) {
        toast.success(response.message);
        setOpen({ ...open, confirm: false });
        handleModal("success", "delete");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad({ ...btnLoad, delete: false });
    } catch (error) {
      setBtnLoad({ ...btnLoad, delete: false });
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  // this function is used for close event
  async function closeEvent() {
    setBtnLoad({ ...btnLoad, delete: true });
    try {
      const response = await getApiData(
        `${Setting.endpoints.closeEvent}?`,
        "POST",
        {
          event_id:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          patient_id:
            data?.id ||
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
        setOpen({ ...open, confirm: false });
        handleModal("success");
        clear();
      } else {
        toast.error(response?.message);
      }
      setBtnLoad({ ...btnLoad, delete: false });
    } catch (error) {
      setBtnLoad({ ...btnLoad, delete: false });
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  // this function is used for reopen event
  async function reopenEvent() {
    setBtnLoad({ ...btnLoad, delete: true });
    try {
      const response = await getApiData(
        `${Setting.endpoints.reopenEvent}?`,
        "POST",
        {
          patient_id:
            data?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          event_id:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          reopen_reason: description,
        }
      );
      if (response?.status) {
        toast.success(response.message);
        setOpen({ ...open, confirm: false });
        handleModal("success");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad({ ...btnLoad, delete: false });
    } catch (error) {
      setBtnLoad({ ...btnLoad, delete: false });
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  async function exportEventApi() {
    setBtnLoad({ ...btnLoad, export: true });
    try {
      const response = await getApiData(Setting.endpoints.exportEvent, "POST", {
        event_id: Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        patient_id: Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
      });

      if (response?.status) {
        downloadFile(response?.data, response?.type, response?.file_name);
        handleModal("close");
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ exportEventApi ~ err==========>>>>>>>>>>", err);
    } finally {
      setBtnLoad({ ...btnLoad, export: false });
    }
  }

  const downloadFile = async (dataUrl, type, fileName) => {
    try {
      if (type === "pdf") {
        const response = await fetch(dataUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataUrl}: ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        // Create a temporary link element
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.pdf`;
        a.style.display = "none";

        document.body.appendChild(a);
        a.click();

        // Cleanup
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const url = dataUrl;
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName || url.split("/").pop();
        a.target = "_blank";
        a.style.display = "none";

        // Append the link to the body and trigger the download
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };

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
          handleModal("close");
        }}
        maxWidth={"600px"}
        title={"Manage Event"}
        children={
          <>
            <Grid
              container
              rowGap={"20px"}
              style={{ padding: "10px 0px 20px 0px" }}
            >
              {+eventData?.status == 1 ? (
                <React.Fragment>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexWrap={"nowrap"}
                    gap={"20px"}
                  >
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          setRtaStage({
                            ...rtaStage,
                            editRTA: true,
                          });
                        }}
                      >
                        Edit RTA Stage
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <Tooltip
                        title="Once the event outcome is selected below and the event is closed, the outcome will be permanently recorded, and no additional assessments will be recorded for this event. You will need to reopen the event to make any changes or resume assessments."
                        arrow
                      >
                        <Button
                          variant="contained"
                          fullWidth
                          style={{ minWidth: 100 }}
                          onClick={() => {
                            setConfirmModalType("close_event");
                            setOpen({ ...open, confirm: true });
                          }}
                        >
                          Close Event and Record Outcome
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexWrap={"nowrap"}
                    gap={"20px"}
                  >
                    <Tooltip
                      title="Deleting this event will remove all stored event information and assessments. You will not be able to restore event information once this action is completed."
                      arrow
                    >
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          setConfirmModalType("delete_event");
                          setOpen({ ...open, confirm: true });
                        }}
                      >
                        Delete Event
                      </Button>
                    </Tooltip>
                    {Number(eventData?.event_type) !== 1 && (
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          if (Number(eventData?.event_type) === 3) {
                            setEventType(3);
                            setOpen({ ...open, IV: true });
                          }
                          if (Number(eventData?.event_type) === 2) {
                            setEventType(2);
                            setOpen({ ...open, IPI: true });
                          }
                        }}
                      >
                        Edit Event Information
                      </Button>
                    )}
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => exportEventApi()}
                      disabled={btnLoad?.export}
                    >
                      {btnLoad?.export ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Export Event"
                      )}
                    </Button>
                  </Grid>
                </React.Fragment>
              ) : (
                <>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexWrap={"nowrap"}
                    gap={"20px"}
                  >
                    {(hasPermission(permissionData, "review_action") ||
                      userType === "org_admin") && (
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          setConfirmModalType("delete_event");
                          setOpen({ ...open, confirm: true });
                        }}
                      >
                        Delete Event
                      </Button>
                    )}
                    {Number(eventData?.event_type) !== 1 && (
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          if (Number(eventData?.event_type) === 3) {
                            setOpen({ ...open, IV: true });
                          }
                          if (Number(eventData?.event_type) === 2) {
                            setOpen({ ...open, IPI: true });
                          }
                        }}
                      >
                        Edit Event Information
                      </Button>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display={"flex"}
                    flexWrap={"nowrap"}
                    gap={"20px"}
                  >
                    {(hasPermission(permissionData, "review_action") ||
                      userType === "org_admin") && (
                      <Button
                        variant="contained"
                        fullWidth
                        style={{ minWidth: 100 }}
                        onClick={() => {
                          setConfirmModalType("reopen_event");
                          setOpen({ ...open, confirm: true });
                        }}
                      >
                        Reopen Event
                      </Button>
                    )}
                    <Button
                      fullWidth
                      style={{ minWidth: 100 }}
                      variant="contained"
                      onClick={() => exportEventApi()}
                      disabled={btnLoad?.export}
                    >
                      {btnLoad?.export ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Export Event"
                      )}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </>
        }
      />

      {/* add or edit RTA stage model */}
      <RTAstageModal
        visible={
          rtaStage.diagnosis ||
          rtaStage?.progress ||
          rtaStage?.notProgress ||
          rtaStage?.editRTA
        }
        eventData={eventData}
        editData={rtaStage?.editRTA}
        handleClose={(e) => {
          if (e === "success") {
            handleModal("success");
          }
          if (searchParams.has("RTA")) {
            delete queryParams.RTA;
            setSearchParams({ ...queryParams }, { replace: true });
          }
          setRtaStage({
            ...rtaStage,
            diagnosis: false,
            progress: false,
            notProgress: false,
            editRTA: false,
            dropValue: "",
            dropText: "",
            dropErr: false,
            dropErrMsg: "",
          });
        }}
      />

      <CloseEventConfirm
        maxWidth={"600px"}
        visible={open.confirm}
        title={
          confirmModalType === "delete_event"
            ? "You are about to delete this event!"
            : confirmModalType === "close_event"
            ? "You are about to close this event!"
            : "Are you sure you want reopen this event!"
        }
        subTitle={
          confirmModalType === "delete_event"
            ? "Delete this event will removed all stored event information and assessments. You will not be able to restore event information once this action is completed."
            : confirmModalType === "close_event"
            ? `Once the event outcome is selected below and this event is closed, the outcome will be permanently recorded and no additional assessments will be recorded for this event.
        You will need to reopen the event to make any changes or resume assessments.`
            : ""
        }
        btnLoad={btnLoad.delete}
        btnTitle={
          confirmModalType === "delete_event"
            ? "Delete"
            : confirmModalType === "close_event"
            ? "Close Event"
            : "Reopen"
        }
        handleModal={(type) => {
          if (type === "close") {
            delete queryParams?.RTA;
            delete queryParams?.diagnosis;
            setSearchParams({ ...queryParams }, { replace: true });
            setOpen({ ...open, confirm: false });
            setReason([]);
            clear();
          } else {
            validation();
          }
        }}
        child={
          confirmModalType === "close_event" ? (
            <Grid container className={className.scrollbar}>
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
                    {errObj.reasonMsg}
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
          ) : (
            <Grid container style={{ marginBottom: 20 }}>
              <CTypography
                title={
                  confirmModalType === "delete_event"
                    ? "Please provide a reason for deleting this event:"
                    : "Please provide a reason for reopening this event:"
                }
                required
                variant={"subTitle"}
              />
              <TextField
                placeholder={
                  confirmModalType === "delete_event"
                    ? "Please provide a reason for deleting this event"
                    : "Please provide a reason for reopening this event"
                }
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
          )
        }
      />
      {/* immediate post injury modal IPI*/}
      <ImmediatePostInjury
        from="manageEvent"
        cancelBtn={"Cancel"}
        visible={open.IPI}
        // from="IPIInfo"
        // from={visible ? "IPIInfo" : ""}
        handleModal={(type, data) => {
          setRedFlagData(data);
          if (type === "close") {
            if (editEvent) {
              handleModal("close");
            }
            setOpen({ ...open, IPI: false });
          } else if (type === "success") {
            if (editEvent) {
              setOpen({ ...open, IPI: false });
              handleModal("close");
            } else {
              if (
                (!data?.previous_red_flag && data?.current_red_flag) ||
                (data?.previous_red_flag && data?.current_red_flag)
              ) {
                setOpen({ ...open, redFlag: true, IPI: false });
              } else {
                setOpen({ ...open, IPI: false, IV: true });
              }
            }
          } else if (type === "back") {
            if (editEvent) {
              handleModal("close");
            }
            setOpen({ ...open, IPI: false });
          }
        }}
        data={{
          patientId:
            data?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          eventId:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
      />

      {/* initial visit modal IV*/}
      <InitialVisit
        visible={open.IV}
        from={"IPI"}
        btnTitle={"Submit"}
        cancelBtn={"Cancel"}
        handleModal={(type) => {
          if (type === "close") {
            if (editEvent) {
              handleModal("close");
            }
            setOpen({ ...open, IV: false });
          } else if (type === "back") {
            if (editEvent) {
              setOpen({ ...open, IV: false });
              handleModal("close");
            } else {
              if (Number(eventType) !== 3) {
                setOpen({ ...open, IPI: true, IV: false });
              } else {
                if (
                  !redFlagData?.previous_red_flag &&
                  redFlagData?.current_red_flag
                ) {
                  setOpen({ ...open, IPI: false, IV: false, redFlag: true });
                } else {
                  setOpen({ ...open, IPI: false, IV: false });
                }
              }
            }
          } else if (type === "success") {
            handleModal("close");
            setOpen({ ...open, IV: false });
          }
        }}
        data={{
          patientId:
            data?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          eventId:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
      />

      {/* {/ red flag modal /} */}
      <RedFlag
        visible={open.redFlag}
        id={{
          patientId:
            data?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          eventId:
            eventData?.id ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
        }}
        data={redFlagData}
        handleModal={(v) => {
          if (v === "close") {
            setOpen({ ...open, redFlag: false });
          } else if (v === "back") {
            setOpen({ ...open, IPI: true, redFlag: false });
          } else if (v === "success") {
            if (
              !redFlagData?.previous_red_flag &&
              redFlagData?.current_red_flag
            ) {
              setOpen({ ...open, redFlag: false, IV: true });
            } else {
              handleModal("close");
              setOpen({ ...open, redFlag: false });
            }
          }
        }}
      />
    </>
  );
}
