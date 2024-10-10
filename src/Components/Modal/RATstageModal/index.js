import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { CTypography } from "../../CTypography";
import { KeyboardArrowDown } from "@mui/icons-material";
import { isEmpty, isNumber } from "lodash";
import { color } from "../../../Config/theme";
import { rtaDropdownArr } from "../../../Config/Static_Data";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";

export default function RTAstageModal(props) {
  const {
    visible = false,
    eventData = [],
    handleClose = () => null,
    type = "",
    handleSelectRTA = () => null,
    editData = false,
  } = props;

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [rtaStage, setRtaStage] = useState({
    diagnosis: false,
    progress: false,
    notProgress: false,
    loader: false,
  });

  useEffect(() => {
    if (editData) {
      setRtaStage({ ...rtaStage, editRTA: true });
    }
    if (searchParams.has("RTA") || type) {
      if (searchParams.get("RTA") === "diagnosis" || type === "diagnosis") {
        setRtaStage({ ...rtaStage, diagnosis: true });
      } else if (
        searchParams.get("RTA") === "progress" ||
        type === "progress"
      ) {
        setRtaStage({ ...rtaStage, progress: true });
      } else if (
        searchParams.get("RTA") === "not_progress" ||
        type === "not_progress"
      ) {
        setRtaStage({ ...rtaStage, notProgress: true });
      }
    }
  }, [searchParams, editData, type]);

  async function addRTAStage(patientId, eventId) {
    setRtaStage({ ...rtaStage, loader: true });
    try {
      const response = await getApiData(Setting.endpoints.addRtaData, "POST", {
        patient_id: patientId,
        event_id: eventId,
        rta_state: rtaStage?.dropValue,
        rta_note: rtaStage?.dropText,
      });
      if (response?.status) {
        toast.success(response?.message);
        if (type === "diagnosis") {
          generateDiagnose(eventId);
        }
        handleClose("success");
        delete queryParams.RTA;
        setSearchParams({ ...queryParams }, { replace: true });
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
          loader: false,
        });
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setRtaStage({ ...rtaStage, loader: false });
    }
  }

  async function editRTAStage(patientId, eventId) {
    setRtaStage({ ...rtaStage, loader: true });
    try {
      const response = await getApiData(Setting.endpoints.updateRta, "POST", {
        patient_id: patientId,
        event_id: eventId,
        rta_state: rtaStage?.dropValue,
        rta_note: rtaStage?.dropText,
      });
      if (response?.status) {
        toast.success(response?.message);
        handleClose("success");
        delete queryParams.RTA;
        setSearchParams({ ...queryParams }, { replace: true });
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
          loader: false,
        });
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setRtaStage({ ...rtaStage, loader: false });
    }
  }

  async function progressing(patientId, eventId) {
    setRtaStage({ ...rtaStage, loader: true });
    try {
      const response = await getApiData(
        Setting.endpoints.progressingRTA,
        "POST",
        {
          patient_id: patientId,
          event_id: eventId,
          rta_state: rtaStage?.dropValue,
          rta_note: rtaStage?.dropText,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClose("success", rtaStage?.dropValue);
        delete queryParams.RTA;
        setSearchParams({ ...queryParams }, { replace: true });
        setRtaStage({
          ...rtaStage,
          diagnosisModel: false,
          progressModel: false,
          notProModel: false,
          editRTA: false,
          dropValue: "",
          dropText: "",
          dropErr: false,
          dropErrMsg: "",
          loader: false,
        });
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setRtaStage({ ...rtaStage, loader: false });
    }
  }
  // this function is used to create RTA Stage
  async function notProgressing(patientId, eventId) {
    setRtaStage({ ...rtaStage, loader: true });
    try {
      const response = await getApiData(
        Setting.endpoints.notProgressingRTA,
        "POST",
        {
          patient_id: patientId,
          event_id: eventId,
          rta_state: rtaStage?.dropValue,
          rta_note: rtaStage?.dropText,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClose("success");
        delete queryParams.RTA;
        setSearchParams({ ...queryParams }, { replace: true });
        setRtaStage({
          ...rtaStage,
          diagnosisModel: false,
          progressModel: false,
          notProModel: false,
          editRTA: false,
          dropValue: "",
          dropText: "",
          dropErr: false,
          dropErrMsg: "",
          loader: false,
        });
      } else {
        if (response?.warning) {
          toast.warn(response?.message);
        } else {
          toast.error(response?.message);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setRtaStage({ ...rtaStage, loader: false });
    }
  }

  function getRTA(data) {
    const val = rtaDropdownArr.find(
      (it) => it?.value == data?.rta_data?.state_code
    );
    return val?.label || "N/A";
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

  return (
    <CModal
      visible={visible}
      title={rtaStage?.editRTA ? "Edit RTA Stage" : "Select RTA Stage"}
      closeIcon={type === "diagnosis" ? false : true}
      handleModal={() => {
        handleClose("close");
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
      children={
        <Grid container rowGap={2}>
          {rtaStage?.editRTA && (
            <Grid
              item
              xs={12}
              mt={2}
              display={"flex"}
              justifyContent={"center"}
            >
              <Typography variant="tableTitle">
                Current RTA Stage :{" "}
                <span style={{ color: color.primary }}>
                  {getRTA(eventData)}
                </span>
              </Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <CTypography title="Select RTA stage" required />

            <FormControl fullWidth error={rtaStage?.dropErr}>
              <Select
                fullWidth
                displayEmpty
                IconComponent={KeyboardArrowDown}
                value={rtaStage?.dropValue || ""}
                onChange={(e) => {
                  handleSelectRTA(e.target.value);
                  setRtaStage({
                    ...rtaStage,
                    dropValue: parseInt(e.target.value),
                    dropErr: false,
                    dropErrMsg: "",
                  });
                }}
                style={{
                  color: !isNumber(rtaStage?.dropValue)
                    ? color.placeholder
                    : "",
                }}
              >
                <MenuItem value="" hidden selected disabled>
                  Select RTA stage
                </MenuItem>
                {rtaDropdownArr.map((item, index) => {
                  if (item?.value == eventData?.rta_data?.state_code) {
                    return null;
                  } else {
                    return (
                      <MenuItem key={index} value={item?.value}>
                        {item?.label}
                      </MenuItem>
                    );
                  }
                })}
              </Select>
              {rtaStage?.dropErr && (
                <FormHelperText style={{ color: color.error }}>
                  {rtaStage?.dropErrMsg}
                </FormHelperText>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <CTypography title="Provider's Note" />

            <TextField
              fullWidth
              placeholder="Provider note"
              value={rtaStage?.dropText}
              onChange={(e) =>
                setRtaStage({ ...rtaStage, dropText: e.target.value })
              }
            />
          </Grid>
          <Grid item xs={12} display={"flex"} justifyContent={"flex-end"}>
            <Button
              variant="contained"
              style={{ width: "100px" }}
              disabled={rtaStage?.loader}
              onClick={() => {
                if (!isNumber(rtaStage?.dropValue)) {
                  setRtaStage({
                    ...rtaStage,
                    dropErr: true,
                    dropErrMsg: "Please select RTA stage",
                  });
                } else {
                  if (
                    rtaStage?.diagnosis ||
                    (isEmpty(eventData.rta_data) &&
                      eventData?.view_reschedule_model)
                  ) {
                    addRTAStage(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ) || +eventData?.patient_id,
                      Number(
                        EncDctFn(searchParams.get("event_id"), "decrypt")
                      ) || eventData?.event_id
                    );
                  } else if (rtaStage.progress) {
                    progressing(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ) || +eventData?.patient_id,
                      Number(
                        EncDctFn(searchParams.get("event_id"), "decrypt")
                      ) || eventData?.event_id
                    );
                  } else if (rtaStage.notProgress) {
                    notProgressing(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ) || +eventData?.patient_id,
                      Number(
                        EncDctFn(searchParams.get("event_id"), "decrypt")
                      ) || eventData?.event_id
                    );
                  } else if (rtaStage.editRTA) {
                    editRTAStage(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ) || +eventData?.patient_id,
                      Number(
                        EncDctFn(searchParams.get("event_id"), "decrypt")
                      ) || eventData?.event_id
                    );
                  }
                }
              }}
            >
              {rtaStage?.loader ? <CircularProgress size={24} /> : "Confirm"}
            </Button>
          </Grid>
        </Grid>
      }
    />
  );
}
