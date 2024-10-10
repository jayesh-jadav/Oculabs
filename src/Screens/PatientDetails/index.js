import {
  Backdrop,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemButton,
  MenuItem,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  isArray,
  isEmpty,
  isNull,
  isNumber,
  isObject,
  isUndefined,
} from "lodash";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import styles from "./styles";
import { KeyboardArrowDown } from "@mui/icons-material";
import Assessments from "../../Components/PatientDetails/Assessments";
import Overview from "../../Components/PatientDetails/Overview";
import Compare from "../../Components/PatientDetails/Compare";
import Schedule from "../../Components/PatientDetails/Schedule";
import Phistory from "../../Components/Phistory/index";
import { isTablet } from "react-device-detect";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import MainLoader from "../../Components/Loader/MainLoader";
import ManageEvent from "../../Components/Modal/ManageEvent";
import theme, { color } from "../../Config/theme";
import CreateEvent from "../../Components/Modal/CreateEvent";
import ImmediatePostInjury from "../../Components/Modal/ImmediatePostInjury";
import RedFlag from "../../Components/Modal/RedFlag";
import InitialVisit from "../../Components/Modal/InitialVisit";
import authActions from "../../Redux/reducers/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { pronounsArr } from "../../Config/Static_Data";
import CModal from "../../Components/Modal/CModal";
import { EncDctFn } from "../../Utils/EncDctFn";
import moment from "moment";
import EditPatient from "../../Components/EditPatient";
import SideCalender from "../../Components/SideCalender";
import Images from "../../Config/Images";
import Patient from "../Patients";
import MergePatient from "../../Components/MergePatient";
import Email from "../../Components/CustomIcon/Global/Email";
import Phone from "../../Components/CustomIcon/Global/Phone";
import ActiveDot from "../../Components/ActiveDot";
import BackBtn from "../../Components/BackBtn";
import ReadyToAssess from "../../Components/Modal/ReadyToAssess";
import Calendar from "../../Components/CustomIcon/Header/Calendar";

const errorObj = {
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
};

export default function PatientDetails() {
  const location = useLocation();
  const dispatch = useDispatch();
  const className = styles();
  const { isActivePatient, onlinePatients, userType } = useSelector(
    (state) => state.auth
  );
  const [onlinePatient, setOnlinePatient] = useState({});
  const tabsArr = ["Overview", "Assessments", "Compare", "Calendar"];
  const email_Regex = Setting.JS_Regex.email_Regex;
  const { setActivePatient, setDrawerList } = authActions;
  const detailsTabArr = ["Patient Info", "Patient History", "Merge Patients"];
  const [eventTabArr, setEventTabArr] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [eventVal, setEventVal] = useState("");
  const [eventList, setEventList] = useState([]);
  const [showDetails, setShowDetails] = useState({
    eventDetails: false,
    patientDetails: false,
  });
  const [pageLoad, setPageLoad] = useState(false);
  const [patientData, setPatientData] = useState({});
  const fullName =
    (patientData?.userData?.firstname
      ? patientData?.userData?.firstname + " "
      : "") +
    (patientData?.userData?.middlename
      ? patientData?.userData?.middlename + " "
      : "") +
    (patientData?.userData?.lastname
      ? patientData?.userData?.lastname + " "
      : "");
  const [checked, setChecked] = useState(false);
  const [checkLoad, setCheckLoad] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [errObj, setErrObj] = useState(errorObj);
  const [type, setType] = useState("phone");
  const [selectedEvent, setSelectedEvent] = useState("");
  // modal state
  const [open, setOpen] = useState({
    manageEvent: false,
    event: false,
  });
  const [id, setId] = useState({});
  const [from, setFrom] = useState("");
  const [redFlagData, setRedFlagData] = useState({});
  const [patientGId, setPatientGId] = useState("");
  const [editEventDetails, setEditEventDetails] = useState("");
  // tabs value state
  const [tabVal, setTabVal] = useState(0);
  const [detailsTabVal, setDetailsTabVal] = useState(0);
  const [confirmBtnLoad, setConfirmBtnLoad] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const pop = Boolean(anchorEl);
  // calender state
  const [openSideCalender, setOpenSideCalender] = useState(false);
  const [calenderData, setCalenderData] = useState({});
  const [calenderStatus, setCalenderStatus] = useState({});
  const [assessTab, setAssessTab] = useState("");
  const [calenderLoad, setCalenderLoad] = useState(false);
  const [mergeData, setMergeData] = useState({ merge: false });
  // responsive state
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const xl = useMediaQuery("(min-width:1380px)");
  const [isOnline, setIsOnline] = useState(false);

  // get the progress container width and height
  const [mainContainerWidth, setMainContainerWidth] = useState(0);
  const [buttonContainerWidth, setButtonContainerWidth] = useState(0);

  useLayoutEffect(() => {
    const updateWidths = () => {
      const mainContainer = document.getElementById("main-container");
      const buttonContainer = document.getElementById("button-container");

      if (mainContainer) {
        setMainContainerWidth(mainContainer.offsetWidth);
      }

      if (buttonContainer) {
        setButtonContainerWidth(buttonContainer.offsetWidth);
      }
    };

    // Initial width calculation
    updateWidths();
    // Add a resize event listener
    window.addEventListener("resize", updateWidths);

    return () => {
      window.removeEventListener("resize", updateWidths);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
      return "";
    };
    if (
      open.event ||
      open.readyToProgress ||
      open.initialVisit ||
      open.redFlag ||
      open.postInjury
    ) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [open]);

  useEffect(() => {
    if (!isEmpty(location?.state?.data)) {
      if (location.state.type === "event") {
        setSearchParams({ ...queryParams, mtab: 1 }, { replace: true });
      } else {
        setSearchParams({ ...queryParams, mtab: 0 }, { replace: true });
      }
    }
  }, [location]);

  useEffect(() => {
    if (!isEmpty(selectedEvent)) {
      setChecked(selectedEvent?.eye_tracking === 1 ? true : false);
    }
  }, [showDetails, selectedEvent]);

  useEffect(() => {
    if (searchParams.has("event_details")) {
      setShowDetails({
        ...showDetails,
        eventDetails: searchParams.get("event_details"),
        patientDetails: !searchParams.get("event_details"),
      });
      setDetailsTabVal(
        searchParams.get("mtab") ? Number(searchParams.get("mtab")) : 0
      );
    } else if (searchParams.has("patient_details")) {
      setShowDetails({
        ...showDetails,
        eventDetails: !searchParams.get("patient_details"),
        patientDetails: searchParams.get("patient_details"),
      });
      setDetailsTabVal(
        searchParams.get("mtab") ? Number(searchParams.get("mtab")) : 0
      );
    } else {
      setShowDetails({
        ...showDetails,
        patientDetails: false,
        eventDetails: false,
      });
    }

    if (searchParams.has("patient_id")) {
      let patient_id = searchParams.get("patient_id");
      dispatch(setActivePatient(Number(EncDctFn(patient_id, "decrypt", 1))));
    } else {
      dispatch(setActivePatient(null));
    }

    if (searchParams.has("event_id")) {
      let event_id = searchParams.get("event_id");
      setEventVal(Number(EncDctFn(event_id, "decrypt", 2)));
    } else {
      setEventVal("");
    }

    if (searchParams.has("mtab")) {
      setTabVal(Number(searchParams.get("mtab")));
    }
  }, [searchParams, eventVal]);

  useEffect(() => {
    if (isActivePatient) {
      eventListApi(isActivePatient);
    }
  }, [isActivePatient, eventVal]);

  useEffect(() => {
    if (!isEmpty(eventList) && isArray(eventList)) {
      const event = eventList.filter((item) => item.id === eventVal);
      if (event[0]?.event_type == 1) {
        setEventTabArr(["Details"]);
      } else if (event[0]?.event_type == 2) {
        setEventTabArr(["Details", "IPI Screening", "PCEI"]);
      } else if (event[0]?.event_type == 3) {
        setEventTabArr(["Details", "PCEI"]);
      }
      setSelectedEvent(event[0]);
    }
  }, [eventVal, eventList]);

  useEffect(() => {
    if (!isEmpty(patientData?.userData) && isObject(patientData?.userData)) {
      setPhone(patientData?.userData?.phone);
      setEmail(patientData?.userData?.email);
    }
  }, [patientData, open]);

  useEffect(() => {
    if (searchParams.has("patient_id")) {
      addRecentPatient();
    }
    getCalenderData();

    if (userType !== "super_admin") {
      onlinePatientList();
    }
  }, []);

  useEffect(() => {
    const matchingItem = onlinePatients.find(
      (item2) => +item2.user_id === +patientData?.userData?.id
    );
    if (matchingItem?.status === "online") {
      setIsOnline(true);
    } else if (matchingItem?.status === "offline") {
      setIsOnline(false);
    } else if (onlinePatient[patientData?.userData?.id]) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
    }
  }, [onlinePatients, onlinePatient, patientData]);

  // this function is used to get online patients
  async function onlinePatientList() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.getOnlinePatientList}`,
        "GET",
        {}
      );
      if (response?.status) {
        setOnlinePatient(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  // this function is to add recent patient
  async function addRecentPatient() {
    try {
      const response = await getApiData(
        Setting.endpoints.addRecentPatient,
        "POST",
        {
          patient_id: searchParams.has("patient_id")
            ? Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
            : null,
        }
      );

      if (response?.status) {
        // toast.success(response?.message);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("🚀 ~ file: index.js:298 ~ addRecentPatient - er:", er);
      toast.error(er.toString());
    }
  }

  //this function is used get event list
  async function eventListApi(id, load) {
    !load && setPageLoad(true);
    dispatch(setDrawerList(true));
    try {
      const response = await getApiData(
        `${Setting.endpoints.eventList}?patient_id=${id}&created_from=web`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          const id = [];
          const newArray = [];
          response?.data?.events?.map((item, index) => {
            if (!id?.includes(item?.id)) {
              id.push(item?.id);
              newArray.push(item);
            }
          });
          setEventList(newArray);
          if (!isEmpty(response?.data?.events)) {
            if (!searchParams.has("event_id")) {
              setSearchParams(
                {
                  ...queryParams,
                  event_id: EncDctFn(
                    response?.data?.events[0]?.id.toString(),
                    "encrypt"
                  ),
                },
                { replace: true }
              );
            }
          }
          setPatientData(response?.data);
        } else {
          setEventList([]);
          setEventVal("");
        }
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setPageLoad(false);
      setTimeout(() => {
        dispatch(setDrawerList(false));
      }, 500);
    }
  }

  async function updateEyeTrackingApi(value) {
    setCheckLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.updateEyeTracking,
        "PATCH",
        { event_id: eventVal, eye_tracking: value ? 1 : 0 }
      );
      if (response?.status) {
        setChecked(!checked);
        eventListApi(
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          true
        );
        toast.success(response?.message);
        setCheckLoad(false);
      } else {
        toast.error(response?.message);
        setCheckLoad(false);
      }
      setCheckLoad(false);
    } catch (er) {
      setCheckLoad(false);

      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:174 ~ updateEyeTrackingApi ~ er:", er);
    }
  }

  function validation() {
    let valid = true;
    let error = { ...errorObj };

    if (type === "phone") {
      if (isEmpty(phone)) {
        valid = false;
        error.phoneErr = true;
        error.phoneMsg = "Please enter phone no.";
      }
    } else {
      if (isEmpty(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter email";
      } else if (!email_Regex.test(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter valid email";
      }
    }
    setErrObj(error);
    if (valid) {
      updateAppInvitationApi();
    }
  }

  async function updateAppInvitationApi() {
    setConfirmBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.updateAppInvitation,
        "PATCH",
        {
          patient_id: searchParams.has("patient_id")
            ? Number(EncDctFn(searchParams.get("patient_id"), "decrypt", 3))
            : null,
          type: type,
          value: type === "phone" ? phone : email,
        }
      );

      if (response?.status) {
        toast.success(response?.message);
        setOpen({ ...open, modal: false });
      } else {
        toast.error(response?.message);
      }
      setConfirmBtnLoad(false);
    } catch (er) {
      console.log("🚀 ~ file: index.js:298 ~ updateAppInvitationApi ~ er:", er);
      setConfirmBtnLoad(false);
      toast.error(er.toString());
    }
  }

  // get calender data
  async function getCalenderData(date) {
    setCalenderLoad(true);
    const month = moment(date || new Date()).format("M");
    const year = moment(date || new Date()).format("YYYY");
    try {
      const response = await getApiData(
        `${
          Setting.endpoints.calender
        }?month=${month}&year=${year}&patient_id=${Number(
          EncDctFn(searchParams.get("patient_id"), "decrypt")
        )}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          let status = {};
          Object.entries(response?.data)?.forEach(([key, value]) => {
            if (!isEmpty(value)) {
              let dummyArr = [];
              value?.map((item) => {
                item["events"]?.map((e) => {
                  const eRTA = e?.erta_date && "eRTA";
                  if (!dummyArr.includes(e?.assessment_status || eRTA)) {
                    if (eRTA) {
                      dummyArr.push("eRTA");
                    } else {
                      dummyArr.push(e?.assessment_status);
                    }
                  }
                });
              });
              status[key] = {
                statusArr: dummyArr,
              };
            }
          });
          setCalenderStatus(status);
          setCalenderStatus(status);
          setCalenderData(response?.data);
        }
      } else {
        toast.error(response.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setCalenderLoad(false);
    }
  }

  // this function is used to display a select event dropdown
  function SelectEvent() {
    return (
      <FormControl>
        <InputLabel
          shrink
          style={{
            transformOrigin: "center left",
            backgroundColor: color.white,
          }}
        >
          Event
        </InputLabel>
        <Select
          fullWidth
          label="Event"
          IconComponent={KeyboardArrowDown}
          displayEmpty
          value={eventVal || ""}
          onChange={(e) => {
            delete queryParams.amtab;
            setSearchParams(
              {
                ...queryParams,
                event_id: EncDctFn(e.target.value.toString(), "encrypt"),
                mtab: 0,
              },
              { replace: true }
            );
          }}
          style={{
            color: !isNumber(eventVal) && color.placeholder,
            minWidth: 100,
            maxWidth: 145,
            padding: "6px",
          }}
          MenuProps={{
            PaperProps: {
              style: {
                maxHeight: "40vh",
              },
            },
          }}
        >
          <MenuItem value={""} selected hidden disabled>
            Select event
          </MenuItem>
          {pageLoad ? (
            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <CircularProgress size={22} />
            </Grid>
          ) : !isEmpty(eventList) && isArray(eventList) ? (
            eventList.map((item, index) => {
              return (
                <MenuItem key={index} value={item?.id}>
                  <div className={className.eventMenuItem}>
                    {item?.status == 1 ? (
                      <ActiveDot
                        color={color.green}
                        size={8}
                        title={"Open"}
                        tooltip={true}
                        arrow
                      />
                    ) : null}
                    {(item?.event_type == 1
                      ? "BS"
                      : item?.event_type == 2
                      ? "IPI"
                      : "IV") +
                      " " +
                      item?.title}
                  </div>
                </MenuItem>
              );
            })
          ) : null}
        </Select>
      </FormControl>
    );
  }

  // top card component
  function topCard() {
    const age = moment().diff(moment(patientData?.userData?.dob), "years");
    const ageInMonth = moment().diff(
      moment(patientData?.userData?.dob),
      "month"
    );

    return (
      <Grid
        className={className.topCardContainer}
        style={{ height: "calc(100%)" }}
      >
        <Grid item xs={12} display={"flex"} justifyContent={"space-between"}>
          <Grid item xs={10} display={"flex"} gap={"10px"}>
            <Grid item xs={1.5} style={{ whiteSpace: "nowrap" }}>
              <Typography>Phone</Typography>
              <Typography variant="subTitle" style={{ whiteSpace: "nowrap" }}>
                {!isNull(patientData?.userData?.phone) &&
                !isUndefined(patientData?.userData?.phone) &&
                !isEmpty(patientData?.userData?.phone)
                  ? patientData?.userData?.phone
                  : "-"}
              </Typography>
            </Grid>
            <Grid item xs={2.5}>
              <Typography>Email</Typography>
              <Tooltip title={patientData?.userData?.email} arrow>
                <Typography
                  variant="subTitle"
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  <div
                    style={{
                      maxWidth: isTablet ? 100 : 220,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {!isNull(patientData?.userData?.email) &&
                    !isUndefined(patientData?.userData?.email) &&
                    !isEmpty(patientData?.userData?.email)
                      ? patientData?.userData?.email
                      : "-"}
                  </div>
                </Typography>
              </Tooltip>
            </Grid>
            {!isTablet ? (
              <>
                <Grid item xs={1}>
                  <Typography>Age</Typography>
                  <Tooltip
                    title={moment(patientData?.userData?.dob).format(
                      "MM-DD-YYYY"
                    )}
                    arrow
                  >
                    <Typography
                      variant="subTitle"
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <div
                        style={{
                          maxWidth: isTablet ? 100 : 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {!isNull(patientData?.userData?.dob) &&
                        !isUndefined(patientData?.userData?.dob) &&
                        !isEmpty(patientData?.userData?.dob)
                          ? age === 0
                            ? `${ageInMonth} Months`
                            : `${age} Years`
                          : "-"}
                      </div>
                    </Typography>
                  </Tooltip>
                </Grid>

                <Grid item xs={1}>
                  <Typography>Sex</Typography>
                  <Typography
                    variant="subTitle"
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <div
                      style={{
                        maxWidth: isTablet ? 100 : 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {!isNull(patientData?.userData?.sex) &&
                      !isUndefined(patientData?.userData?.sex) &&
                      !isEmpty(patientData?.userData?.sex)
                        ? patientData?.userData?.sex == 1
                          ? "Male"
                          : patientData?.userData?.sex == 0
                          ? "Female"
                          : "Intersex"
                        : "-"}
                    </div>
                  </Typography>
                </Grid>

                {!isNull(patientData?.userData?.gender) && (
                  <Grid item xs={1}>
                    <Typography>Gender</Typography>
                    <Typography
                      variant="subTitle"
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <div
                        style={{
                          maxWidth: isTablet ? 100 : 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {patientData?.userData?.gender || "-"}
                      </div>
                    </Typography>
                  </Grid>
                )}
                {patientData?.userData?.pronouns ? (
                  <Grid item xs={1}>
                    <Typography>Pronouns</Typography>
                    <Typography
                      variant="subTitle"
                      style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      <div
                        style={{
                          maxWidth: isTablet ? 100 : 220,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {pronounsArr.map((item) => {
                          if (item?.id == patientData?.userData?.pronouns) {
                            return item?.name;
                          }
                        })}
                      </div>
                    </Typography>
                  </Grid>
                ) : (
                  ""
                )}
              </>
            ) : null}

            <Grid item xs={1}>
              <Typography>Setup</Typography>
              {pageLoad ? (
                <CircularProgress size={10} />
              ) : isEmpty(patientData?.userData?.app_installed) ||
                patientData?.userData?.app_installed == 0 ? (
                <Tooltip title={"Send invitation"} arrow>
                  <Typography
                    variant="subTitle"
                    style={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Incomplete
                    <img
                      style={{
                        cursor: "pointer",
                        width: 16,
                        height: 16,
                        marginLeft: 3,
                      }}
                      src={Images.appInvitation}
                      alt="app_invitation"
                      onClick={() => setOpen({ ...open, modal: true })}
                    />
                  </Typography>
                </Tooltip>
              ) : (
                <Typography
                  variant="subTitle"
                  style={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  Complete
                </Typography>
              )}
            </Grid>
            <Grid item style={{ whiteSpace: "nowrap" }}>
              <Typography style={{ whiteSpace: "nowrap" }}>
                Pertinent Patient History
              </Typography>
              <div
                style={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                }}
              >
                {!isEmpty(patientData?.patient_history) &&
                !isNull(patientData?.patient_history?.hist_migra) &&
                !isNull(patientData?.patient_history?.hist_learn_dis) &&
                !isNull(patientData?.patient_history?.hist_anx_dep) &&
                !isNull(patientData?.patient_history?.hist_hi) ? (
                  <>
                    {patientData?.patient_history?.hist_migra != 0 ? (
                      patientData?.patient_history?.hist_hi != 0 ||
                      patientData?.patient_history?.hist_learn_dis != 0 ||
                      patientData?.patient_history?.hist_anx_dep != 0 ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            HA/MIG
                          </Typography>
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            |
                          </Typography>
                        </div>
                      ) : (
                        <Typography
                          variant="subTitle"
                          className={className.pertientText}
                        >
                          HA/MIG
                        </Typography>
                      )
                    ) : (
                      ""
                    )}
                    {patientData?.patient_history?.hist_learn_dis != 0 ? (
                      patientData?.patient_history?.hist_hi != 0 ||
                      patientData?.patient_history?.hist_anx_dep != 0 ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            ADD/ADHD
                          </Typography>
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            |
                          </Typography>
                        </div>
                      ) : (
                        <Typography
                          variant="subTitle"
                          className={className.pertientText}
                        >
                          ADD/ADHD
                        </Typography>
                      )
                    ) : (
                      ""
                    )}
                    {patientData?.patient_history?.hist_anx_dep != 0 ? (
                      patientData?.patient_history?.hist_hi != 0 ? (
                        <div
                          style={{
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            ANX/DEP
                          </Typography>
                          <Typography
                            variant="subTitle"
                            className={className.pertientText}
                          >
                            |
                          </Typography>
                        </div>
                      ) : (
                        <Typography
                          variant="subTitle"
                          className={className.pertientText}
                        >
                          ANX/DEP
                        </Typography>
                      )
                    ) : (
                      ""
                    )}
                    {patientData?.patient_history?.hist_hi != 0 ? (
                      <Typography
                        variant="subTitle"
                        className={className.pertientText}
                      >
                        HXCX
                      </Typography>
                    ) : (
                      ""
                    )}
                  </>
                ) : (
                  "-"
                )}
              </div>
            </Grid>
          </Grid>
          <Grid
            item
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <Link
              to={
                searchParams.has("event_id")
                  ? !showDetails.patientDetails
                    ? `/patient/details?patient_details=${!showDetails.patientDetails}&patient_id=${searchParams.get(
                        "patient_id"
                      )}&event_id=${searchParams.get("event_id")}`
                    : `/patient/details?patient_id=${searchParams.get(
                        "patient_id"
                      )}&event_id=${searchParams.get("event_id")}&mtab=0`
                  : !showDetails.patientDetails
                  ? `/patient/details?patient_details=${!showDetails.patientDetails}&patient_id=${searchParams.get(
                      "patient_id"
                    )}`
                  : `/patient/details?patient_id=${searchParams.get(
                      "patient_id"
                    )}&mtab=0`
              }
              onClick={() => {
                if (showDetails.patientDetails) {
                  delete queryParams.patient_details;
                  setSearchParams({ ...queryParams }, { replace: true });
                }
              }}
            >
              <Button
                id="patientDetails"
                variant="contained"
                className={
                  showDetails.patientDetails
                    ? className.btn
                    : className.detailBtn
                }
              >
                Patient Overview
              </Button>
            </Link>
          </Grid>
        </Grid>
        {showDetails.patientDetails ? (
          <>
            <div style={{ width: "100%", padding: "6px 0px" }}>
              <Divider />
            </div>
            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              style={{
                width: "100%",
              }}
            >
              <Grid item>
                <BackBtn
                  handleClick={() => {
                    delete queryParams.patient_details;
                    setSearchParams({ ...queryParams }, { replace: true });
                  }}
                />
              </Grid>
              <Grid item>
                <Tabs
                  variant="scrollable"
                  value={Number(searchParams.get("mtab")) || 0}
                  aria-label="menu items"
                  indicatorColor={"primary"}
                  scrollButtons={false}
                  TabIndicatorProps={{
                    sx: {
                      height: "3px",
                      borderRadius: 10,
                    },
                  }}
                  style={{ minHeight: 30 }}
                >
                  {!isEmpty(detailsTabArr) &&
                    isArray(detailsTabArr) &&
                    detailsTabArr?.map((item, index) => {
                      return (
                        <Link
                          key={index}
                          to={
                            searchParams.has("event_id")
                              ? `/patient/details?patient_details=true&patient_id=${searchParams.get(
                                  "patient_id"
                                )}&event_id=${searchParams.get(
                                  "event_id"
                                )}&mtab=${index}`
                              : `/patient/details?patient_details=true&patient_id=${searchParams.get(
                                  "patient_id"
                                )}&mtab=${index}`
                          }
                          style={{
                            color: color.secondary,
                            padding: isTablet || md ? "5px !important" : "auto",
                            minWidth: (isTablet || md) && 30,
                            minHeight: 20,
                            textTransform: "capitalize",
                            textDecoration: "none",
                            outline: "none",
                          }}
                        >
                          <Typography
                            style={{
                              color:
                                index === Number(searchParams.get("mtab"))
                                  ? color.primary
                                  : color.secondary,
                              margin: "0px 10px",
                              fontSize: 14,
                            }}
                          >
                            {item}
                          </Typography>
                        </Link>
                      );
                    })}
                </Tabs>
              </Grid>
            </Grid>
          </>
        ) : showDetails.eventDetails ? (
          <>
            <div style={{ width: "100%", padding: "6px 0px" }}>
              <Divider />
            </div>
            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              style={{
                width: "100%",
              }}
            >
              <Grid item display={"flex"} alignItems={"center"} gap={"10px"}>
                <BackBtn
                  handleClick={() => {
                    delete queryParams.event_details;
                    setSearchParams({ ...queryParams }, { replace: true });
                  }}
                />
                <SelectEvent />
              </Grid>
              <Grid
                item
                style={{
                  marginLeft: 10,
                }}
              >
                <Tabs
                  variant="scrollable"
                  value={Number(searchParams.get("mtab")) || 0}
                  aria-label="menu items"
                  indicatorColor={"primary"}
                  scrollButtons={false}
                  TabIndicatorProps={{
                    sx: {
                      height: "3px",
                      borderRadius: 10,
                    },
                  }}
                  style={{ minHeight: 30 }}
                >
                  {!isEmpty(eventTabArr) &&
                    isArray(eventTabArr) &&
                    eventTabArr?.map((item, index) => {
                      return (
                        <Link
                          key={index}
                          to={
                            searchParams.has("event_id")
                              ? `/patient/details?event_details=true&patient_id=${searchParams.get(
                                  "patient_id"
                                )}&event_id=${searchParams.get(
                                  "event_id"
                                )}&mtab=${index}`
                              : `/patient/details?event_details=true&patient_id=${searchParams.get(
                                  "patient_id"
                                )}&mtab=${index}`
                          }
                          style={{
                            color: color.secondary,
                            padding: isTablet || md ? "5px !important" : "auto",
                            minWidth: (isTablet || md) && 30,
                            minHeight: 20,
                            textTransform: "capitalize",
                            textDecoration: "none",
                            outline: "none",
                          }}
                        >
                          <Typography
                            style={{
                              color:
                                index === Number(searchParams.get("mtab"))
                                  ? color.primary
                                  : color.secondary,
                              margin: "0px 10px",
                              fontSize: 14,
                            }}
                          >
                            {item}
                          </Typography>
                        </Link>
                      );
                    })}
                </Tabs>
              </Grid>
            </Grid>
          </>
        ) : (
          <>
            <div style={{ width: "100%", padding: "6px 0px" }}>
              <Divider />
            </div>
            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              style={{ width: "100%" }}
              gap={1}
            >
              <Grid item xs={12} sm={11} display={"flex"} gap={"10px"}>
                <SelectEvent />
                {!isEmpty(eventList) ? (
                  <>
                    <Grid item display="flex" alignItems="center">
                      <Typography>Status:</Typography>
                      {+selectedEvent?.status === 1 ? (
                        <Chip
                          label={"Open"}
                          style={{
                            backgroundColor: color.green,
                            color: color.white,
                          }}
                        />
                      ) : +selectedEvent?.status === -1 ? (
                        <Tooltip
                          title="Your event was auto closed due to patient 30 days inactivity. Use manage event to reopen or record outcome"
                          arrow
                        >
                          <Chip
                            label={"Auto close"}
                            style={{
                              backgroundColor: color.error,
                              color: color.white,
                            }}
                          />
                        </Tooltip>
                      ) : +selectedEvent?.status === -2 ? (
                        <Tooltip
                          title="Your event was auto closed due to provider 7 days no progression. Use manage event to reopen or record outcome"
                          arrow
                        >
                          <Chip
                            label={"Auto close"}
                            style={{
                              backgroundColor: color.error,
                              color: color.white,
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label={"Close"}
                          style={{
                            backgroundColor: color.error,
                            color: color.white,
                          }}
                        />
                      )}
                    </Grid>

                    <Grid item display="flex" alignItems="center">
                      <Typography>mTBI Diagnosis:</Typography>
                      <Chip
                        label={
                          selectedEvent?.is_diagnosed ? "Confirmed" : "Pending"
                        }
                        style={{
                          backgroundColor: color.lightBorder,
                        }}
                      />
                    </Grid>

                    {!isEmpty(eventList) &&
                      +patientData?.org_data?.eye_tracking === 1 && (
                        <Grid
                          id="eyeTracking"
                          item
                          style={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <FormControlLabel
                            value="end"
                            control={
                              checkLoad ? (
                                <CircularProgress
                                  size={22}
                                  style={{ padding: "0px 8px" }}
                                />
                              ) : (
                                <Checkbox
                                  checked={checked}
                                  onClick={() => updateEyeTrackingApi(!checked)}
                                />
                              )
                            }
                            label="Eye-Tracking"
                            labelPlacement="end"
                          />
                        </Grid>
                      )}
                    {+selectedEvent?.event_type !== 1 &&
                      selectedEvent?.asmt_status !== "NEEDS_REVIEW" &&
                      selectedEvent?.asmt_open_at &&
                      selectedEvent?.asmt_submit_due_at && (
                        <Tooltip title="Assessment Start & End Time" arrow>
                          <Chip
                            label={`${moment(
                              selectedEvent?.asmt_open_at,
                              "HH:mm"
                            ).format("h:mm A")} -
                    ${moment(selectedEvent?.asmt_submit_due_at, "HH:mm").format(
                      "h:mm A"
                    )}`}
                          />
                        </Tooltip>
                      )}
                    {
                      <Grid item display="flex" alignItems="center">
                        <Tooltip title={"Days since last action"} arrow>
                          <Typography>
                            DSLA:{" "}
                            <span
                              style={{
                                color: color.primary,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {selectedEvent?.last_activity_of_doctor
                                ? selectedEvent?.last_activity_of_doctor
                                : "N/A"}
                            </span>
                          </Typography>
                        </Tooltip>
                      </Grid>
                    }
                  </>
                ) : null}
              </Grid>
              <Grid item style={{ marginLeft: "auto" }}>
                {xl ? (
                  <Tabs
                    variant="scrollable"
                    value={tabVal}
                    aria-label="menu items"
                    indicatorColor={"primary"}
                    scrollButtons={false}
                    TabIndicatorProps={{
                      sx: {
                        height: "3px",
                        borderRadius: 10,
                      },
                    }}
                    style={{ minHeight: 30 }}
                  >
                    {!isEmpty(tabsArr) &&
                      isArray(tabsArr) &&
                      tabsArr?.map((item, index) => {
                        return (
                          <Link
                            key={index}
                            id={
                              index === 0
                                ? "overview"
                                : index === 1
                                ? "assessments"
                                : index === 2
                                ? "compare"
                                : "calender1"
                            }
                            replace
                            to={
                              searchParams.has("event_id")
                                ? `/patient/details?patient_id=${searchParams.get(
                                    "patient_id"
                                  )}&event_id=${searchParams.get(
                                    "event_id"
                                  )}&mtab=${index}`
                                : `/patient/details?patient_id=${searchParams.get(
                                    "patient_id"
                                  )}&mtab=${index}`
                            }
                            style={{
                              fontSize: (isTablet || md) && 12,
                              minWidth: (isTablet || md) && 30,
                              textDecoration: "none",
                              outline: "none",
                              textTransform: "capitalize",
                            }}
                          >
                            <Typography
                              style={{
                                color:
                                  index === Number(searchParams.get("mtab"))
                                    ? color.primary
                                    : color.secondary,
                                margin: "0px 10px",
                                fontSize: 14,
                              }}
                            >
                              {item}
                            </Typography>
                          </Link>
                        );
                      })}
                  </Tabs>
                ) : (
                  <>
                    <IconButton
                      style={{
                        backgroundColor: color.primary,
                        width: 40,
                        height: 40,
                      }}
                      onClick={(e) => setAnchorEl(e.currentTarget)}
                    >
                      <img src={Images.Hamburger} style={{ padding: 2 }} />
                    </IconButton>
                    <Popover
                      onClose={() => setAnchorEl(null)}
                      anchorEl={anchorEl}
                      open={pop}
                      anchorOrigin={{
                        vertical: "bottom",
                        horizontal: isTablet ? "center" : "left",
                      }}
                      transformOrigin={{
                        vertical: "top",
                        horizontal: "center",
                      }}
                      style={{ borderRadius: 12 }}
                    >
                      <Link
                        replace
                        to={
                          searchParams.has("event_id")
                            ? `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&event_id=${searchParams.get(
                                "event_id"
                              )}&mtab=0`
                            : `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&mtab=0`
                        }
                        style={{
                          fontSize: (isTablet || md) && 12,
                          minWidth: (isTablet || md) && 30,
                          textDecoration: "none",
                          outline: "none",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemButton
                          style={{
                            color:
                              tabVal === 0 ? color.primary : color.secondary,
                          }}
                          selected={tabVal === 0}
                        >
                          Overview
                        </ListItemButton>
                      </Link>
                      <Link
                        replace
                        to={
                          searchParams.has("event_id")
                            ? `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&event_id=${searchParams.get(
                                "event_id"
                              )}&mtab=1`
                            : `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&mtab=1`
                        }
                        style={{
                          fontSize: (isTablet || md) && 12,
                          minWidth: (isTablet || md) && 30,
                          textDecoration: "none",
                          outline: "none",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemButton
                          style={{
                            color:
                              tabVal === 1 ? color.primary : color.secondary,
                          }}
                          selected={tabVal === 1}
                        >
                          Assessments
                        </ListItemButton>
                      </Link>
                      <Link
                        replace
                        to={
                          searchParams.has("event_id")
                            ? `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&event_id=${searchParams.get(
                                "event_id"
                              )}&mtab=2`
                            : `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&mtab=2`
                        }
                        style={{
                          fontSize: (isTablet || md) && 12,
                          minWidth: (isTablet || md) && 30,
                          textDecoration: "none",
                          outline: "none",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemButton
                          style={{
                            color:
                              tabVal === 2 ? color.primary : color.secondary,
                          }}
                          selected={tabVal === 2}
                        >
                          Compare
                        </ListItemButton>
                      </Link>
                      <Link
                        replace
                        to={
                          searchParams.has("event_id")
                            ? `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&event_id=${searchParams.get(
                                "event_id"
                              )}&mtab=3`
                            : `/patient/details?patient_id=${searchParams.get(
                                "patient_id"
                              )}&mtab=3`
                        }
                        style={{
                          fontSize: (isTablet || md) && 12,
                          minWidth: (isTablet || md) && 30,
                          textDecoration: "none",
                          outline: "none",
                          textTransform: "capitalize",
                        }}
                        onClick={() => {
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemButton
                          style={{
                            color:
                              tabVal === 3 ? color.primary : color.secondary,
                          }}
                          selected={tabVal === 3}
                        >
                          Calendar
                        </ListItemButton>
                      </Link>
                    </Popover>
                  </>
                )}
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    );
  }

  return (
    <Grid container className={className.container} style={{ flex: 1 }}>
      <Grid
        container
        id="main-container"
        alignItems="center"
        gap="10px"
        wrap="nowrap"
      >
        <Tooltip title={fullName} arrow>
          {fullName && (
            <div style={{ position: "relative" }}>
              <div
                style={{
                  maxWidth: `${
                    mainContainerWidth - buttonContainerWidth - 15
                  }px`,
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="title"
                  style={{
                    textOverflow: "ellipsis",
                    color: color.primary,
                    textTransform: "capitalize",
                    whiteSpace: "nowrap",
                  }}
                >
                  {fullName}
                </Typography>
              </div>
              {isOnline && (
                <div style={{ position: "absolute", top: 0, right: -15 }}>
                  <ActiveDot color={color.green} />
                </div>
              )}
            </div>
          )}
        </Tooltip>

        <Grid
          item
          id="button-container"
          style={{
            marginLeft: "auto",
            gap: 10,
            display: "flex",
            alignItems: "center",
          }}
        >
          {!isEmpty(eventList) && isArray(eventList) && (
            <span>
              <Link
                to={
                  searchParams.has("event_id")
                    ? !showDetails?.eventDetails
                      ? `/patient/details?event_details=${!showDetails.eventDetails}&patient_id=${searchParams.get(
                          "patient_id"
                        )}&event_id=${searchParams.get("event_id")}`
                      : `/patient/details?patient_id=${searchParams.get(
                          "patient_id"
                        )}&event_id=${searchParams.get("event_id")}&mtab=0`
                    : !showDetails?.eventDetails
                    ? `/patient/details?event_details=${!showDetails.eventDetails}&patient_id=${searchParams.get(
                        "patient_id"
                      )}`
                    : `/patient/details?patient_id=${searchParams.get(
                        "patient_id"
                      )}&mtab=0`
                }
                onClick={() => {
                  if (showDetails.eventDetails) {
                    delete queryParams.event_details;
                    setSearchParams({ ...queryParams }, { replace: true });
                  }
                }}
              >
                <Button
                  id="eventDetails"
                  variant="contained"
                  className={
                    showDetails.eventDetails
                      ? className.btn
                      : className.detailBtn
                  }
                >
                  Event Details
                </Button>
              </Link>
            </span>
          )}
          {!isEmpty(eventList) && isArray(eventList) && (
            <span>
              <Button
                id="manageEvent"
                variant="contained"
                className={
                  open.manageEvent ? className.btn : className.detailBtn
                }
                onClick={() => {
                  setOpen({ ...open, manageEvent: true });
                }}
              >
                Manage Event
              </Button>
            </span>
          )}
          <span>
            <Button
              id="newEvent1"
              variant="contained"
              className={className.btn}
              onClick={() => {
                setOpen({ ...open, event: true });
              }}
            >
              New Event
            </Button>
          </span>
          {(isTablet || md) && (
            <Button
              variant="contained"
              onClick={() => {
                setOpenSideCalender(true);
              }}
              className={className.roundDateIcon}
            >
              <Calendar fill={color.white} width={24} height={24} />
            </Button>
          )}
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        style={{
          marginTop: 10,
        }}
      >
        {topCard()}
      </Grid>
      <Grid
        container
        style={{
          marginTop: 10,
          display: "flex",
          height: isTablet ? "calc(100% - 180px)" : "calc(100% - 172px)",
        }}
        wrap={"nowrap"}
      >
        {pageLoad ? (
          <Backdrop
            open={pageLoad}
            sx={{ zIndex: 2000, backgroundColor: color.transparent }}
          >
            <MainLoader />
          </Backdrop>
        ) : showDetails.patientDetails ? (
          <Grid
            item
            overflow={isTablet ? "scroll" : null}
            className={detailsTabVal !== 2 ? className.topCardContainer : null}
            style={{ height: "100%", width: "100%" }}
          >
            {detailsTabVal === 0 ? (
              <Grid
                item
                xs={12}
                display={"flex"}
                justifyContent={"center"}
                style={{ paddingTop: 10, height: "calc(100%)" }}
              >
                <Grid item xs={isTablet ? 12 : 8} padding={isTablet && 1}>
                  <EditPatient
                    handleModal={(type) => {
                      if (type === "cancel") {
                        setShowDetails({
                          ...showDetails,
                          patientDetails: false,
                        });
                      } else {
                        eventListApi(
                          Number(
                            EncDctFn(searchParams.get("patient_id"), "decrypt")
                          )
                        );
                      }
                    }}
                  />
                </Grid>
              </Grid>
            ) : detailsTabVal === 1 ? (
              <Grid item xs={12} style={{ height: "100%" }}>
                <Phistory
                  handleClick={(type) => {
                    if (type === "success") {
                      eventListApi(
                        Number(
                          EncDctFn(searchParams.get("patient_id"), "decrypt", 4)
                        )
                      );
                    } else {
                      setShowDetails({
                        ...showDetails,
                        patientDetails: false,
                      });
                    }
                  }}
                />
              </Grid>
            ) : mergeData?.merge ? (
              <MergePatient
                from="patientDetails"
                data={mergeData?.Ids}
                handleClick={(type) => {
                  setMergeData({ ...mergeData, Ids: [], merge: false });
                }}
              />
            ) : (
              <Patient
                handleClick={(type, data) => {
                  if (type === "merge") {
                    setMergeData({
                      ...mergeData,
                      Ids: data?.mergeIds,
                      merge: true,
                    });
                  }
                }}
                from="merge"
              />
            )}
          </Grid>
        ) : isNumber(eventVal) ? (
          showDetails.eventDetails ? (
            <Grid
              item
              className={className.topCardContainer}
              style={{ height: "100%", width: "100%" }}
            >
              {detailsTabVal === 0 ? (
                <Grid item style={{ height: "calc(100%)" }}>
                  <CreateEvent
                    event_id={eventVal}
                    patientId={Number(
                      EncDctFn(searchParams.get("patient_id"), "decrypt")
                    )}
                    fromPD="eventInfo"
                  />
                </Grid>
              ) : detailsTabVal === 1 && +selectedEvent?.event_type === 2 ? (
                <Grid
                  item
                  style={{ height: "calc(100% - 50px)" }}
                  display={"flex"}
                  justifyContent={"center"}
                >
                  <Grid item xs={isTablet ? 12 : 8}>
                    <Grid
                      item
                      xs={12}
                      display={"flex"}
                      alignItems={"center"}
                      style={{ paddingBottom: 10 }}
                    >
                      <Typography variant="tableTitle">
                        Immediate Post Injury
                      </Typography>
                      <Button
                        variant="contained"
                        style={{ minWidth: 100, marginLeft: "auto" }}
                        onClick={() => setEditEventDetails("IPI")}
                      >
                        Edit
                      </Button>
                    </Grid>

                    <ImmediatePostInjury
                      from="IPIInfo"
                      note={selectedEvent?.provider_notice}
                      data={{
                        patientId: location?.state?.data?.id,
                        eventId: eventVal,
                      }}
                    />
                  </Grid>
                </Grid>
              ) : (
                <Grid
                  item
                  style={{ height: "calc(100% - 50px)" }}
                  display={"flex"}
                  justifyContent={"center"}
                >
                  <Grid
                    item
                    xs={isTablet ? 12 : 8}
                    style={{ height: "calc(100%)" }}
                  >
                    <Grid
                      item
                      xs={12}
                      display={"flex"}
                      alignItems={"center"}
                      style={{ paddingBottom: 10 }}
                    >
                      <Typography variant="tableTitle">
                        Potential Concussive Event Information
                      </Typography>
                      <Button
                        variant="contained"
                        style={{ minWidth: 100, marginLeft: "auto" }}
                        onClick={() => setEditEventDetails("IV")}
                      >
                        Edit
                      </Button>
                    </Grid>
                    <InitialVisit
                      from={"IVInfo"}
                      data={{
                        patientId: location?.state?.data?.id,
                        eventId: eventVal,
                      }}
                    />
                  </Grid>
                </Grid>
              )}
            </Grid>
          ) : tabVal === 0 ? (
            <Grid
              item
              xs={12}
              style={{
                display: "flex",
                gap: isTablet || md ? "0px" : "10px",
              }}
            >
              <Overview
                eventData={selectedEvent}
                userData={patientData?.userData}
                handleApi={(e) => {
                  if (e) {
                    // delete queryParams.event_id;
                    setSearchParams({ ...queryParams }, { replace: true });
                    eventListApi(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ),
                      true
                    );
                  }
                }}
              />
              <Grid
                style={{
                  height: "100%",
                }}
              >
                <SideCalender
                  open={openSideCalender}
                  data={calenderData}
                  status={calenderStatus}
                  handleClick={() => setOpenSideCalender(false)}
                  handleChange={(e) => {
                    getCalenderData(e);
                  }}
                  loader={calenderLoad}
                />
              </Grid>
            </Grid>
          ) : tabVal === 1 ? (
            <div
              style={{
                width: "100%",
                display: "flex",
                flexWrap: "nowrap",
                gap: "10px",
              }}
            >
              <Assessments
                handleTab={(e) => setAssessTab(e)}
                handleApi={(bool) => {
                  if (bool) {
                    eventListApi(
                      Number(
                        EncDctFn(searchParams.get("patient_id"), "decrypt")
                      ),
                      true
                    );
                  }
                }}
                activeEvent={selectedEvent}
              />
              {isEmpty(assessTab) && !isTablet && !md && (
                <Grid
                  style={{
                    height: "100%",
                  }}
                >
                  <SideCalender
                    open={openSideCalender}
                    data={calenderData}
                    status={calenderStatus}
                    handleClick={() => setOpenSideCalender(false)}
                    loader={calenderLoad}
                  />
                </Grid>
              )}
            </div>
          ) : tabVal === 2 ? (
            <Compare />
          ) : (
            <Schedule />
          )
        ) : (
          <Grid container className={className.noEventContainer}>
            <img src={Images.noEvent} alt={"no-event"} height={250} />
            <Typography variant="tableTitle" style={{ marginTop: -10 }}>
              No Event
            </Typography>
          </Grid>
        )}
      </Grid>
      {isTablet ||
        (md && (
          <Grid
            style={{
              height: "100%",
            }}
          >
            <SideCalender
              open={openSideCalender}
              data={calenderData}
              status={calenderStatus}
              handleClick={() => setOpenSideCalender(false)}
              loader={calenderLoad}
            />
          </Grid>
        ))}
      <CModal
        maxWidth={"40vw"}
        title="Send Invitation"
        visible={open.modal}
        handleModal={() => setOpen({ ...open, modal: false })}
        children={
          <>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="phone"
              name="radio-buttons-group"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <Grid container>
                <Grid item xs={12} style={{ display: "flex" }}>
                  <Grid item style={{ minWidth: 150 }}>
                    <FormControlLabel
                      value="phone"
                      control={<Radio />}
                      label={`Invite by phone : `}
                    />
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      placeholder="Phone no"
                      value={phone}
                      onChange={(e) => {
                        setPhone(
                          !Number.isNaN(Number(e.target.value))
                            ? e.target.value.trim()
                            : phone.trim()
                        );
                        setErrObj({ ...errObj, phoneErr: false, phoneMsg: "" });
                      }}
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              fill={
                                errObj.phoneErr ? color.error : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.phoneErr}
                      helperText={errObj.phoneMsg}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12} style={{ display: "flex", marginTop: 10 }}>
                  <Grid item style={{ minWidth: 150 }}>
                    <FormControlLabel
                      value="email"
                      control={<Radio />}
                      label={`Invite by email :`}
                    />
                  </Grid>
                  <Grid item xs={9}>
                    <TextField
                      fullWidth
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value.trim());
                        setErrObj({ ...errObj, emailErr: false, emailMsg: "" });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email
                              fill={
                                errObj.emailErr ? color.error : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.emailErr}
                      helperText={errObj.emailMsg}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </RadioGroup>
            <Grid item xs={3} marginLeft={"auto"} mt={2}>
              <Button
                disabled={confirmBtnLoad}
                fullWidth
                variant="contained"
                onClick={() => validation()}
              >
                {confirmBtnLoad ? <CircularProgress size={22} /> : "Send"}
              </Button>
            </Grid>
          </>
        }
      />

      {/* manage event flow modal */}
      <ManageEvent
        visible={open.manageEvent}
        data={patientData}
        eventData={selectedEvent}
        editEvent={editEventDetails}
        handleModal={(e, type) => {
          if (e === "close") {
            setEditEventDetails("");
            setOpen({ ...open, manageEvent: false });
            if (editEventDetails) {
              setDetailsTabVal(0);
              setSearchParams({ ...queryParams, mtab: 0 }, { replace: true });
            }
          } else if (e === "success") {
            setEditEventDetails("");
            setOpen({ ...open, manageEvent: false });
            if (type === "delete") {
              delete queryParams?.event_id;
            }
            delete queryParams?.diagnosis;
            setSearchParams({ ...queryParams }, { replace: true });
            eventListApi(
              Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
              true
            );
          }
        }}
      />

      {/* create event modal */}
      <CreateEvent
        visible={open.event}
        patientId={Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))}
        fromPD={"patientDetails"}
        from={from}
        handleSelect={(v, pId, eId, eventData) => {
          setPatientGId("");
          if (v === "newPatient") {
            setOpen({ ...open, event: false, patient: true });
          } else if (v === 0) {
            setOpen({ ...open, event: false, postInjury: true });
            setFrom("IPI");
          } else if (v === "Baseline") {
            setOpen({ ...open, readyToProgress: true });
            setFrom("Baseline");
            setPatientGId(eventData?.global_unique_key);
          } else {
            setOpen({ ...open, event: false, initialVisit: true });
            setFrom("");
            setRedFlagData({});
          }
          setId({ ...id, patientId: pId, eventId: eId });
        }}
        handleModal={(e, data, eventType) => {
          if (e === "close") {
            if (eventType === "Baseline" && searchParams.has("patient_id")) {
              eventListApi(
                Number(EncDctFn(searchParams?.get("patient_id"), "decrypt"))
              );
            }
            setOpen({ ...open, event: false });
          } else {
            // setPatientData(data);
          }
        }}
      />

      {/* immediate post injury modal */}
      <ImmediatePostInjury
        visible={open.postInjury}
        data={id}
        handleModal={(v, data) => {
          if (v === "close") {
            setFrom("close");
            setId({ ...id, patientId: "", eventId: "" });
            setOpen({ ...open, postInjury: false });
          } else if (v === "back") {
            setOpen({ ...open, event: true, postInjury: false });
          } else if (v === "success") {
            if (data?.gcs_score < 13 || data?.red_flag) {
              setOpen({ ...open, postInjury: false, redFlag: true });
            } else {
              setOpen({ ...open, postInjury: false, initialVisit: true });
            }
            setRedFlagData(data);
          }
        }}
      />

      {/* red flag modal */}
      <RedFlag
        visible={open.redFlag}
        id={id}
        data={redFlagData}
        handleModal={(v) => {
          if (v === "close") {
            setFrom("close");
            setId({ ...id, patientId: "", eventId: "" });
            setOpen({ ...open, redFlag: false });
          } else if (v === "back") {
            setOpen({ ...open, postInjury: true, redFlag: false });
          } else if (v === "success") {
            setOpen({ ...open, redFlag: false, initialVisit: true });
          }
        }}
      />

      {/* initial visit or potential modal */}
      <InitialVisit
        data={id}
        from={from}
        visible={open.initialVisit}
        handleModal={(e, data) => {
          setPatientGId("");
          if (e === "close") {
            setFrom("close");
            setId({ ...id, patientId: "", eventId: "" });
            setOpen({ ...open, initialVisit: false });
          } else if (e === "back") {
            if (isEmpty(redFlagData)) {
              setOpen({ ...open, initialVisit: false, event: true });
            } else {
              redFlagData?.gcs_score < 13 || redFlagData?.red_flag
                ? setOpen({ ...open, initialVisit: false, redFlag: true })
                : setOpen({ ...open, initialVisit: false, postInjury: true });
            }
          } else if (e === "success") {
            setOpen({ ...open, initialVisit: false, readyToProgress: true });
            setPatientGId(data?.global_unique_key);
          }
        }}
      />

      {/* ready to assess modal */}
      <ReadyToAssess
        from="patient"
        eventId={id?.eventId}
        patientId={patientGId}
        visible={open.readyToProgress}
        patientData={patientData?.userData}
        newType={from}
        handleModal={(e) => {
          if (e === "close") {
            eventListApi(
              Number(EncDctFn(searchParams?.get("patient_id"), "decrypt"))
            );
            setFrom("close");
            setId({ ...id, patientId: "", eventId: "" });
            setOpen({ ...open, readyToProgress: false, event: false });
          } else if (e === "back") {
            if (from === "Baseline") {
              setOpen({ ...open, readyToProgress: false, event: true });
            } else {
              setOpen({ ...open, readyToProgress: false, initialVisit: true });
            }
            setFrom("");
          }
        }}
      />
    </Grid>
  );
}
