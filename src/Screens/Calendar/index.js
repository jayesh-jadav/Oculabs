import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Autocomplete,
  Backdrop,
  Grid,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { color } from "../../Config/theme";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { isMobile, isTablet } from "react-device-detect";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import moment from "moment";
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { Link, useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import ClearIcon from "@mui/icons-material/Clear";
import { useSelector } from "react-redux";
import MainLoader from "../../Components/Loader/MainLoader";
import ActiveDot from "../../Components/ActiveDot";
import {
  rtaDropdownArr,
  statusColor,
  statusText,
} from "../../Config/Static_Data";

function Calendar() {
  const { userData } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [calenderDate, setCalenderDate] = useState(null);
  const [eventData, setEventData] = useState();
  const [loader, setLoader] = useState(false);
  const calendarRef = useRef(null);
  // patient state
  const [patient, setPatient] = useState(null);
  const [patientList, setPatientList] = useState([]);
  const [patientId, setPatientId] = useState(
    searchParams.has("patientId")
      ? EncDctFn(searchParams.get("patientId"), "decrypt")
      : ""
  );

  // provider state
  const [provider, setProvider] = useState(null);
  const [providerList, setProvidersList] = useState([]);
  const [providerId, setProviderId] = useState(
    searchParams.has("providerId")
      ? EncDctFn(searchParams.get("providerId"), "decrypt")
      : ""
  );
  const [status, setStatus] = useState(
    searchParams.has("status")
      ? EncDctFn(searchParams.get("status"), "decrypt")
      : ""
  );
  const [eventType, setEventType] = useState(
    searchParams.has("type")
      ? EncDctFn(searchParams.get("type"), "decrypt")
      : ""
  );
  const [assType, setAssType] = useState(
    searchParams.has("assType")
      ? EncDctFn(searchParams.get("assType"), "decrypt")
      : ""
  );
  const [RTAStage, setRTAStage] = useState(
    searchParams.has("RTAStage")
      ? EncDctFn(searchParams.get("RTAStage"), "decrypt")
      : ""
  );
  const [recentEvent, setRecentEvent] = useState(
    searchParams.has("recentEvent")
      ? EncDctFn(searchParams.get("recentEvent"), "decrypt")
      : ""
  );

  // get the filter container width and height
  const ref = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(ref.current.offsetHeight);
    const updateContainerHeight = () => {
      // Get the container's height, for example, using ref or another method
      const container = document.getElementById("filter");
      if (container) {
        const newContainerHeight = container.offsetHeight;
        setHeight(newContainerHeight);
      }
    };
    // Initial height calculation
    updateContainerHeight();
    // Add a resize event listener
    window.addEventListener("resize", updateContainerHeight);
    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", updateContainerHeight);
    };
  }, []);

  useEffect(() => {
    PatientListApi();
    providersApi();
  }, []);

  useEffect(() => {
    getCalenderData(calenderDate);
  }, [patient, searchParams]);

  function getColor(data) {
    const color = statusColor.find((item) => item?.status == data);

    return color?.color;
  }

  // this function is used to handle prevMonth click
  const handlePrevMonthClick = (type) => {
    // Get a reference to the FullCalendar component using the ref
    const calendarApi = calendarRef.current.getApi();
    // Use the FullCalendar API to move to the previous month
    if (type === "prev") {
      calendarApi.prev();
    } else if (type === "next") {
      calendarApi.next();
    }
  };

  // get calender data
  async function getCalenderData(date) {
    setLoader(true);
    const month = moment(date || new Date()).format("M");
    const year = moment(date || new Date()).format("YYYY");
    try {
      const response = await getApiData(
        `${Setting.endpoints.calender}?month=${month}&year=${year}&patient_id=${
          patientId ? patientId : ""
        }&provider_id=${providerId ? providerId : ""}&event_type=${
          assType ? assType : eventType ? eventType : ""
        }&assessment_status=${
          status ? status : ""
        }&rta_type=${RTAStage}&event_status=${recentEvent}`,
        "GET",
        {}
      );
      if (response?.status) {
        setLoader(false);
        if (!isEmpty(response?.data)) {
          let event = [];
          Object.entries(response?.data)?.forEach(([key, value]) => {
            if (!isEmpty(value)) {
              value?.map((item) => {
                item["events"]?.map((e) => {
                  let obj = {
                    date: key,
                    title: e.event_title,
                    status: e.assessment_status,
                    name: item.patient_details.name,
                    assessment_type: e.assessment_type,
                    event_id: e.event_id,
                    patient_id: item.patient_details.patient_id,
                    event_status: e.event_status,
                    assessment_id: e.assessment_id,
                    rta_data: e.rta_data,
                  };
                  if (e?.erta_date) {
                    obj["erta"] = e?.erta_date;
                  }
                  event.push(obj);
                });
              });
            }
          });
          setEventData(event);
        } else {
          setEventData({});
        }
      } else {
        setLoader(false);
        toast.error(response.message);
      }
      setLoader(false);
    } catch (er) {
      setLoader(false);
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  // this function is used to display a events
  const customEventContent = (eventData) => {
    const patientId = EncDctFn(
      eventData?.event?.extendedProps?.patient_id,
      "encrypt"
    );
    const eventId = EncDctFn(
      eventData?.event?.extendedProps?.event_id,
      "encrypt"
    );
    const assessmentId = eventData?.event?.extendedProps?.assessment_id
      ? EncDctFn(eventData?.event?.extendedProps?.assessment_id, "encrypt")
      : "";

    const rtaLabel =
      rtaDropdownArr &&
      rtaDropdownArr.find(
        (item) =>
          parseInt(item?.value) ===
          parseInt(eventData?.event?.extendedProps?.rta_data)
      )?.label;
    const eRTA = eventData?.event?.extendedProps?.erta;

    const toolTipTitle = `${eventData?.event?.extendedProps?.name}\n${
      eRTA ? "eRTA" : eventData?.event?.extendedProps?.assessment_type || ""
    }\n${rtaLabel || ""}`;

    return (
      <Link
        style={{
          textDecoration: "none",
          outline: "none",
        }}
        onClick={() => {
          if (
            eventData.event.extendedProps.event_status == -4 ||
            eventData.event.extendedProps.event_status == -1
          ) {
            toast.warn("Event is deleted");
          }
        }}
        to={
          eventData.event.extendedProps.event_status != -4 &&
          eventData.event.extendedProps.event_status != -1
            ? `/patient/details?patient_id=${patientId}&event_id=${eventId}&${
                eventData?.event?.extendedProps?.status?.toLowerCase() ===
                "pending"
                  ? `status=${eventData?.event?.extendedProps?.status}`
                  : `assessment_id=${assessmentId}`
              }&mtab=${eventData?.event?.extendedProps?.erta ? 0 : 1}`
            : "#"
        }
      >
        <div
          style={{
            display: "flex",
            backgroundColor: color.borderColor,
            flexDirection: "row",
            borderRadius: 4,
            cursor: "pointer",
            paddingRight: 5,
            // You can add more custom styles here as needed
          }}
        >
          <div
            style={{
              minWidth: 8,
              backgroundColor: eRTA
                ? getColor("eRTA")
                : getColor(eventData?.event?.extendedProps?.status),
              marginRight: 6,
              borderRadius: "4px 0px 0px 4px",
            }}
          />
          <div
            title={toolTipTitle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
              overflow: "hidden",
            }}
          >
            <Typography
              style={{
                textTransform: "capitalize",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {eventData?.event?.extendedProps?.name}
            </Typography>
            <Typography
              style={{
                textTransform: eRTA ? "initial" : "capitalize",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {eRTA
                ? "eRTA"
                : eventData?.event?.extendedProps?.assessment_type || ""}
            </Typography>
          </div>
        </div>
      </Link>
    );
  };

  // get patient list
  async function PatientListApi(id) {
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientList}?provider_uid=${id || ""}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setPatientList(response?.data);
          response?.data?.map((item, index) => {
            if (
              searchParams.has("patientId") &&
              item?.id ===
                Number(EncDctFn(searchParams.get("patientId"), "decrypt"))
            ) {
              setPatient(item);
            }
          });
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  // get provider list
  async function providersApi() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.providers}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setProvidersList(response?.data);
          response?.data?.map((item, index) => {
            if (
              searchParams.has("providerId") &&
              item?.id ===
                Number(EncDctFn(searchParams.get("providerId"), "decrypt"))
            ) {
              setProvider(item);
            }
          });
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  const renderCalendar = useMemo(() => {
    return (
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        height={`calc(100% - ${height + 10}px)`}
        // weekends={false}
        events={eventData}
        //Edit event
        eventContent={customEventContent} //event style
        headerToolbar={false}
        datesSet={(e) => {
          setCalenderDate(e.view.currentStart);
          getCalenderData(e.view.currentStart);
        }}
        // used for more button display
        dayMaxEventRows={isTablet ? 3 : isMobile ? 1 : 4}
        // used for hide a next month date
        // showNonCurrentDates={false}
        fixedWeekCount={false}
      />
    );
  }, [eventData, height]);

  return (
    <div style={{ width: "100%", padding: 16 }}>
      <Backdrop open={loader} sx={{ zIndex: 2 }}>
        <MainLoader />
      </Backdrop>
      <Grid item xs={12} style={{ marginBottom: 10 }}>
        <Typography variant="title" style={{ color: color.primary }}>
          Patient Report
        </Typography>
      </Grid>
      <div
        style={{
          height: isTablet ? "calc(100% - 55px)" : "calc(100% - 67px)",
          backgroundColor: color.white,
          padding: "15px",
          boxShadow: color.shadow,
          borderRadius: 12,
        }}
      >
        <Grid
          id={"filter"}
          ref={ref}
          item
          xs={12}
          display="flex"
          alignItems="center"
          justifyContent={"space-between"}
          gap="10px"
          style={{ marginBottom: 10 }}
        >
          <Grid item display={"flex"} alignItems="center" id="arrow">
            <IconButton onClick={() => handlePrevMonthClick("prev")}>
              <KeyboardArrowLeft />
            </IconButton>
            <IconButton onClick={() => handlePrevMonthClick("next")}>
              <KeyboardArrowRight />
            </IconButton>
            <Typography variant="tableTitle">
              {moment(calenderDate).format("MMMM (YYYY)")}
            </Typography>
          </Grid>
          <Grid item display={"flex"} flexWrap="wrap" gap="10px">
            {/* provider autocomplete */}
            {userData?.personal_info?.is_provider == 0 && (
              <div id="providerSearch">
                <Autocomplete
                  value={provider}
                  disabled={patient ? true : false}
                  style={{ minWidth: 160, width: isTablet && 200 }}
                  onChange={(e, v, r, b) => {
                    setProvider(v);
                    PatientListApi(v?.user_id);
                    setProviderId(v?.id);
                    if (v?.id) {
                      setSearchParams(
                        {
                          ...queryParams,
                          providerId: EncDctFn(v?.id, "encrypt"),
                        },
                        { replace: true }
                      );
                    } else {
                      delete queryParams.providerId;
                      setSearchParams({ ...queryParams }, { replace: true });
                    }
                  }}
                  popupIcon={<KeyboardArrowDown />}
                  options={providerList}
                  groupBy={(option) => option.firstLetter}
                  getOptionLabel={(option) => {
                    return option?.firstname + " " + option?.lastname;
                  }}
                  renderInput={(params) => (
                    <TextField {...params} placeholder="Select provider" />
                  )}
                />
              </div>
            )}
            {/* patient autocomplete */}
            <div id="patientSearch">
              <Autocomplete
                value={patient}
                style={{ minWidth: 160, width: isTablet && 200 }}
                onChange={(e, v, r, b) => {
                  setPatient(v);
                  setPatientId(v?.id);
                  if (v?.id) {
                    setSearchParams(
                      {
                        ...queryParams,
                        patientId: EncDctFn(v?.id, "encrypt"),
                      },
                      { replace: true }
                    );
                  } else {
                    delete queryParams.patientId;
                    setSearchParams({ ...queryParams }, { replace: true });
                  }
                }}
                popupIcon={<KeyboardArrowDown />}
                options={patientList}
                groupBy={(option) => option.firstLetter}
                getOptionLabel={(option) => {
                  return option?.firstname + " " + option?.lastname;
                }}
                renderInput={(params) => (
                  <TextField {...params} placeholder="Select patient" />
                )}
              />
            </div>

            {/* event type select */}
            <div id="eventSearch">
              <Select
                displayEmpty
                disabled={assType ? true : false}
                value={eventType || ""}
                onChange={(e) => {
                  if (e.target.value == 1) {
                    setAssType(e.target.value);
                  }
                  setEventType(e.target.value);
                  setSearchParams(
                    {
                      ...queryParams,
                      type: EncDctFn(e.target.value, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
                style={{
                  color: !eventType ? color.placeholder : "",
                  minWidth: 160,
                  width: isTablet && 200,
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "40vh",
                    },
                  },
                }}
                IconComponent={!eventType && KeyboardArrowDown}
                endAdornment={
                  <IconButton
                    disabled={assType ? true : false}
                    sx={{
                      display: eventType ? "visible" : "none",
                      padding: 0,
                    }}
                    onClick={() => {
                      setEventType("");
                      delete queryParams.type;
                      setSearchParams({ ...queryParams }, { replace: true });
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <MenuItem value={""} disabled hidden selected>
                  Select event type
                </MenuItem>
                <MenuItem value={"1"}>Baseline</MenuItem>
                <MenuItem value={"5"}>Injury</MenuItem>
              </Select>
            </div>
            {/* assessment type */}

            {!eventType ? (
              <div id="assessmentSearch">
                <Select
                  displayEmpty
                  value={assType || ""}
                  onChange={(e) => {
                    setAssType(e.target.value);
                    setSearchParams(
                      {
                        ...queryParams,
                        assType: EncDctFn(e.target.value, "encrypt"),
                      },
                      { replace: true }
                    );
                  }}
                  style={{
                    color: !assType ? color.placeholder : "",
                    minWidth: 160,
                    width: isTablet && 200,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "40vh",
                      },
                    },
                  }}
                  IconComponent={!assType && KeyboardArrowDown}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: assType ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setAssType("");
                        delete queryParams.assType;
                        setSearchParams({ ...queryParams }, { replace: true });
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value={""} disabled hidden selected>
                    Select assessment type
                  </MenuItem>
                  <MenuItem value={"1"}>Baseline</MenuItem>
                  <MenuItem value={"2"}>Immediate Post Injury</MenuItem>
                  <MenuItem value={"3"}>Initial Visit</MenuItem>
                  <MenuItem value={"4"}>Subsequent</MenuItem>
                </Select>
              </div>
            ) : eventType === "1" ? (
              <div id="assessmentSearch">
                <Select
                  displayEmpty
                  value={assType || ""}
                  onChange={(e) => {
                    setAssType(e.target.value);
                    setSearchParams(
                      {
                        ...queryParams,
                        assType: EncDctFn(e.target.value, "encrypt"),
                      },
                      { replace: true }
                    );
                  }}
                  style={{
                    color: !assType ? color.placeholder : "",
                    minWidth: 160,
                    width: isTablet && 200,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "40vh",
                      },
                    },
                  }}
                  IconComponent={!assType && KeyboardArrowDown}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: assType ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setAssType("");
                        delete queryParams.assType;
                        setSearchParams({ ...queryParams }, { replace: true });
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value={""} disabled hidden selected>
                    Select assessment type
                  </MenuItem>
                  <MenuItem value={"1"}>Baseline</MenuItem>
                </Select>
              </div>
            ) : (
              <div id="assessmentSearch">
                <Select
                  displayEmpty
                  value={assType || ""}
                  onChange={(e) => {
                    setAssType(e.target.value);
                    setSearchParams(
                      {
                        ...queryParams,
                        assType: EncDctFn(e.target.value, "encrypt"),
                      },
                      { replace: true }
                    );
                  }}
                  style={{
                    color: !assType ? color.placeholder : "",
                    minWidth: 160,
                    width: isTablet && 200,
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "40vh",
                      },
                    },
                  }}
                  IconComponent={!assType && KeyboardArrowDown}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: assType ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setAssType("");
                        delete queryParams.assType;
                        setSearchParams({ ...queryParams }, { replace: true });
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value={""} disabled hidden selected>
                    Select assessment type
                  </MenuItem>
                  <MenuItem value={"2"}>Immediate Post Injury</MenuItem>
                  <MenuItem value={"3"}>Initial Visit</MenuItem>
                  <MenuItem value={"4"}>Subsequent</MenuItem>
                </Select>
              </div>
            )}
            {/* assessment status */}
            <div id="assessmentStatus">
              <Select
                displayEmpty
                value={status || ""}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setSearchParams(
                    {
                      ...queryParams,
                      status: EncDctFn(e.target.value, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
                style={{
                  color: status ? "" : color.placeholder,
                  minWidth: 160,
                  width: isTablet && 200,
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "40vh",
                    },
                  },
                }}
                IconComponent={!status && KeyboardArrowDown}
                endAdornment={
                  <IconButton
                    sx={{
                      display: status ? "visible" : "none",
                      padding: 0,
                    }}
                    onClick={() => {
                      setStatus("");
                      delete queryParams.status;
                      setSearchParams({ ...queryParams }, { replace: true });
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <MenuItem value={""} disabled hidden selected>
                  Select assessment status
                </MenuItem>
                {statusColor.map((item, index) => {
                  if (
                    item?.status !== "COMPLETED_WITHIN_OAW" &&
                    item?.status !== "PENDING" &&
                    item?.status !== "eRTA"
                  ) {
                    return (
                      <MenuItem key={index} value={item?.status}>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <ActiveDot
                            marginRight={5}
                            color={item?.color}
                            size={8}
                          />
                          {statusText[item?.status]}
                        </div>
                      </MenuItem>
                    );
                  }
                })}
              </Select>
            </div>
            {/* RTA stage */}
            <div id="RTAsearch">
              <Select
                displayEmpty
                value={RTAStage || ""}
                onChange={(e) => {
                  setRTAStage(e.target.value);
                  setSearchParams(
                    {
                      ...queryParams,
                      RTAStage: EncDctFn(e.target.value, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
                style={{
                  color: RTAStage ? "" : color.placeholder,
                  minWidth: 160,
                  width: isTablet && 200,
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "40vh",
                    },
                  },
                }}
                IconComponent={!RTAStage && KeyboardArrowDown}
                endAdornment={
                  <IconButton
                    sx={{
                      display: RTAStage ? "visible" : "none",
                      padding: 0,
                    }}
                    onClick={() => {
                      setRTAStage("");
                      delete queryParams.RTAStage;
                      setSearchParams({ ...queryParams }, { replace: true });
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <MenuItem value={""} disabled hidden selected>
                  Select RTA Stage
                </MenuItem>
                {!isEmpty(rtaDropdownArr) &&
                  rtaDropdownArr?.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item?.value}>
                        {item?.label}
                      </MenuItem>
                    );
                  })}
              </Select>
            </div>

            {/* most recent events */}
            <div id="mostRecent">
              <Select
                displayEmpty
                value={recentEvent || ""}
                onChange={(e) => {
                  setRecentEvent(e.target.value);
                  setSearchParams(
                    {
                      ...queryParams,
                      recentEvent: EncDctFn(e.target.value, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
                style={{
                  color: !recentEvent ? color.placeholder : "",
                  minWidth: 160,
                  width: isTablet && 200,
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: "40vh",
                    },
                  },
                }}
                IconComponent={!recentEvent && KeyboardArrowDown}
                endAdornment={
                  <IconButton
                    sx={{
                      display: recentEvent ? "visible" : "none",
                      padding: 0,
                    }}
                    onClick={() => {
                      setRecentEvent("");
                      delete queryParams.recentEvent;
                      setSearchParams({ ...queryParams }, { replace: true });
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <MenuItem value={""} disabled hidden selected>
                  Select most recent event
                </MenuItem>
                <MenuItem value={"1"}>Open</MenuItem>
                <MenuItem value={"0"}>Closed</MenuItem>
                <MenuItem value={"-1"}>Auto Closed</MenuItem>
              </Select>
            </div>
          </Grid>
        </Grid>
        {renderCalendar}
      </div>
    </div>
  );
}

export default Calendar;
