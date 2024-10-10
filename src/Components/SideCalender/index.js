import { KeyboardArrowDown } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  Collapse,
  Divider,
  Grid,
  ListItemButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { LocalizationProvider, StaticDatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import React, { useCallback, useEffect, useRef, useState } from "react";
import theme, { color, FontFamily } from "../../Config/theme";
import ActiveDot from "../ActiveDot";
import styles from "./styles";
import authActions from "../../Redux/reducers/auth/actions";
import { useDispatch, useSelector } from "react-redux";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import { DayCalendarSkeleton } from "@mui/x-date-pickers/DayCalendarSkeleton";
import { isTablet } from "react-device-detect";
import Drawer from "@mui/material/Drawer";
import { isEmpty } from "lodash";
import { EncDctFn } from "../../Utils/EncDctFn";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import Calendar from "../CustomIcon/Header/Calendar";
import Images from "../../Config/Images";
import { statusColor, statusText } from "../../Config/Static_Data";

export default function SideCalender(props) {
  const {
    handleClick = () => null,
    handleChange = () => null,
    from,
    open = false,
    data = {},
    status = {},
    collapse = false,
    loader = false,
  } = props;
  const className = styles();
  const calenderRef = useRef();
  // media for responsive
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const { setToggleDrawer } = authActions;
  const dispatch = useDispatch();
  const { isToggleDrawer } = useSelector((state) => state.auth);

  const [checked, setChecked] = useState(false);
  // selected date state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeIndex, setActiveIndex] = useState(null);

  useEffect(() => {
    if (isToggleDrawer) {
      setChecked(false);
    }
  }, [checked, isToggleDrawer]);

  useEffect(() => {
    let handler = (e) => {
      if (!isEmpty(calenderRef.current)) {
        if (!calenderRef.current.contains(e.target)) {
          setChecked(false);
        }
      }
    };
    if (!isEmpty(calenderRef.current)) {
      document.addEventListener("mousedown", handler);
    }
    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  function disableWeekends(date) {
    return date.getDay() === 0 || date.getDay() === 6;
  }

  function getColor(data) {
    if (data) {
      const color = statusColor.find((item) => item?.status == data);

      return color?.color;
    } else return null;
  }

  const ServerDay = useCallback(
    (props) => {
      const { day, outsideCurrentMonth, ...other } = props;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <PickersDay
            {...other}
            outsideCurrentMonth={outsideCurrentMonth}
            day={day}
            style={{ marginBottom: -8 }}
          />

          <div style={{ display: "flex", gap: "2px" }}>
            {Object.entries(status)?.map(([key, value]) => {
              const isSelected =
                !outsideCurrentMonth &&
                key === moment(day).format("YYYY-MM-DD");
              if (isSelected) {
                return (
                  !isEmpty(value?.statusArr) &&
                  value?.statusArr?.map((item, index) => {
                    if (item) {
                      return (
                        <React.Fragment key={index}>
                          <ActiveDot
                            zIndex={1}
                            size={5}
                            color={
                              item === "eRTA"
                                ? getColor("eRTA")
                                : getColor(item)
                            }
                            title={statusText[item]}
                            tooltip
                            arrow
                          />
                        </React.Fragment>
                      );
                    }
                  })
                );
              }
            })}
          </div>
        </div>
      );
    },
    [status]
  );

  //open calendar design
  function OpenCalender() {
    return (
      <Grid item style={{ padding: "10px 0px", height: "100%" }}>
        <div style={{ position: "relative" }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <StaticDatePicker
              views={["year", "month", "day"]}
              value={selectedDate}
              onChange={(item) => {
                handleChange(item);
                setSelectedDate(item);
                setActiveIndex(null);
              }}
              // disableFuture
              onMonthChange={(item) => {
                handleChange(item);
                setSelectedDate(item);
                setActiveIndex(null);
              }}
              slots={{
                actionBar: "hidden",
                toolbar: "hidden",
                day: ServerDay,
              }}
              renderInput={(params) => {
                return (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps,
                    }}
                  />
                );
              }}
              loading={false}
              renderLoading={() => <DayCalendarSkeleton />}
              // shouldDisableDate={disableWeekends}
              sx={{
                "& .MuiPickersCalendarHeader-root": {
                  paddingLeft: 7.5,
                },
                height: "280px",
              }}
            />
          </LocalizationProvider>
          <Button
            variant="contained"
            onClick={() => {
              setChecked(!checked);
            }}
            className={className.calendarIconContainer}
          >
            <Calendar fill={color.white} height={24} width={24} />
          </Button>
        </div>
        {/* bottom patient list disaply */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "20px 10px 0px 10px",
          }}
        >
          <Button
            variant="contained"
            onClick={() => {
              setChecked(!checked);
            }}
            className={className.roundDateIcon}
            style={{ marginRight: 10 }}
          >
            <img
              src={Images.Hamburger2}
              style={{ padding: 2 }}
              alt={"Humbugger"}
            />
          </Button>
          <Typography variant="tableTitle">
            {moment(selectedDate || new Date()).format("MMM D, YYYY")}
          </Typography>
        </div>

        <Grid
          item
          className={className.scrollBar}
          style={{
            marginTop: 10,
            padding: "0px 10px 10px 0px",
            height: "calc(100% - 335px)",
          }}
        >
          {loader ? (
            <Grid
              item
              style={{
                width: "100%",
                height: "100%",
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress size={25} />
            </Grid>
          ) : (
            Object.entries(data).map(([key, value]) => {
              if (key === moment(selectedDate).format("YYYY-MM-DD")) {
                return value?.map((item, index) => {
                  if (item?.events?.length === 1) {
                    return (
                      <Grid container key={index}>
                        {item?.events?.map((item1, index1) => {
                          const assessment_status = item1?.assessment_status;
                          return collapse ? (
                            <Collapse
                              key={index1}
                              in={true}
                              timeout="auto"
                              unmountOnExit
                              style={{
                                width: "100%",
                              }}
                            >
                              <Link
                                to={
                                  item1?.assessment_type
                                    ? assessment_status === "pending"
                                      ? `/patient/details?patient_id=${EncDctFn(
                                          item?.patient_details?.patient_id,
                                          "encrypt"
                                        )}&event_id=${EncDctFn(
                                          item1?.event_id,
                                          "encrypt"
                                        )}&status=${
                                          item1?.assessment_status
                                        }&mtab=1`
                                      : `/patient/details?patient_id=${EncDctFn(
                                          item?.patient_details?.patient_id,
                                          "encrypt"
                                        )}&event_id=${EncDctFn(
                                          item1?.event_id,
                                          "encrypt"
                                        )}&assessment_id=${EncDctFn(
                                          item1?.assessment_id,
                                          "encrypt"
                                        )}&mtab=1`
                                    : "#"
                                }
                                style={{
                                  textDecoration: "none",
                                  outline: "none",
                                }}
                                onClick={(event) => {
                                  if (!item1?.assessment_type) {
                                    event.preventDefault(); // Stop the redirection
                                  } else if (item1?.event_status == -4) {
                                    event.preventDefault(); // Stop redirection if event is deleted
                                    toast.warn("Event is deleted");
                                  }
                                }}
                              >
                                <Grid
                                  item
                                  xs={12}
                                  style={{
                                    paddingLeft: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    cursor: "pointer",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "3px",
                                    }}
                                  >
                                    <ActiveDot
                                      zIndex={1}
                                      size={8}
                                      color={
                                        assessment_status
                                          ? getColor(assessment_status)
                                          : item1?.erta_date
                                          ? getColor("eRTA")
                                          : null
                                      }
                                      tooltip={true}
                                      title={
                                        statusText[
                                          assessment_status
                                            ? assessment_status
                                            : item1?.erta_date
                                            ? "eRTA"
                                            : null
                                        ]
                                      }
                                    />
                                    <Typography className={className.text}>
                                      {item?.patient_details?.name}
                                    </Typography>
                                  </div>

                                  <Typography
                                    style={{
                                      textTransform: item1?.assessment_type
                                        ? "capitalize"
                                        : "none",
                                      textAlign: "end",
                                    }}
                                  >
                                    {item1?.assessment_type ||
                                      (item1?.erta_date ? "eRTA" : null)}
                                  </Typography>
                                </Grid>
                              </Link>
                            </Collapse>
                          ) : (
                            <Link
                              key={index1}
                              to={
                                assessment_status === "pending"
                                  ? `/patient/details?patient_id=${EncDctFn(
                                      item?.patient_details?.patient_id,
                                      "encrypt"
                                    )}&event_id=${EncDctFn(
                                      item1?.event_id,
                                      "encrypt"
                                    )}&status=${
                                      item1?.assessment_status
                                    }&mtab=1`
                                  : `/patient/details?patient_id=${EncDctFn(
                                      item?.patient_details?.patient_id,
                                      "encrypt"
                                    )}&event_id=${EncDctFn(
                                      item1?.event_id,
                                      "encrypt"
                                    )}&assessment_id=${EncDctFn(
                                      item1?.assessment_id,
                                      "encrypt"
                                    )}&mtab=1`
                              }
                              style={{
                                textDecoration: "none",
                                outline: "none",
                              }}
                              onClick={() => {
                                if (item1?.event_status == -4) {
                                  toast.warn("Event is deleted");
                                }
                              }}
                            >
                              <Grid
                                item
                                style={{
                                  paddingLeft: 10,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "5px",
                                  cursor: "pointer",
                                }}
                              >
                                <ActiveDot
                                  zIndex={1}
                                  size={8}
                                  color={getColor(assessment_status)}
                                />
                                <div>
                                  <Typography
                                    style={{ textTransform: "capitalize" }}
                                  >
                                    {item1?.assessment_type}
                                  </Typography>
                                </div>
                              </Grid>
                            </Link>
                          );
                        })}

                        {value?.length - 1 !== index && (
                          <div style={{ width: "100%" }}>
                            <Divider
                              style={{
                                backgroundColor: color.lightBorder,
                                margin: "6px 0px",
                              }}
                            />
                          </div>
                        )}
                      </Grid>
                    );
                  } else {
                    return (
                      <Grid container key={index}>
                        {collapse ? (
                          <div
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              if (activeIndex === index) {
                                setActiveIndex(null);
                              } else {
                                setActiveIndex(index);
                              }
                            }}
                          >
                            <Typography
                              className={className.text}
                              style={{ marginLeft: 10 }}
                            >
                              {item?.patient_details?.name}
                            </Typography>
                            <div>
                              <ListItemButton
                                style={{
                                  padding: 0,
                                  borderRadius: "50%",
                                }}
                                onClick={() => {
                                  if (activeIndex === index) {
                                    setActiveIndex(null);
                                  } else {
                                    setActiveIndex(index);
                                  }
                                }}
                              >
                                <KeyboardArrowDown
                                  style={{
                                    color: color.placeholder,
                                    transition: "0.5s",
                                    transform:
                                      activeIndex === index && "rotate(180deg)",
                                  }}
                                />
                              </ListItemButton>
                            </div>
                          </div>
                        ) : null}
                        <Grid item>
                          {item?.events?.map((item1, index1) => {
                            const assessment_status = item1?.assessment_status
                              ? item1?.assessment_status
                              : item1?.assessment_status;
                            return collapse ? (
                              <Collapse
                                key={index1}
                                in={activeIndex === index}
                                timeout="auto"
                                unmountOnExit
                                style={{ width: "100%" }}
                              >
                                <Link
                                  to={
                                    item1?.assessment_type
                                      ? assessment_status === "pending"
                                        ? `/patient/details?patient_id=${EncDctFn(
                                            item?.patient_details?.patient_id,
                                            "encrypt"
                                          )}&event_id=${EncDctFn(
                                            item1?.event_id,
                                            "encrypt"
                                          )}&status=${
                                            item1?.assessment_status
                                          }&mtab=1`
                                        : `/patient/details?patient_id=${EncDctFn(
                                            item?.patient_details?.patient_id,
                                            "encrypt"
                                          )}&event_id=${EncDctFn(
                                            item1?.event_id,
                                            "encrypt"
                                          )}&assessment_id=${EncDctFn(
                                            item1?.assessment_id,
                                            "encrypt"
                                          )}&mtab=1`
                                      : "#"
                                  }
                                  style={{
                                    textDecoration: "none",
                                    outline: "none",
                                  }}
                                  onClick={(event) => {
                                    if (!item1?.assessment_type) {
                                      event.preventDefault(); // Stop the redirection
                                    } else if (item1?.event_status == -4) {
                                      event.preventDefault(); // Stop redirection if event is deleted
                                      toast.warn("Event is deleted");
                                    }
                                  }}
                                >
                                  <Grid
                                    item
                                    style={{
                                      paddingLeft: 10,
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "5px",
                                      cursor: "pointer",
                                    }}
                                  >
                                    <ActiveDot
                                      zIndex={1}
                                      size={8}
                                      color={
                                        assessment_status
                                          ? getColor(assessment_status)
                                          : item1?.erta_date
                                          ? getColor("eRTA")
                                          : null
                                      }
                                      tooltip={true}
                                      title={
                                        statusText[
                                          assessment_status
                                            ? assessment_status
                                            : item1?.erta_date
                                            ? "eRTA"
                                            : null
                                        ]
                                      }
                                    />
                                    <div>
                                      <Typography
                                        style={{
                                          textTransform: item1?.assessment_type
                                            ? "capitalize"
                                            : "none",
                                        }}
                                      >
                                        {item1?.assessment_type ||
                                          (item1?.erta_date ? "eRTA" : null)}
                                      </Typography>
                                    </div>
                                  </Grid>
                                </Link>
                              </Collapse>
                            ) : (
                              <Link
                                to={
                                  assessment_status === "pending"
                                    ? `/patient/details?patient_id=${EncDctFn(
                                        item?.patient_details?.patient_id,
                                        "encrypt"
                                      )}&event_id=${EncDctFn(
                                        item1?.event_id,
                                        "encrypt"
                                      )}&status=${
                                        item1?.assessment_status
                                      }&mtab=1`
                                    : `/patient/details?patient_id=${EncDctFn(
                                        item?.patient_details?.patient_id,
                                        "encrypt"
                                      )}&event_id=${EncDctFn(
                                        item1?.event_id,
                                        "encrypt"
                                      )}&assessment_id=${EncDctFn(
                                        item1?.assessment_id,
                                        "encrypt"
                                      )}&mtab=1`
                                }
                                style={{
                                  textDecoration: "none",
                                  outline: "none",
                                }}
                                onClick={() => {
                                  if (item1?.event_status == -4) {
                                    toast.warn("Event is deleted");
                                  }
                                }}
                              >
                                <Grid
                                  item
                                  style={{
                                    paddingLeft: 10,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    cursor: "pointer",
                                  }}
                                >
                                  <ActiveDot
                                    zIndex={1}
                                    size={8}
                                    color={getColor(assessment_status)}
                                  />
                                  <div>
                                    <Typography
                                      style={{ textTransform: "capitalize" }}
                                    >
                                      {item1?.assessment_type}
                                    </Typography>
                                  </div>
                                </Grid>
                              </Link>
                            );
                          })}
                        </Grid>
                        {value?.length - 1 !== index && (
                          <div style={{ width: "100%" }}>
                            <Divider
                              style={{
                                backgroundColor: color.lightBorder,
                                margin: "6px 0px",
                              }}
                            />
                          </div>
                        )}
                      </Grid>
                    );
                  }
                });
              }
            })
          )}
        </Grid>
      </Grid>
    );
  }

  // close calendar design
  function CloseCalender() {
    return (
      <Grid
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 10,
          textAlign: "center",
          height: "100%",
        }}
      >
        {/* top date diaplay */}
        <div className={className.tbRoundContainer}>
          <Button
            id="sideCalender"
            variant="contained"
            onClick={() => {
              if (from !== "patient") {
                setChecked(!checked);
                dispatch(setToggleDrawer(false));
              } else {
                handleClick("model");
              }
            }}
            className={className.roundDateIcon}
          >
            <Calendar fill={color.white} height={24} width={24} />
          </Button>
          <div style={{ height: "220px" }}>
            {Object.entries(status)?.map(([key, value]) => {
              const formateDate = moment(selectedDate).format("YYYY-MM-DD");
              const displayFormateDate = moment(
                selectedDate || new Date()
              ).format("ddd D");
              if (key === formateDate) {
                return (
                  <React.Fragment key={key}>
                    <Typography style={{ marginTop: 10 }}>
                      {displayFormateDate}
                    </Typography>
                    <div style={{ width: "100%" }}>
                      <Divider
                        style={{
                          backgroundColor: color.lightBorder,
                          margin: "10px 0px",
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "2px",
                        justifyContent: "center",
                      }}
                    >
                      {value?.statusArr?.map((item, index) => {
                        if (item) {
                          return (
                            <React.Fragment key={index}>
                              <ActiveDot
                                zIndex={1}
                                size={5}
                                color={
                                  item === "eRTA"
                                    ? getColor("eRTA")
                                    : getColor(item)
                                }
                                title={statusText[item]}
                                tooltip
                                arrow
                              />
                            </React.Fragment>
                          );
                        }
                      })}
                    </div>
                  </React.Fragment>
                );
              }
            })}
          </div>
        </div>

        {/* bottom patient list disaply */}
        <div
          className={className.tbRoundContainer}
          style={{
            marginTop: 10,
            height: "calc(100% - 300px)",
            overflow: "hidden",
          }}
        >
          <Button
            id="hamburger"
            variant="contained"
            onClick={() => {
              setChecked(!checked);
              dispatch(setToggleDrawer(false));
            }}
            className={className.roundDateIcon}
          >
            <img
              src={Images.Hamburger2}
              style={{ padding: 2 }}
              alt={"Humbugger"}
            />
          </Button>

          <div
            className={className.scrollBar}
            style={{
              height: "calc(100%)",
              paddingTop: 10,
            }}
          >
            {Object.entries(data).map(([key, value]) => {
              const formateDate = moment(selectedDate).format("YYYY-MM-DD");
              if (key === formateDate) {
                return value?.map((item, index) => {
                  return (
                    <Grid container key={index}>
                      {collapse ? (
                        <Tooltip
                          title={item?.patient_details?.name}
                          arrow
                          placement="left"
                          style={{ textTransform: "capitalize" }}
                        >
                          <div
                            style={{
                              width: "60px",
                              display: "flex",
                              padding: "2px 0px",
                            }}
                          >
                            <Typography
                              style={{
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                fontFamily: FontFamily.Regular,
                                textTransform: "capitalize",
                              }}
                            >
                              {item?.patient_details?.name}
                            </Typography>
                          </div>
                        </Tooltip>
                      ) : (
                        item?.events?.map((item1, index1) => {
                          if (item1?.assessment_status) {
                            return (
                              <Tooltip
                                key={index1}
                                title={item1?.assessment_type}
                                arrow
                                placement="left"
                                style={{ textTransform: "capitalize" }}
                              >
                                <Grid
                                  item
                                  style={{
                                    gap: "5px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                  }}
                                >
                                  <ActiveDot
                                    zIndex={1}
                                    size={8}
                                    color={getColor(item1?.assessment_status)}
                                  />
                                  <div
                                    style={{
                                      width: "50px",
                                      display: "flex",
                                    }}
                                  >
                                    <Typography
                                      style={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        fontFamily: FontFamily.Regular,
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {item1?.assessment_type}
                                    </Typography>
                                  </div>
                                </Grid>
                              </Tooltip>
                            );
                          }
                        })
                      )}
                      {value?.length - 1 !== index && (
                        <div style={{ width: "100%" }}>
                          <Divider
                            style={{
                              backgroundColor: color.lightBorder,
                              margin: "6px 0px",
                            }}
                          />
                        </div>
                      )}
                    </Grid>
                  );
                });
              }
            })}
          </div>
        </div>
      </Grid>
    );
  }

  return (
    <Grid
      style={{
        height: "100%",
        backgroundColor: color.white,
        borderRadius: 12,
        boxShadow: color.shadow,
        overflow: "hidden",
        flex: 1,
      }}
    >
      {isTablet || md ? (
        <Drawer open={open} anchor={"right"} onClose={() => handleClick()}>
          {OpenCalender()}
        </Drawer>
      ) : (
        <Collapse
          ref={calenderRef}
          in={checked}
          collapsedSize={85}
          orientation={"horizontal"}
          style={{ height: "100%", maxWidth: 320 }}
        >
          {!checked ? CloseCalender() : OpenCalender()}
        </Collapse>
      )}
    </Grid>
  );
}
