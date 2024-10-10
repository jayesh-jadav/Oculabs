import React, {
  useEffect,
  useState,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  Backdrop,
  Grid,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { color } from "../../../Config/theme";
import "./styles.css";
import moment from "moment";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isEmpty } from "lodash";
import { toast } from "react-toastify";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useSearchParams } from "react-router-dom";
import {
  KeyboardArrowDown,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import MainLoader from "../../Loader/MainLoader";
import { isTablet } from "react-device-detect";
import ActiveDot from "../../ActiveDot";
import { statusColor, statusText } from "../../../Config/Static_Data";

function Schedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const calendarRef = useRef(null);
  // calender state
  const [calenderDate, setCalenderDate] = useState(new Date());
  const [calenderData, setCalenderData] = useState({});
  const [eventData, setEventData] = useState();
  const [loader, setLoader] = useState(false);

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

  useEffect(() => {
    getCalenderData(calenderDate);
  }, [searchParams]);

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

  function getColor(data) {
    const color = statusColor.find((item) => item?.status == data);

    return color?.color;
  }

  // get calender data
  async function getCalenderData(date) {
    setLoader(true);
    const month = moment(date || new Date()).format("M");
    const year = moment(date || new Date()).format("YYYY");
    try {
      const response = await getApiData(
        `${Setting.endpoints.calender}?month=${month}&year=${year}&patient_id=${
          searchParams.has("patient_id") &&
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
        }&event_type=${
          assType ? assType : eventType ? eventType : ""
        }&assessment_status=${status ? status : ""}&event_id=${
          searchParams.has("event_id")
            ? Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
            : ""
        }`,
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
          setCalenderData(response?.data);
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
    const eRTA = eventData?.event?.extendedProps?.erta;
    return (
      <div
        style={{
          display: "flex",
          backgroundColor: color.borderColor,
          flexDirection: "row",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 8,
            backgroundColor: eRTA
              ? getColor("eRTA")
              : getColor(eventData.event.extendedProps.status),
            marginRight: 6,
            borderRadius: "4px 0px 0px 4px",
          }}
        />
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            style={{ textTransform: eRTA ? "initial" : "capitalize" }}
          >
            {eRTA
              ? "eRTA"
              : eventData?.event?.extendedProps?.assessment_type || ""}
          </Typography>
        </div>
      </div>
    );
  };

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
        eventClick={(data) => {
          if (
            data.event.extendedProps.event_status != -4 &&
            data.event.extendedProps.event_status != -1
          ) {
            if (
              data?.event?.extendedProps?.status == "OPEN" ||
              data?.event?.extendedProps?.status == "READY" ||
              data?.event?.extendedProps?.status == "LATE" ||
              data?.event?.extendedProps?.status == "PENDING" ||
              data?.event?.extendedProps?.erta
            ) {
              setSearchParams(
                {
                  ...queryParams,
                  event_id: EncDctFn(
                    data.event.extendedProps.event_id,
                    "encrypt"
                  ),
                  status: data?.event?.extendedProps?.status,
                  mtab: 1,
                },
                { replace: true }
              );
            } else {
              setSearchParams(
                {
                  ...queryParams,
                  event_id: EncDctFn(
                    data.event.extendedProps.event_id,
                    "encrypt"
                  ),
                  assessment_id: EncDctFn(
                    data?.event?.extendedProps?.assessment_id,
                    "encrypt"
                  ),
                  mtab: 1,
                },
                { replace: true }
              );
            }
          } else {
            toast.warn("Event is deleted");
          }
        }}
        eventContent={customEventContent} //event style
        headerToolbar={{
          left: "", // Put the navigation buttons on the left
          center: "",
          right: "",
        }}
        datesSet={(e) => {
          setCalenderDate(e.view.currentStart);
          getCalenderData(e.view.currentStart);
        }}
        // used for more button display
        dayMaxEventRows={isTablet ? 1 : 3}
        fixedWeekCount={false}
      />
    );
  }, [eventData]);

  return (
    <div
      style={{
        width: "100%",
        height: "calc(100% - 20px)",
        backgroundColor: color.white,
        padding: "10px",
        boxShadow: color.shadow,
        borderRadius: 12,
      }}
    >
      <Backdrop open={loader} sx={{ zIndex: 2 }}>
        <MainLoader />
      </Backdrop>
      <Grid
        ref={ref}
        item
        xs={12}
        display="flex"
        alignItems="center"
        justifyContent={"space-between"}
      >
        <Grid item xs={4} display={"flex"} alignItems="center">
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
        <Grid item display={"flex"} gap="10px" flexWrap={"wrap"}>
          {/* event type select */}
          <div>
            <Select
              fullWidth
              displayEmpty
              value={eventType || ""}
              onChange={(e) => {
                setEventType(e.target.value);
                setSearchParams(
                  { ...queryParams, type: EncDctFn(e.target.value, "encrypt") },
                  { replace: true }
                );
              }}
              style={{
                color: !eventType ? color.placeholder : "",
                minWidth: 120,
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
          <div>
            {!eventType ? (
              <Select
                fullWidth
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
                  minWidth: 120,
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
            ) : eventType === "1" ? (
              <Select
                fullWidth
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
                  minWidth: 120,
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
            ) : (
              <Select
                fullWidth
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
                  minWidth: 120,
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
            )}
          </div>

          {/* assessment status */}
          <div>
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
                minWidth: 120,
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
        </Grid>
      </Grid>

      {renderCalendar}
    </div>
  );
}

export default Schedule;
