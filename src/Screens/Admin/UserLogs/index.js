import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty, isNull, isObject } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import moment from "moment";
import { useSelector } from "react-redux";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import MainLoader from "../../../Components/Loader/MainLoader";
import { KeyboardArrowDown } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { logsType, logsValue, roleArr } from "../../../Config/Static_Data";
import { findRole } from "../../../Utils/CommonFunctions";
import DateIcon from "../../../Components/CustomIcon/Global/DOB";

export default function UserLogs() {
  const classes = styles();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [loader, setLoader] = useState(false);
  const { userType } = useSelector((state) => state.auth);

  // change tab
  const [logListArr, setLogListArr] = useState([]);
  const [pageNo, setPageNo] = useState(
    searchParams.has("page")
      ? Number(EncDctFn(searchParams.get("page"), "decrypt"))
      : 1
  );

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [changedByUser, setChangedByUser] = useState(
    searchParams.has("changed_by_username")
      ? EncDctFn(searchParams.get("changed_by_username"), "decrypt")
      : ""
  );
  const [appliedUser, setAppliedUser] = useState(
    searchParams.has("applied_by_username")
      ? EncDctFn(searchParams.get("applied_by_username"), "decrypt")
      : ""
  );
  const [changedByRole, setChangedByRole] = useState(
    searchParams.has("changed_by_role")
      ? EncDctFn(searchParams.get("changed_by_role"), "decrypt")
      : ""
  );
  const [appliedRole, setAppliedRole] = useState(
    searchParams.has("applied_by_role")
      ? EncDctFn(searchParams.get("applied_by_role"), "decrypt")
      : ""
  );
  const [logType, setLogType] = useState(
    searchParams.has("log_type")
      ? EncDctFn(searchParams.get("log_type"), "decrypt")
      : ""
  );

  const logsColumn = [
    {
      field: "sr_no",
      headerName: "Sr. No.",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        const index = pageNo === 1 ? ind : (pageNo - 1) * 16 + ind;
        return <Typography>{index}</Typography>;
      },
    },
    {
      field: "changed_by",
      headerName: "Changed By (Username)",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {params?.row?.changed_by || "-"}
          </Typography>
        );
      },
    },
    {
      field: "user_name",
      headerName: "Applied to (Username)",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {params?.row?.user_name || "-"}
          </Typography>
        );
      },
    },

    {
      field: "description",
      headerName: "Description",
      sortable: false,
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.description || "-"}</Typography>;
      },
    },
    {
      field: "changed_by_role",
      headerName: "Changed By (Role)",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {findRole(params?.row?.changed_by_role) || "-"}
          </Typography>
        );
      },
    },
    {
      field: "user_name_role",
      headerName: "Applied to (Role)",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {findRole(params?.row?.user_name_role) || "-"}
          </Typography>
        );
      },
    },
    {
      field: "log_group",
      headerName: "Log Type",
      sortable: false,
      minWidth: 200,
      renderCell: (params) => {
        return (
          <Typography>{logsValue[params?.row?.log_group] || "-"}</Typography>
        );
      },
    },
    {
      field: "time",
      headerName: "Time",
      sortable: false,
      minWidth: 160,
      renderCell: (params) => {
        let time;
        if (!isNull(params?.row?.time) || !isEmpty(params?.row?.time)) {
          time = params?.row?.time;
        }
        return time || "-";
      },
    },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!isEmpty(changedByUser)) {
        setPageNo(1);
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            changed_by_username: EncDctFn(changedByUser, "encrypt"),
          },
          { replace: true }
        );
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [changedByUser]);
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!isEmpty(appliedUser)) {
        setPageNo(1);
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            applied_by_username: EncDctFn(appliedUser, "encrypt"),
          },
          { replace: true }
        );
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [appliedUser]);

  useEffect(() => {
    if (searchParams.has("page")) {
      setPageNo(Number(EncDctFn(searchParams.get("page"), "decrypt")));
    }
    if (searchParams.has("changed_by_username")) {
      setChangedByUser(
        EncDctFn(searchParams.get("changed_by_username"), "decrypt")
      );
    }
    if (searchParams.has("applied_by_username")) {
      setAppliedUser(
        EncDctFn(searchParams.get("applied_by_username"), "decrypt")
      );
    }
    if (searchParams.has("changed_by_role")) {
      setChangedByRole(
        EncDctFn(searchParams.get("changed_by_role"), "decrypt")
      );
    }
    if (searchParams.has("applied_by_role")) {
      setAppliedRole(EncDctFn(searchParams.get("applied_by_role"), "decrypt"));
    }
    if (searchParams.has("log_type")) {
      setLogType(EncDctFn(searchParams.get("log_type"), "decrypt"));
    }
    logList(false);
  }, [searchParams, endDate, startDate]);

  async function logList(bool) {
    !bool && setLoader(true);
    const fromDate = !isNull(startDate)
      ? moment(startDate).format("YYYY-MM-DD")
      : "";
    const toDate = !isNull(endDate) ? moment(endDate).format("YYYY-MM-DD") : "";
    try {
      const response = await getApiData(
        `${Setting.endpoints.logsList}`,
        "POST",
        {
          page: pageNo,
          start_date: fromDate,
          end_date: toDate,
          user_search: appliedUser,
          changed_by_search: changedByUser,
          changed_by_role_search: changedByRole,
          user_role_search: appliedRole,
          log_type: logType,
        },
        true
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setLogListArr(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setLoader(false);
    }
  }

  function resetData() {
    setSearchParams({}, { replace: true });
    setPageNo(1);
    setStartDate(null);
    setEndDate(null);
    setChangedByUser("");
    setAppliedUser("");
    setChangedByRole("");
    setAppliedRole("");
    setLogType("");
  }

  const DataGridRender = useMemo(() => {
    return (
      <DataGrid
        rows={logListArr?.getList}
        columns={logsColumn}
        getRowId={logListArr?.getList?.id}
        disableColumnMenu
        hideFooter
        showCellRightBorder
        disableSelectionOnClick
        showColumnRightBorder
        autoHeight={true}
        getRowHeight={() => "auto"}
        scrollbarSize={2}
        showCellVerticalBorder
        // hide column
        initialState={{
          columns: {
            columnVisibilityModel: {
              organisation: userType === "super_admin",
            },
          },
        }}
      />
    );
  }, [logListArr]);

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
              User Logs
            </Typography>
          </div>
        </Grid>
        <Grid
          container
          style={{ marginTop: 10, alignItems: "center" }}
          gap={"10px"}
        >
          {/* changed by username */}
          <TextField
            placeholder="Changed By (Username)"
            label="Changed By (Username)"
            value={changedByUser}
            onChange={(e) => {
              let value = e.target.value;
              if (value.startsWith(" ")) {
                value = value.trimStart();
              }
              setChangedByUser(value);
              if (isEmpty(value)) {
                setPageNo(1);
                delete queryParams.changed_by_username;
                setSearchParams(
                  { ...queryParams, page: EncDctFn(1, "encrypt") },
                  { replace: true }
                );
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }}
          />
          {/* applied to username */}
          <TextField
            placeholder="Applied to (Username)"
            label="Applied to (Username)"
            value={appliedUser}
            onChange={(e) => {
              let value = e.target.value;
              if (value.startsWith(" ")) {
                value = value.trimStart();
              }
              setAppliedUser(value);
              if (isEmpty(value)) {
                setPageNo(1);
                delete queryParams.applied_by_username;
                setSearchParams(
                  {
                    ...queryParams,
                    page: EncDctFn(1, "encrypt"),
                  },
                  { replace: true }
                );
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"></InputAdornment>
              ),
            }}
          />
          {/* changed by role */}
          <Select
            displayEmpty
            value={changedByRole || ""}
            onChange={(e) => {
              setPageNo(1);
              setChangedByRole(e.target.value);
              setSearchParams(
                {
                  ...queryParams,
                  page: EncDctFn(1, "encrypt"),
                  changed_by_role: EncDctFn(e.target.value, "encrypt"),
                },
                { replace: true }
              );
            }}
            style={{
              color: isEmpty(changedByRole) ? color.placeholder : "",
            }}
            IconComponent={!changedByRole && KeyboardArrowDown}
            endAdornment={
              <IconButton
                sx={{
                  display: changedByRole ? "visible" : "none",
                  padding: 0,
                }}
                onClick={() => {
                  setChangedByRole("");
                  setPageNo(1);
                  delete queryParams.changed_by_role;
                  setSearchParams(
                    {
                      ...queryParams,
                      page: EncDctFn(1, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
              >
                <ClearIcon />
              </IconButton>
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: "40vh",
                },
              },
            }}
          >
            <MenuItem value={""} disabled hidden selected>
              Select Changed By (Role)
            </MenuItem>
            {!isEmpty(roleArr) &&
              isArray(roleArr) &&
              roleArr.map((item, index) => {
                if (
                  userType !== "super_admin" &&
                  item?.role_slug === "super_admin"
                ) {
                  return null;
                } else {
                  return (
                    <MenuItem key={index} value={item?.role_slug}>
                      {item?.name}
                    </MenuItem>
                  );
                }
              })}
          </Select>

          {/* applied to role */}
          <Select
            displayEmpty
            value={appliedRole || ""}
            onChange={(e) => {
              setAppliedRole(e.target.value);
              setPageNo(1);
              setSearchParams(
                {
                  ...queryParams,
                  page: EncDctFn(1, "encrypt"),
                  applied_by_role: EncDctFn(e.target.value, "encrypt"),
                },
                { replace: true }
              );
            }}
            endAdornment={
              <IconButton
                sx={{
                  display: appliedRole ? "visible" : "none",
                  padding: 0,
                }}
                onClick={() => {
                  setAppliedRole("");
                  setPageNo(1);
                  delete queryParams.applied_by_role;
                  setSearchParams(
                    {
                      ...queryParams,
                      page: EncDctFn(1, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
              >
                <ClearIcon />
              </IconButton>
            }
            style={{
              color: isEmpty(appliedRole) ? color.placeholder : "",
            }}
            IconComponent={!appliedRole && KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: "40vh",
                },
              },
            }}
          >
            <MenuItem value={""} disabled hidden selected>
              Select Applied to (Role)
            </MenuItem>
            {!isEmpty(roleArr) &&
              isArray(roleArr) &&
              roleArr.map((item, index) => {
                if (
                  userType !== "super_admin" &&
                  item?.role_slug === "super_admin"
                ) {
                  return null;
                } else {
                  return (
                    <MenuItem key={index} value={item?.role_slug}>
                      {item?.name}
                    </MenuItem>
                  );
                }
              })}
          </Select>

          {/* date picker */}
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
                DialogProps={{ className: classes.datePicker }}
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
                  setPageNo(1);
                  setSearchParams(
                    { ...queryParams, page: EncDctFn(1, "encrypt") },
                    { replace: true }
                  );
                  setEndDate(newValue);
                }}
                DialogProps={{ className: classes.datePicker }}
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

          {/* log type */}
          <Select
            displayEmpty
            value={logType || ""}
            onChange={(e) => {
              setPageNo(1);
              setLogType(e.target.value);
              setSearchParams(
                {
                  ...queryParams,
                  page: EncDctFn(1, "encrypt"),
                  log_type: EncDctFn(e.target.value, "encrypt"),
                },
                { replace: true }
              );
            }}
            style={{
              color: isEmpty(logType) ? color.placeholder : "",
            }}
            IconComponent={!logType && KeyboardArrowDown}
            endAdornment={
              <IconButton
                sx={{
                  display: logType ? "visible" : "none",
                  padding: 0,
                }}
                onClick={() => {
                  setLogType("");
                  setPageNo(1);
                  delete queryParams.log_type;
                  setSearchParams(
                    {
                      ...queryParams,
                      page: EncDctFn(1, "encrypt"),
                    },
                    { replace: true }
                  );
                }}
              >
                <ClearIcon />
              </IconButton>
            }
            MenuProps={{
              PaperProps: {
                style: {
                  maxHeight: "40vh",
                },
              },
            }}
          >
            <MenuItem value={""} disabled hidden selected>
              Select Log type
            </MenuItem>
            {!isEmpty(logsType) &&
              isArray(logsType) &&
              logsType.map((item, index) => {
                return (
                  <MenuItem key={index} value={item?.value}>
                    {item?.label}
                  </MenuItem>
                );
              })}
          </Select>

          <Grid display={"flex"} alignItems="center" gap={"10px"}>
            <Button
              variant="contained"
              disabled={
                isNull(startDate) &&
                isEmpty(changedByUser) &&
                isEmpty(appliedUser) &&
                isEmpty(changedByRole) &&
                isEmpty(appliedRole) &&
                isEmpty(logType)
              }
              onClick={() => {
                resetData();
              }}
              sx={{
                minWidth: 100,
                borderRadius: "12px !important",
              }}
            >
              Reset
            </Button>
          </Grid>
        </Grid>
        {loader ? (
          <Grid
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"center"}
            style={{ height: 500 }}
          >
            <MainLoader />
          </Grid>
        ) : !isEmpty(logListArr?.getList) ? (
          <>
            <div style={{ margin: "20px 0px" }}>{DataGridRender}</div>
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <Pagination
                count={Math.ceil(logListArr?.pagination?.totalPage)}
                defaultPage={pageNo}
                color="primary"
                onChange={(v, e) => {
                  setPageNo(e);
                  setSearchParams(
                    { ...queryParams, page: EncDctFn(e, "encrypt") },
                    { replace: true }
                  );
                }}
              />
            </div>
          </>
        ) : (
          <NoData />
        )}
      </div>
    </Grid>
  );
}
