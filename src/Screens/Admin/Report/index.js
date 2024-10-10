import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { color } from "../../../Config/theme";
import BackBtn from "../../../Components/BackBtn";
import styles from "./styles";
import ColumnChart from "../../../Components/ColumnChart";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty, isNull } from "lodash";
import moment from "moment";
import MainLoader from "../../../Components/Loader/MainLoader";
import { KeyboardArrowDown } from "@mui/icons-material";
import {
  grouping,
  monthName,
  periodArr,
  quarterArr,
} from "../../../Config/Static_Data";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import DateIcon from "../../../Components/CustomIcon/Global/DOB";
import generate52Weeks from "../../../Utils/CommonFunctions";

export default function Reports() {
  const classes = styles();
  const navigate = useNavigate();
  const [pageLoad, setPageLoad] = useState(false);
  const [weeks, setWeeks] = useState([]);
  const [optionsCart_1, setOptionsChart_1] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false,
      },
    },
    xaxis: {},
    title: {
      text: "Active / Inactive patients",
      align: "center",
    },
    colors: [color.coralRed, color.green],
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "center",
        },
      },
    },
  });
  const [seriesChart_1, setSeriesChart_1] = useState([]);

  const [optionsChart_2, setOptionsChart_2] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false, // We will add our own export button
      },
    },
    xaxis: {
      categories: ["Apr", "May"],
    },
    title: {
      text: "Event Outcomes",
      align: "center",
    },
    colors: [
      color.coralRed,
      color.green,
      color.darkBerry,
      color.lightPink,
      color.primary,
    ],
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "center",
        },
      },
    },
  });
  const [seriesChart_2, setSeriesChart_2] = useState([]);

  const [optionsChart_3, setOptionsChart_3] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false, // We will add our own export button
      },
    },
    xaxis: {
      categories: ["Apr", "May", "Jun"],
    },
    title: {
      text: "First v excessive events over time",
      align: "center",
    },
    colors: [color.coralRed, color.green],
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "center",
        },
      },
    },
  });
  const [seriesChart_3, setSeriesChart_3] = useState([]);

  const [optionsChart_4, setOptionsChart_4] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false, // We will add our own export button
      },
    },
    xaxis: {},
    title: {
      text: "Open Events by RTA Stage",
      align: "center",
    },
    colors: [
      color.coralRed,
      color.green,
      color.darkBerry,
      color.lightPink,
      color.primary,
      color.chocolateBrown,
    ],
    dataLabels: {
      enabled: true,
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "center",
        },
      },
    },
  });
  const [seriesChart_4, setSeriesChart_4] = useState([]);

  const [optionsChart_5, setOptionsChart_5] = useState({
    chart: {
      id: "basic-bar",
      toolbar: {
        show: false, // We will add our own export button
      },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {},
    title: {
      text: "Assessments per patients with injury event",
      align: "center",
    },
    colors: [color.green],
    dataLabels: {
      enabled: true,
    },

    plotOptions: {
      bar: {
        borderRadius: 4,
        dataLabels: {
          position: "center",
        },
      },
    },
  });
  const [seriesChart_5, setSeriesChart_5] = useState([]);

  const [groupingData, setGroupingData] = useState("");
  const [period, setPeriod] = useState("this_year");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const initialWeeks = generate52Weeks(period);
    setWeeks(initialWeeks);
    if (["today", "yesterday"].includes(period)) {
      setGroupingData("day");
    } else {
      setGroupingData("month");
    }
    if (period === "custom_date") {
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [period]);

  useEffect(() => {
    if (groupingData === "quarter") {
      getChartData("quarter");
    } else if (groupingData === "year") {
      getChartData("YYYY");
    } else if (groupingData === "day") {
      getChartData("MM/DD");
    } else if (groupingData === "week") {
      getChartData("week");
    } else {
      getChartData("MMM");
    }
  }, [groupingData, startDate, endDate, period]);

  const findWeek = (date) => {
    const startOfMonth = moment(date).startOf("month");
    const currentWeek = moment(date).week();
    const startOfMonthWeek = startOfMonth.week();
    let weekInMonth = currentWeek - startOfMonthWeek + 1;
    // Handle the case where the start of the month is in the previous year
    if (startOfMonth.year() !== moment(date).year()) {
      weekInMonth = currentWeek;
    }
    const startOfQuarter = moment(date).startOf("quarter");
    const startOfQuarterWeek = startOfQuarter.week();
    let weekInQuarter = currentWeek - startOfQuarterWeek + 1;
    // Handle the case where the start of the quarter is in the previous year
    if (startOfQuarter.year() !== moment(date).year()) {
      weekInQuarter = currentWeek;
    }
    const week = moment(date).week();
    if (period === "this_month" || period === "last_month") {
      return "Week-" + weekInMonth;
    } else if (period === "this_quarter" || period === "last_quarter") {
      return "Week-" + weekInQuarter;
    } else if (period === "last_week" || period === "this_week") {
      return period === "last_week" ? "Last Week" : "Current Week";
    } else {
      return "Week-" + week;
    }
  };

  // find xAxis label
  function xAxisLabel(data, type) {
    const monthNumber = moment(data).month() + 2;
    const item =
      type === "week"
        ? findWeek(data)
        : type === "quarter"
        ? moment(data).startOf(type).format("MMM") +
          "-" +
          monthName[monthNumber]
        : moment(data).format(`${type}`);
    return item;
  }

  // this function is used to get chart data
  async function getChartData(type) {
    setPageLoad(true);
    const data = {
      grouping:
        period === "today" || period === "yesterday"
          ? "day"
          : groupingData || "month",
      period: period || "this_year",
    };
    if (period === "custom_date") {
      data["start_date"] = startDate;
      data["end_date"] = endDate;
    }
    try {
      const response = await getApiData(
        `${Setting.endpoints.getChartData}`,
        "POST",
        data
      );
      if (response?.status) {
        const active = [];
        const inactive = [];
        const categories1 = [];
        if (isArray(response?.data?.chart_1)) {
          if (type === "MMM") {
            monthName?.map((item1) => {
              let same = false;
              response?.data?.chart_1?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  active.push(item?.has_event);
                  inactive.push(item?.no_event);
                  categories1.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                active.push(0);
                inactive.push(0);
                categories1.push(item1);
              }
            });
          } else if (
            type === "week" &&
            (period !== "this_week" || period !== "last_week")
          ) {
            weeks?.map((item1) => {
              let same = false;
              response?.data?.chart_1?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  active.push(item?.has_event);
                  inactive.push(item?.no_event);
                  categories1.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                active.push(0);
                inactive.push(0);
                categories1.push(item1);
              }
            });
          } else if (type === "quarter") {
            quarterArr?.map((item1) => {
              let same = false;
              response?.data?.chart_1?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  active.push(item?.has_event);
                  inactive.push(item?.no_event);
                  categories1.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                active.push(0);
                inactive.push(0);
                categories1.push(item1);
              }
            });
          } else {
            response?.data?.chart_1?.forEach((item) => {
              active.push(item?.has_event);
              inactive.push(item?.no_event);
              categories1.push(xAxisLabel(item?.grouping, type));
            });
          }
          setSeriesChart_1([
            {
              name: "active",
              data: active,
            },
            {
              name: "inactive",
              data: inactive,
            },
          ]);
          setOptionsChart_1((prevOptions) => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories1,
            },
          }));
        }

        // event outcomes chart
        const lost_follow_up = [];
        const recovered_returned = [];
        const recovered_not_returned = [];
        const provider_referral = [];
        const other = [];
        const categories2 = [];
        if (isArray(response?.data?.chart_2)) {
          if (type === "MMM") {
            monthName?.map((item1) => {
              let same = false;
              response?.data?.chart_2?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  lost_follow_up.push(item?.lost_follow_up);
                  recovered_returned.push(item?.recoverd_returned);
                  recovered_not_returned.push(item?.recoverd_not_returned);
                  provider_referral.push(item?.provider_referral);
                  other.push(item?.other);
                  categories2.push(item1);
                }
              });
              if (!same) {
                lost_follow_up.push(0);
                recovered_returned.push(0);
                recovered_not_returned.push(0);
                provider_referral.push(0);
                other.push(0);
                categories2.push(item1);
              }
            });
          } else if (type === "week") {
            weeks?.map((item1) => {
              let same = false;
              response?.data?.chart_2?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  lost_follow_up.push(item?.lost_follow_up);
                  recovered_returned.push(item?.recoverd_returned);
                  recovered_not_returned.push(item?.recoverd_not_returned);
                  provider_referral.push(item?.provider_referral);
                  other.push(item?.other);
                  categories2.push(item1);
                }
              });
              if (!same) {
                lost_follow_up.push(0);
                recovered_returned.push(0);
                recovered_not_returned.push(0);
                provider_referral.push(0);
                other.push(0);
                categories2.push(item1);
              }
            });
          } else if (type === "quarter") {
            quarterArr?.map((item1) => {
              let same = false;
              response?.data?.chart_2?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  lost_follow_up.push(item?.lost_follow_up);
                  recovered_returned.push(item?.recoverd_returned);
                  recovered_not_returned.push(item?.recoverd_not_returned);
                  provider_referral.push(item?.provider_referral);
                  other.push(item?.other);
                  categories2.push(item1);
                }
              });
              if (!same) {
                lost_follow_up.push(0);
                recovered_returned.push(0);
                recovered_not_returned.push(0);
                provider_referral.push(0);
                other.push(0);
                categories2.push(item1);
              }
            });
          } else {
            response?.data?.chart_2?.forEach((item) => {
              lost_follow_up.push(item?.lost_follow_up);
              recovered_returned.push(item?.recoverd_returned);
              recovered_not_returned.push(item?.recoverd_not_returned);
              provider_referral.push(item?.provider_referral);
              other.push(item?.other);
              categories2.push(xAxisLabel(item?.grouping, type));
            });
          }

          setSeriesChart_2([
            {
              name: "Recovered RTA",
              data: recovered_returned,
            },
            {
              name: "Recovered not RTA",
              data: recovered_not_returned,
            },
            {
              name: "LTF",
              data: lost_follow_up,
            },
            {
              name: "PR",
              data: provider_referral,
            },
            {
              name: "Other",
              data: other,
            },
          ]);
          setOptionsChart_2((prevOptions) => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories2,
            },
          }));
        }

        // chart_3
        const multiple_event_patients = [];
        const single_event_patients = [];
        const categories3 = [];
        if (isArray(response?.data?.chart_3)) {
          if (type === "MMM") {
            monthName?.map((item1) => {
              let same = false;
              response?.data?.chart_3?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  multiple_event_patients.push(item?.multiple_event_patients);
                  single_event_patients.push(item?.single_event_patients);
                  categories3.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                multiple_event_patients.push(0);
                single_event_patients.push(0);
                categories3.push(item1);
              }
            });
          } else if (type === "week") {
            weeks?.map((item1) => {
              let same = false;
              response?.data?.chart_3?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  multiple_event_patients.push(item?.multiple_event_patients);
                  single_event_patients.push(item?.single_event_patients);
                  categories3.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                multiple_event_patients.push(0);
                single_event_patients.push(0);
                categories3.push(item1);
              }
            });
          } else if (type === "quarter") {
            quarterArr?.map((item1) => {
              let same = false;
              response?.data?.chart_3?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  multiple_event_patients.push(item?.multiple_event_patients);
                  single_event_patients.push(item?.single_event_patients);
                  categories3.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                multiple_event_patients.push(0);
                single_event_patients.push(0);
                categories3.push(item1);
              }
            });
          } else {
            response?.data?.chart_3?.forEach((item) => {
              multiple_event_patients.push(item?.multiple_event_patients);
              single_event_patients.push(item?.single_event_patients);
              categories3.push(xAxisLabel(item?.grouping, type));
            });
          }
          setSeriesChart_3([
            {
              name: "First Event",
              data: multiple_event_patients,
            },
            {
              name: "Second Event or Greater",
              data: single_event_patients,
            },
          ]);
          setOptionsChart_3((prevOptions) => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories3,
            },
          }));
        }

        // open event chart_4
        const relative_rest = [];
        const symptom_limited_activity = [];
        const light_activity = [];
        const moderate_activity = [];
        const intense_activity = [];
        const return_to_activity = [];
        const categories4 = [];
        if (isArray(response?.data?.chart_4)) {
          if (type === "MMM") {
            monthName?.map((item1) => {
              let same = false;
              response?.data?.chart_4?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  relative_rest.push(item?.relative_rest);
                  symptom_limited_activity.push(item?.symptom_limited_activity);
                  light_activity.push(item?.light_activity);
                  moderate_activity.push(item?.moderate_activity);
                  intense_activity.push(item?.intense_activity);
                  return_to_activity.push(item?.return_to_activity);
                  categories4.push(xAxisLabel(item?.grouping, type));
                }
              });

              if (!same) {
                relative_rest.push(0);
                symptom_limited_activity.push(0);
                light_activity.push(0);
                moderate_activity.push(0);
                intense_activity.push(0);
                return_to_activity.push(0);
                categories4.push(item1);
              }
            });
          } else if (type === "week") {
            weeks?.map((item1) => {
              let same = false;
              response?.data?.chart_4?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  relative_rest.push(item?.relative_rest);
                  symptom_limited_activity.push(item?.symptom_limited_activity);
                  light_activity.push(item?.light_activity);
                  moderate_activity.push(item?.moderate_activity);
                  intense_activity.push(item?.intense_activity);
                  return_to_activity.push(item?.return_to_activity);
                  categories4.push(xAxisLabel(item?.grouping, type));
                }
              });

              if (!same) {
                relative_rest.push(0);
                symptom_limited_activity.push(0);
                light_activity.push(0);
                moderate_activity.push(0);
                intense_activity.push(0);
                return_to_activity.push(0);
                categories4.push(item1);
              }
            });
          } else if (type === "quarter") {
            quarterArr?.map((item1) => {
              let same = false;
              response?.data?.chart_4?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  relative_rest.push(item?.relative_rest);
                  symptom_limited_activity.push(item?.symptom_limited_activity);
                  light_activity.push(item?.light_activity);
                  moderate_activity.push(item?.moderate_activity);
                  intense_activity.push(item?.intense_activity);
                  return_to_activity.push(item?.return_to_activity);
                  categories4.push(xAxisLabel(item?.grouping, type));
                }
              });

              if (!same) {
                relative_rest.push(0);
                symptom_limited_activity.push(0);
                light_activity.push(0);
                moderate_activity.push(0);
                intense_activity.push(0);
                return_to_activity.push(0);
                categories4.push(item1);
              }
            });
          } else {
            response?.data?.chart_4?.forEach((item) => {
              relative_rest.push(item?.relative_rest);
              symptom_limited_activity.push(item?.symptom_limited_activity);
              light_activity.push(item?.light_activity);
              moderate_activity.push(item?.moderate_activity);
              intense_activity.push(item?.intense_activity);
              return_to_activity.push(item?.return_to_activity);
              categories4.push(xAxisLabel(item?.grouping, type));
            });
          }
          setSeriesChart_4([
            {
              name: "RR",
              data: relative_rest,
            },
            {
              name: "SL",
              data: symptom_limited_activity,
            },
            {
              name: "Light",
              data: light_activity,
            },
            {
              name: "Moderate",
              data: moderate_activity,
            },
            {
              name: "Intense",
              data: intense_activity,
            },
            {
              name: "RTA",
              data: return_to_activity,
            },
          ]);
          setOptionsChart_4((prevOptions) => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories4,
            },
          }));
        }

        // chart_5
        const avg_ratio = [];
        const categories5 = [];
        if (isArray(response?.data?.chart_5)) {
          if (type === "MMM") {
            monthName?.map((item1) => {
              let same = false;
              response?.data?.chart_5?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  avg_ratio.push(item?.avg_ratio);
                  categories5.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                avg_ratio.push(0);
                categories5.push(item1);
              }
            });
          } else if (type === "week") {
            weeks?.map((item1) => {
              let same = false;
              response?.data?.chart_5?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  avg_ratio.push(item?.avg_ratio);
                  categories5.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                avg_ratio.push(0);
                categories5.push(item1);
              }
            });
          } else if (type === "quarter") {
            quarterArr?.map((item1) => {
              let same = false;
              response?.data?.chart_5?.forEach((item) => {
                if (item1 === xAxisLabel(item?.grouping, type)) {
                  same = true;
                  avg_ratio.push(item?.avg_ratio);
                  categories5.push(xAxisLabel(item?.grouping, type));
                }
              });
              if (!same) {
                avg_ratio.push(0);
                categories5.push(item1);
              }
            });
          } else {
            response?.data?.chart_5?.forEach((item) => {
              avg_ratio.push(item?.avg_ratio);
              categories5.push(xAxisLabel(item?.grouping, type));
            });
          }
          setSeriesChart_5([
            {
              name: "Recovered RTA",
              data: avg_ratio,
            },
          ]);
          setOptionsChart_5((prevOptions) => ({
            ...prevOptions,
            xaxis: {
              ...prevOptions.xaxis,
              categories: categories5,
            },
          }));
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error =======>>>", error);
      toast.error(error.toString());
    } finally {
      setPageLoad(false);
    }
  }

  function clear() {
    setPeriod("this_year");
    setGroupingData("month");
    setStartDate(null);
    setEndDate(null);
  }

  return (
    <Grid className={classes.container}>
      <div className={classes.gridContainer}>
        <Grid
          container
          display={"flex"}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <BackBtn handleClick={() => navigate(-1)} />
            <Typography variant="title" style={{ color: color.primary }}>
              Reports
            </Typography>
          </div>
        </Grid>
        <Grid container gap={2}>
          {/* period dropdown */}
          <Grid item>
            <Select
              fullWidth
              displayEmpty
              value={period}
              onChange={(e) => {
                setPeriod(e.target.value);
                setGroupingData("");
              }}
              style={{
                color: isEmpty(period) ? color.placeholder : "",
                minWidth: "200px",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "40vh",
                  },
                },
              }}
              IconComponent={KeyboardArrowDown}
            >
              <MenuItem value={""} disabled hidden selected>
                Select period
              </MenuItem>
              {periodArr.map((item, index) => {
                {
                  return (
                    <MenuItem key={index} value={item?.value}>
                      {item?.label}
                    </MenuItem>
                  );
                }
              })}
            </Select>
          </Grid>
          {/* groupingData dropdown  */}
          <Grid item>
            <Select
              fullWidth
              displayEmpty
              value={groupingData}
              onChange={(e) => {
                setGroupingData(e.target.value);
              }}
              style={{
                color: isEmpty(groupingData) ? color.placeholder : "",
                minWidth: "200px",
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: "40vh",
                  },
                },
              }}
              IconComponent={KeyboardArrowDown}
            >
              <MenuItem
                value={["today", "yesterday"].includes(period) ? "day" : ""}
                disabled
                hidden
                selected
              >
                Select grouping
              </MenuItem>
              {grouping.map((item, index) => {
                if (
                  ["today", "yesterday"].includes(period) &&
                  item?.value !== "day"
                ) {
                  return null;
                } else if (
                  period !== "this_year" &&
                  period !== "last_year" &&
                  item?.value === "quarter"
                ) {
                  return null;
                } else if (
                  (period === "this_week" || period === "last_week") &&
                  item?.value === "week"
                ) {
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
          </Grid>
          {/* range date picker */}
          {period === "custom_date" && (
            <Grid display={"flex"} alignItems="center" gap={"5px"}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 22,
                    },
                    "& .MuiIconButton-root:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  fullWidth
                  showToolbar={false}
                  disableFuture
                  value={startDate}
                  views={["year", "month", "day"]}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                  }}
                  slots={{
                    toolbar: "hidden",
                    openPickerIcon: () => (
                      <DateIcon height={20} width={20} fill={color.primary} />
                    ),
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps,
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
              <Typography>To</Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 22,
                    },
                    "& .MuiIconButton-root:hover": {
                      backgroundColor: "transparent",
                    },
                  }}
                  InputProps={{
                    disableUnderline: true,
                  }}
                  fullWidth
                  showToolbar={false}
                  disableFuture
                  disabled={isNull(startDate) ? true : false}
                  value={endDate}
                  views={["year", "month", "day"]}
                  onChange={(newValue) => {
                    setEndDate(newValue);
                  }}
                  slots={{
                    toolbar: "hidden",
                    openPickerIcon: () => (
                      <DateIcon
                        height={20}
                        width={20}
                        fill={
                          isNull(startDate) ? color.placeholder : color.primary
                        }
                      />
                    ),
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps,
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
          )}
          <Button
            variant="contained"
            style={{ minWidth: 100 }}
            onClick={() => {
              clear();
            }}
          >
            Reset
          </Button>
        </Grid>

        {pageLoad ? (
          <Grid
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"center"}
            style={{ height: window.innerHeight - 100 }}
          >
            <MainLoader />
          </Grid>
        ) : (
          <Grid container justifyContent={"space-around"} gap={2}>
            <div className={classes.scrollBar}>
              <Grid item xs={12} lg={5} justifyContent={"center"}>
                <ColumnChart
                  options={optionsCart_1}
                  series={seriesChart_1}
                  width={
                    seriesChart_1[0]?.data?.length * 30 > 600
                      ? `${seriesChart_1[0]?.data?.length * 30}`
                      : "600"
                  }
                />
              </Grid>
            </div>
            <div className={classes.scrollBar}>
              <Grid item xs={12} lg={5} justifyContent={"center"}>
                <ColumnChart
                  options={optionsChart_2}
                  series={seriesChart_2}
                  width={
                    seriesChart_2[0]?.data?.length * 30 > 600
                      ? `${seriesChart_2[0]?.data?.length * 30}`
                      : "600"
                  }
                />
              </Grid>
            </div>
            <div className={classes.scrollBar}>
              <Grid item xs={12} lg={5} justifyContent={"center"}>
                <ColumnChart
                  options={optionsChart_3}
                  series={seriesChart_3}
                  width={
                    seriesChart_3[0]?.data?.length * 30 > 600
                      ? `${seriesChart_3[0]?.data?.length * 30}`
                      : "600"
                  }
                />
              </Grid>
            </div>

            <div className={classes.scrollBar}>
              <Grid item xs={12} lg={5} justifyContent={"center"}>
                <ColumnChart
                  options={optionsChart_4}
                  series={seriesChart_4}
                  width={
                    seriesChart_4[0]?.data?.length * 30 > 600
                      ? `${seriesChart_4[0]?.data?.length * 30}`
                      : "600"
                  }
                />
              </Grid>
            </div>
            <div className={classes.scrollBar}>
              <Grid item xs={12} justifyContent={"center"}>
                <ColumnChart
                  options={optionsChart_5}
                  series={seriesChart_5}
                  type={"line"}
                  width={
                    seriesChart_5[0]?.data?.length * 30 > 600
                      ? `${seriesChart_5[0]?.data?.length * 30}`
                      : "600"
                  }
                />
              </Grid>
            </div>
          </Grid>
        )}
      </div>
    </Grid>
  );
}
