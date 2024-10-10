import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles";
import MainLoader from "../Loader/MainLoader";
import BackBtn from "../BackBtn";
import { color } from "../../Config/theme";
import { isEmpty, isNull } from "lodash";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import { addHours } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import { CTypography } from "../CTypography";

const errorObj = {
  startTimeErr: false,
  startTimeMsg: "",
  endTimeErr: false,
  endTimeMsg: "",
  assessStartTimeErr: false,
  assessStartTimeMsg: "",
  assessEndTimeErr: false,
  assessEndTimeMsg: "",
};

export default function WorkingDays(props) {
  const { from = "", handleClick = () => null } = props;
  const classes = styles();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loader, setLoader] = useState(false);
  const [selectedDays, setSelectedDays] = useState({});
  const [errObj, setErrObj] = useState(errorObj);
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    getWorkigHourApi();
  }, []);

  //convert to timestamps from spi response
  const convertToTimePickerValue = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const currentDate = new Date();
    currentDate.setHours(parseInt(hours, 10));
    currentDate.setMinutes(parseInt(minutes, 10));
    return currentDate;
  };

  //convert to timestamps from spi response
  const convertToTimePickerValues = (responseData) => {
    for (const key in responseData) {
      if (key.includes("_tm") && !isNull(responseData[key])) {
        selectedDays[key] = convertToTimePickerValue(responseData[key]);
      } else {
        selectedDays[key] = responseData[key];
      }
    }
    return selectedDays;
  };

  //converting timestamps to 24 hour format
  const convertTo24HourFormat = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  //get previously saved data
  async function getWorkigHourApi() {
    setLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.getWorkingTime,
        "POST",
        {
          provider_id: searchParams.has("id")
            ? EncDctFn(searchParams.get("id"), "decrypt")
            : null,
        }
      );

      if (response?.status) {
        if (response?.data?.working_time) {
          convertToTimePickerValues(response?.data?.working_time);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (er) {
      setLoader(false);
      toast.error(er.toString());
      console.log(
        "🚀 ~ file: index.js:44 ~ getWorkigHourApi ~ er~~~~~~~~~",
        er
      );
    }
  }

  //validation for days and time picker
  function validation() {
    let valid = true;
    let error = { ...errObj };
    if (isEmpty(selectedDays)) {
      valid = false;
      error.startTimeErr = true;
      error.startTimeMsg = "Please select start time.";
    }
    setErrObj(error);
    if (valid) {
      saveWorkingHoursApi();
    }
  }

  //convert timestamp to 24 hour format
  function convertScheduleTo24HourFormat(scheduleData) {
    for (const day in scheduleData) {
      if (
        scheduleData.hasOwnProperty(day) &&
        typeof scheduleData[day] === "object"
      ) {
        if (!isNull(scheduleData[day])) {
          scheduleData[day] = convertTo24HourFormat(scheduleData[day]);
        }
      }
    }

    return scheduleData;
  }

  //api call to send response of user
  async function saveWorkingHoursApi() {
    setLoader(true);
    convertScheduleTo24HourFormat(selectedDays);

    selectedDays["provider_id"] = searchParams.has("id")
      ? EncDctFn(searchParams.get("id"), "decrypt")
      : "";

    try {
      const response = await getApiData(
        Setting.endpoints.saveWorkingTime,
        "POST",
        selectedDays
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("cancel");
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      toast.error(er.toString());
      console.log(
        "🚀 ~ file: index.js:49 ~ saveWorkingHoursApi ~ er~~~~~~~~~",
        er
      );
    } finally {
      setLoader(false);
    }
  }

  return (
    <Grid container className={classes.gridContainer}>
      {loader ? (
        <Grid
          style={{
            width: "100%",
            height: "50vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MainLoader />
        </Grid>
      ) : (
        <>
          <Grid item container justifyContent={"space-between"}>
            <Grid item display={"flex"} alignItems={"center"}>
              {isEmpty(from) && (
                <BackBtn handleClick={() => handleClick("cancel")} />
              )}
              <Typography variant="title" style={{ color: color.primary }}>
                Time Settings
              </Typography>
            </Grid>
          </Grid>

          <Grid container marginY={"10px"}>
            <Grid
              item
              container
              xs={12}
              style={{
                marginBottom:
                  errObj?.assessStartTimeErr || errObj?.assessEndTimeErr
                    ? 0
                    : 50,
              }}
            >
              <Grid item xs={12}>
                <CTypography
                  isDot
                  required
                  variant={"tableTitle"}
                  title="Select assessment window (4 hours)"
                />
              </Grid>
              <Grid
                item
                display={"flex"}
                xs={12}
                gap={2}
                wrap="nowrap"
                marginTop={"20px"}
              >
                <Grid item xs={6} sm={4} md={3} lg={2}>
                  <FormControl fullWidth error={errObj?.startTimeErr}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        value={selectedDays["asmt_window_start_tm"]}
                        onChange={(newValue) => {
                          selectedDays["asmt_window_start_tm"] = newValue;
                          selectedDays["asmt_window_end_tm"] = addHours(
                            newValue,
                            4
                          );
                          setErrObj({
                            ...errObj,
                            startTimeErr: false,
                            startTimeMsg: "",
                          });
                        }}
                        ampmInClock={true}
                      />
                      {errObj?.startTimeErr && (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.startTimeMsg}
                        </FormHelperText>
                      )}
                    </LocalizationProvider>
                  </FormControl>
                </Grid>

                <Grid item xs={6} sm={4} md={3} lg={2}>
                  <FormControl fullWidth>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <TimePicker
                        value={selectedDays["asmt_window_end_tm"]}
                        disabled
                      />
                      {(errObj?.assessEndTimeErr || errObj?.assessTimeErr1) && (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.assessEndTimeMsg || errObj?.assessTimeMsg1}
                        </FormHelperText>
                      )}
                    </LocalizationProvider>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={3} sm={2} md={1.5} lg={1.2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => validation()}
              >
                {btnLoad ? <CircularProgress size={22} /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </>
      )}
    </Grid>
  );
}
