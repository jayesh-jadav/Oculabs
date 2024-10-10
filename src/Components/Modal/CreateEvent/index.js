import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Autocomplete,
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
import { isArray, isEmpty, isNull, isNumber } from "lodash";
import { color, FontFamily } from "../../../Config/theme";
import styled from "@emotion/styled";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";
import {
  DatePicker,
  LocalizationProvider,
  renderTimeViewClock,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import styles from "./styles";
import { toast } from "react-toastify";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { isToday } from "date-fns";
import MainLoader from "../../Loader/MainLoader";
import DateIcon from "../../CustomIcon/Global/DOB";
import { convertToIST, hasPermission } from "../../../Utils/CommonFunctions";

const GroupHeader = styled("div")(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: "8px 10px",
  cursor: "pointer",
  fontFamily: FontFamily.Bold,
  borderRadius: 4,
  transition: "500ms",
  backgroundColor: color.white,
  "&:hover": {
    backgroundColor: color.primary,
    color: color.white,
  },
}));
const GroupItems = styled("ul")({
  padding: 0,
  fontFamily: FontFamily.Regular,
});

const errorObj = {
  patientErr: false,
  patientMsg: "",
  typeErr: false,
  typeMsg: "",
  dateErr: false,
  dateMsg: "",
  timeErr: false,
  timeMsg: "",
  eTypeErr: false,
  eTypeMsg: "",
  eTitleErr: false,
  eTitleMsg: "",
};
export default function CreateEvent(props) {
  const {
    visible = false,
    handleModal = () => null,
    handleSelect = () => null,
    patientId = null,
    from = "",
    fromPD = "",
    event_id,
  } = props;

  const { setActivePatient, setEventID } = authActions;
  const dispatch = useDispatch();
  const { userData, eventID, userType, permissionData } = useSelector(
    (state) => state.auth
  );
  const className = styles();
  const btnArr = ["Immediate Post Injury", "Initial Visit"];
  // event type state
  const [eventTitle, setEventTitle] = useState(
    moment(new Date()).format("MMM DD")
  );

  //create event states
  const [patientList, setPatientList] = useState([]);
  const [patient, setPatient] = useState(null);
  const [event, setEvent] = useState("");
  const [dobError, setDobError] = useState(false);
  const [injuryDate, setInjuryDate] = useState(null);
  const [injuryTime, setInjuryTime] = useState(null);
  const [timeError, setTimeError] = useState(false);
  const [eType, setEtype] = useState("");
  const [errObj, setErrObj] = useState(errorObj);
  const [loader, setLoader] = useState(false);
  const [initialEventData, setInitialEventData] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    if (visible || fromPD === "eventInfo") {
      PatientListApi();
      setLoader(false);
    }
    if (fromPD === "eventInfo") {
      getEventInfo();
    }
  }, [visible, fromPD]);

  useEffect(() => {
    if (from === "close") {
      clear();
    }
  }, [from, visible]);

  useEffect(() => {
    if (!isNull(patientId) && fromPD === "patientDetails") {
      if (!isEmpty(patientList) && isArray(patientList)) {
        const initialPatient = patientList?.find(
          (v) => Number(v?.id) === Number(patientId)
        );
        setPatient(initialPatient);
      }
    }
  }, [userData, visible, patientList, patientId]);

  useEffect(() => {
    if (isEmpty(initialEventData)) {
      // Parse the dates using moment
      const currentTime = moment(new Date(), "YYYY-MM-DD HH:mm:ss");
      const selectedTime = moment(injuryTime, "YYYY-MM-DD HH:mm:ss");

      const selectedDate = moment(injuryDate, "YYYY-MM-DD HH:mm:ss");

      // Calculate the difference in total minutes
      const diffInMinutes = currentTime.diff(selectedTime, "minutes");
      const diffInHours = Math.floor(diffInMinutes / 60);
      const remainingMinutes = diffInMinutes % 60;

      // Compare the month and day along with the time
      const currentYear = currentTime.year();
      const selectedYear = selectedDate.year();
      const currentMonth = currentTime.month();
      const selectedMonth = selectedDate.month();
      const currentDay = currentTime.date();
      const selectedDay = selectedDate.date();

      // Determine the result based on the time difference and date comparison
      let result;

      if (
        (diffInHours < 6 || (diffInHours === 6 && remainingMinutes === 0)) &&
        currentMonth === selectedMonth &&
        currentDay === selectedDay &&
        currentYear === selectedYear
      ) {
        result = "IPI"; // If the difference is less than or exactly 6 hours, and the date matches
      } else {
        result = "IV"; // If the difference is more than 6 hours, or the date does not match
      }

      setEtype(result === "IPI" ? 0 : 1);
      setErrObj({
        ...errObj,
        eTypeErr: false,
        eTypeMsg: "",
      });
    }
  }, [injuryDate, injuryTime]);

  useEffect(() => {
    if (!isEmpty(initialEventData)) {
      if (Number(initialEventData?.event_type) === 1) {
        setEvent("Baseline");
      } else {
        setEvent("Injury");
        if (Number(initialEventData?.event_type) === 2) {
          setEtype(0);
        } else if (Number(initialEventData?.event_type) === 3) {
          setEtype(1);
        }
      }
      const time = moment(initialEventData?.time_of_injury, "hh:mm A").format();
      setInjuryTime(new Date(time));
      const date =
        !isNull(initialEventData?.date_of_injury) ||
        !isEmpty(initialEventData?.date_of_injury)
          ? convertToIST(initialEventData?.date_of_injury)
          : null;
      setInjuryDate(date);
      if (!isEmpty(patientList) && isArray(patientList)) {
        const initialPatient = patientList?.find((v) => {
          if (v?.id == patientId) {
            return v?.id == patientId;
          }
        });
        setPatient(initialPatient);
      }
    }
  }, [initialEventData, patientList, patientId]);

  // get patient list array
  async function PatientListApi() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientList}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setPatientList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  // this function is used for event validation
  function createEventValidation() {
    let error = { ...errObj };
    let valid = true;

    if (isEmpty(patient)) {
      valid = false;
      error.patientErr = true;
      error.patientMsg = "Please select patient";
    }

    if (isEmpty(event)) {
      valid = false;
      error.typeErr = true;
      error.typeMsg = "Please select event type";
    }

    if (isEmpty(eventTitle)) {
      valid = false;
      error.eTitleErr = true;
      error.eTitleMsg = "Please enter event title";
    }

    if (event === "Injury" && isNull(injuryDate)) {
      valid = false;
      error.dateErr = true;
      error.dateMsg = "Please select injury date";
    } else if (dobError) {
      valid = false;
      error.dateErr = true;
      error.dateMsg = "Please select valid date of injury";
    }

    if (event === "Injury" && isNull(injuryTime)) {
      valid = false;
      error.timeErr = true;
      error.timeMsg = "Please select injury time";
    } else if (timeError) {
      valid = false;
      error.timeErr = true;
      error.timeMsg = "Please select valid injury time";
    }

    if (event === "Injury" && !isNumber(eType)) {
      valid = false;
      error.eTypeErr = true;
      error.eTypeMsg = "Please select encounter type";
    }

    setErrObj(error);
    if (valid) {
      createEventApi();
    }
  }

  //create event api
  async function createEventApi() {
    setBtnLoad(true);
    try {
      let time = moment.utc(injuryTime, "HH:mm:ss").format("HH:mm:ss");
      let day = moment(injuryDate, "YYYY-MM-DD").format("YYYY-MM-DD"); //dont place utc here.. because it's only formatted date so we dont need to convert it in utc
      const new_date = moment.utc(`${day} ${time}`, "YYYY-MM-DD HH:mm:ss");
      const response = await getApiData(Setting.endpoints.createEvent, "POST", {
        created_from: "web",
        patient_id: patient?.id,
        title: eventTitle,
        event_type: event === "Baseline" ? 1 : eType === 0 ? 2 : 3,
        date_of_injury: event !== "Baseline" ? day : "",
        time_of_injury: event !== "Baseline" ? time : "",
        full_date: event !== "Baseline" ? new_date : null,
        event_id: eventID,
      });

      if (response?.status) {
        toast.success(response?.message);
        dispatch(setActivePatient(patient?.id));
        if (event === "Baseline") {
          handleSelect(
            "Baseline",
            patient?.id,
            response?.data,
            response?.event
          );
        } else {
          handleSelect(eType, patient?.id, response?.data);
        }
        dispatch(setEventID(response?.data));
        handleModal("", patient);
      } else {
        if (response?.warning) {
          toast.warn(response.message);
        } else {
          toast.error(response?.message);
        }
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  // this function is used for get a event data by event_id
  async function getEventInfo() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getEvent}?event_id=${event_id}`,
        "GET",
        {}
      );
      if (response?.status) {
        setLoader(false);
        if (!isEmpty(response?.data)) {
          setInitialEventData(response?.data);
        }
      } else {
        setLoader(false);
        toast.error(response?.message);
      }
    } catch (error) {
      setLoader(false);
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }
  //this function is used for display a create event design
  function createEvent() {
    if (fromPD === "eventInfo") {
      return (
        <Grid
          container
          className={className.scrollbar}
          style={{ height: "100%", paddingTop: 20 }}
          justifyContent="center"
        >
          <Grid item xs={8}>
            <Grid
              item
              style={{
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <Typography variant="tableTitle">Event Information</Typography>
            </Grid>
            <Grid item xs={12} marginBottom={2}>
              <Grid item xs={12}>
                <CTypography required title="Patient" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  value={
                    patient?.firstname +
                    " " +
                    (patient?.middlename || "") +
                    " " +
                    patient?.lastname
                  }
                />
              </Grid>
            </Grid>

            <Grid item xs={12} marginBottom={2}>
              <Grid item xs={12}>
                <CTypography required title="Event Title" />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider fullWidth dateAdapter={AdapterDateFns}>
                  <TextField
                    sx={{ width: "100%" }}
                    value={initialEventData?.title}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <Grid item xs={12} marginBottom={2}>
              <Grid item xs={12}>
                <CTypography required title="Event Type" />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  InputProps={{
                    readOnly: true,
                  }}
                  value={event}
                />
              </Grid>
            </Grid>

            {event === "Injury" && (
              <Grid container>
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent={"space-between"}
                >
                  {/* injury Date */}
                  <Grid item xs={5.8}>
                    <CTypography required title="Date of Injury" />
                    <Grid
                      item
                      xs={12}
                      marginBottom={errObj.dateErr ? -1 : "18px"}
                    >
                      <FormControl fullWidth error={errObj.dateErr}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                border: errObj.dateErr && "1px solid red",
                              },
                              "& .Mui-focused": {
                                border:
                                  errObj.dateErr && "1px solid red !important",
                                outline: errObj.dateErr && "1px solid red",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: errObj.dateErr && "none",
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: 22,
                              },
                              "& .MuiIconButton-root:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                            readOnly
                            views={["year", "month", "day"]}
                            disableFuture
                            showToolbar={false}
                            slots={{
                              toolbar: "hidden",
                              openPickerIcon: () => (
                                <DateIcon
                                  height={20}
                                  width={20}
                                  fill={
                                    errObj?.dobErr ? color.error : color.primary
                                  }
                                />
                              ),
                            }}
                            value={injuryDate}
                            onChange={(newValue) => {
                              setInjuryDate(newValue);
                              setInjuryTime(null);
                              setErrObj({
                                ...errObj,
                                dateErr: false,
                                dateMsg: "",
                              });
                            }}
                            onError={(error) => {
                              if (!isNull(error)) {
                                setDobError(true);
                              } else {
                                setDobError(false);
                              }
                            }}
                          />
                        </LocalizationProvider>
                        {errObj.dateErr && (
                          <FormHelperText>{errObj.dateMsg}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* injury Time */}
                  <Grid item xs={5.8} marginBottom={2}>
                    <CTypography required title="Approx. Time of Injury" />
                    <Grid
                      item
                      xs={12}
                      marginBottom={errObj.timeErr ? -1 : "18px"}
                    >
                      <FormControl fullWidth error={errObj.timeErr}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <TimePicker
                            readOnly
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                border: errObj.timeErr && "1px solid red",
                              },
                              "& .Mui-focused": {
                                border:
                                  errObj.timeErr && "1px solid red !important",
                                outline: errObj.timeErr && "1px solid red",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: errObj.timeErr && "none",
                              },
                            }}
                            viewRenderers={{
                              hours: renderTimeViewClock,
                              minutes: renderTimeViewClock,
                              seconds: renderTimeViewClock,
                            }}
                            disableFuture={isToday(injuryDate)}
                            value={injuryTime}
                            ampmInClock={true}
                            onChange={(newValue) => {
                              setInjuryTime(newValue.utc().format("HH:mm:ss"));
                              setErrObj({
                                ...errObj,
                                timeErr: false,
                                timeMsg: "",
                              });
                            }}
                            onError={(error) => {
                              if (!isNull(error)) {
                                setTimeError(true);
                              } else {
                                setTimeError(false);
                              }
                            }}
                            slots={{
                              actionBar: "hidden",
                            }}
                          />
                        </LocalizationProvider>
                        {errObj.timeErr && (
                          <FormHelperText>{errObj.timeMsg}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                </Grid>

                {/* encounter type */}
                <Grid item xs={12} rowGap={1}>
                  <CTypography required title="Encounter Type" />
                  <TextField
                    fullWidth
                    InputProps={{
                      readOnly: true,
                    }}
                    value={
                      eType === 0 ? "Immediate Post Injury" : "Initial Visit"
                    }
                  />
                </Grid>
              </Grid>
            )}
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid
          container
          className={className.scrollbar}
          maxHeight={event === "Injury" ? "70vh" : ""}
        >
          <Grid item xs={12} marginBottom={2}>
            <Grid item xs={12}>
              <CTypography required title="Select Patient" />
            </Grid>
            <Grid item xs={12}>
              <FormControl error={errObj.patientErr} fullWidth>
                <Autocomplete
                  fullWidth
                  value={patient}
                  disabled={fromPD === "patientDetails" && patient}
                  onChange={(e, v, r, b) => {
                    if (v?.id === "newPatient") {
                      handleSelect(v?.id);
                    } else {
                      setPatient(v);
                    }
                    setErrObj({
                      ...errObj,
                      patientErr: false,
                      patientMsg: "",
                    });
                  }}
                  disableClearable
                  popupIcon={<KeyboardArrowDown />}
                  options={patientList}
                  groupBy={(option) => option.firstLetter}
                  getOptionLabel={(option) => {
                    return (
                      option?.firstname +
                      " " +
                      (option?.middlename || "") +
                      " " +
                      option?.lastname
                    );
                  }}
                  renderGroup={(params) => {
                    return (
                      <li key={params.key}>
                        {userType === "org_admin" ||
                        userType === "super_admin" ||
                        userType === "ops_admin" ||
                        userData?.personal_info?.is_provider === 1 ||
                        hasPermission(permissionData, "patient_permission") ? (
                          <GroupHeader
                            onClick={() => handleSelect("newPatient")}
                          >
                            + New Patient
                          </GroupHeader>
                        ) : null}
                        <GroupItems>{params.children}</GroupItems>
                      </li>
                    );
                  }}
                  noOptionsText={
                    userType === "org_admin" ||
                    userType === "super_admin" ||
                    userType === "ops_admin" ||
                    userData?.personal_info?.is_provider === 1 ||
                    hasPermission(permissionData, "patient_permission") ? (
                      <>
                        <GroupHeader onClick={() => handleSelect("newPatient")}>
                          + New Patient
                        </GroupHeader>
                        <Typography variant="subTitle">No Data</Typography>
                      </>
                    ) : (
                      <Typography variant="subTitle">No Data</Typography>
                    )
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Select patient"
                      error={errObj.patientErr}
                    />
                  )}
                />
                {errObj.patientErr && (
                  <FormHelperText>{errObj.patientMsg}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Grid item xs={12} marginBottom={2}>
            <Grid item xs={12}>
              <CTypography required title="Event Title" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={errObj.eTitleErr}>
                <TextField
                  placeholder="Event title"
                  sx={{ width: "100%" }}
                  value={eventTitle}
                  onChange={(e) => {
                    setEventTitle(e.target.value);
                  }}
                  inputProps={{ maxLength: 10 }}
                  error={errObj.eTitleErr}
                />
                {errObj.eTitleErr && (
                  <FormHelperText>{errObj.eTitleMsg}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          <Grid item xs={12} marginBottom={2}>
            <Grid item xs={12}>
              <CTypography required title="Event Type" />
            </Grid>
            <Grid item xs={12}>
              <FormControl error={errObj.typeErr} fullWidth>
                <Select
                  displayEmpty
                  fullWidth
                  value={event || ""}
                  onChange={(e) => {
                    setEvent(e.target.value);
                    setErrObj({
                      ...errObj,
                      typeErr: false,
                      typeMsg: "",
                    });
                  }}
                  IconComponent={KeyboardArrowDown}
                  style={{
                    color: isEmpty(event) ? color.placeholder : "",
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "40vh",
                      },
                    },
                  }}
                >
                  <MenuItem value={""} disabled hidden selected>
                    Select event
                  </MenuItem>
                  <MenuItem value={"Baseline"}>Baseline</MenuItem>;
                  <MenuItem value={"Injury"}>Injury</MenuItem>;
                </Select>
                {errObj.typeErr && (
                  <FormHelperText>{errObj.typeMsg}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>

          {event === "Injury" && (
            <Grid container>
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent={"space-between"}
              >
                {/* injury Date */}
                <Grid item xs={5.8}>
                  <CTypography required title="Date of Injury" />
                  <Grid
                    item
                    xs={12}
                    marginBottom={errObj.dateErr ? -1 : "18px"}
                  >
                    <FormControl fullWidth error={errObj.dateErr}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              border: errObj.dateErr && "1px solid red",
                            },
                            "& .Mui-focused": {
                              border:
                                errObj.dateErr && "1px solid red !important",
                              outline: errObj.dateErr && "1px solid red",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: errObj.dateErr && "none",
                            },
                            "& .MuiSvgIcon-root": {
                              fontSize: 22,
                            },
                            "& .MuiIconButton-root:hover": {
                              backgroundColor: "transparent",
                            },
                          }}
                          views={["year", "month", "day"]}
                          disableFuture
                          showToolbar={false}
                          slots={{
                            toolbar: "hidden",
                            openPickerIcon: () => (
                              <DateIcon
                                height={20}
                                width={20}
                                fill={
                                  errObj?.dobErr ? color.error : color.primary
                                }
                              />
                            ),
                          }}
                          value={injuryDate}
                          onChange={(newValue) => {
                            setInjuryDate(newValue);
                            setInjuryTime(null);
                            setErrObj({
                              ...errObj,
                              dateErr: false,
                              dateMsg: "",
                            });
                          }}
                          onError={(error) => {
                            if (!isNull(error)) {
                              setDobError(true);
                            } else {
                              setDobError(false);
                            }
                          }}
                        />
                      </LocalizationProvider>
                      {errObj.dateErr && (
                        <FormHelperText>{errObj.dateMsg}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>

                {/* injury Time */}
                <Grid item xs={5.8} marginBottom={2}>
                  <CTypography required title="Approx. Time of Injury" />
                  <Grid
                    item
                    xs={12}
                    marginBottom={errObj.timeErr ? -1 : "18px"}
                  >
                    <FormControl fullWidth error={errObj.timeErr}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          disabled={isNull(injuryDate)}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              border: errObj.timeErr && "1px solid red",
                            },
                            "& .Mui-focused": {
                              border:
                                errObj.timeErr && "1px solid red !important",
                              outline: errObj.timeErr && "1px solid red",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: errObj.timeErr && "none",
                            },
                          }}
                          viewRenderers={{
                            hours: renderTimeViewClock,
                            minutes: renderTimeViewClock,
                            seconds: renderTimeViewClock,
                          }}
                          ampmInClock={true}
                          disableFuture={isToday(injuryDate)}
                          value={injuryTime}
                          onChange={(newValue) => {
                            setInjuryTime(newValue);
                            setErrObj({
                              ...errObj,
                              timeErr: false,
                              timeMsg: "",
                            });
                          }}
                          onError={(error) => {
                            if (!isNull(error)) {
                              setTimeError(true);
                            } else {
                              setTimeError(false);
                            }
                          }}
                          slots={{
                            actionBar: "hidden",
                          }}
                        />
                      </LocalizationProvider>
                      {errObj.timeErr && (
                        <FormHelperText>{errObj.timeMsg}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {!isNull(injuryDate) || !isNull(injuryTime) ? (
                <Grid item style={{ marginBottom: 10 }}>
                  <Typography variant="subTitle">
                    Note: Based on date/time of injury we suggest the following
                    encounter type
                  </Typography>
                </Grid>
              ) : (
                ""
              )}
              {/* encounter type */}
              <Grid item xs={12} rowGap={1}>
                <CTypography required title="Encounter Type" />
                <FormControl error={errObj.eTypeErr}>
                  <div style={{ display: "flex", marginBottom: 4 }}>
                    {btnArr.map((item, index) => {
                      return (
                        <Button
                          key={index}
                          variant={index === eType ? "contained" : "outlined"}
                          onClick={() => {
                            setEtype(index);
                            setErrObj({
                              ...errObj,
                              eTypeErr: false,
                              eTypeMsg: "",
                            });
                          }}
                          style={{
                            backgroundColor: index === eType ? color.green : "",
                            borderColor: color.borderColor,
                            marginRight: 20,
                          }}
                        >
                          {item}
                        </Button>
                      );
                    })}
                  </div>
                  {errObj.eTypeErr && (
                    <FormHelperText>{errObj.eTypeMsg}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          )}
        </Grid>
      );
    }
  }
  // this function is used to clear a state
  function clear() {
    setPatient(null);
    setEvent("");
    setInjuryDate(null);
    setInjuryTime(null);
    setEtype("");
  }

  return (
    <>
      {fromPD === "eventInfo" && loader ? (
        <Grid
          item
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MainLoader />
        </Grid>
      ) : (
        createEvent()
      )}
      <CModal
        visible={visible}
        handleModal={() => {
          dispatch(setEventID(""));
          setErrObj(errorObj);
          handleModal("close");
          clear();
        }}
        maxWidth={"560px"}
        title={"Create New Event"}
        children={
          <>
            {createEvent()}
            <Grid
              item
              container
              marginBottom={2}
              justifyContent={"flex-end"}
              gap={1}
            >
              <Grid item xs={2.5}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => createEventValidation()}
                  disabled={btnLoad}
                >
                  {btnLoad ? (
                    <CircularProgress size={22} />
                  ) : event === "Baseline" ? (
                    "Submit"
                  ) : (
                    "Next"
                  )}
                </Button>
              </Grid>
            </Grid>
          </>
        }
      />
    </>
  );
}
