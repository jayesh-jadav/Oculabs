import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import { color } from "../../Config/theme";
import styles from "./styles";
import PatientCard from "../../Components/PatientCard";
import { Link, useSearchParams } from "react-router-dom";
import { isArray, isEmpty, isNumber } from "lodash";
import NoData from "../../Components/NoData";
import { isTablet } from "react-device-detect";
import Search from "../../Components/CustomIcon/Global/Search";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { KeyboardArrowDown } from "@mui/icons-material";
import MainLoader from "../../Components/Loader/MainLoader";
import { EncDctFn } from "../../Utils/EncDctFn";
import ClearIcon from "@mui/icons-material/Clear";
import Info from "../../Components/CustomIcon/Global/Info";
import CModal from "../../Components/Modal/CModal";
import CloseEventConfirm from "../../Components/Modal/CloseEventConfirm";
import { CTypography } from "../../Components/CTypography";
import { reasonToClose, referral } from "../../Config/Static_Data";

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
};

function Patient(props) {
  const { from = "", handleClick = () => null } = props;
  const className = styles();

  const {
    userData,
    isActivePatient,
    isToggleDrawer,
    userType,
    onlinePatients,
  } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [searchFilter, setSearchFilter] = useState(
    searchParams.has("search")
      ? EncDctFn(searchParams.get("search"), "decrypt")
      : ""
  );
  const [status, setStatus] = useState(
    searchParams.has("status")
      ? EncDctFn(searchParams.get("status"), "decrypt")
      : ""
  );

  const [loader, setLoader] = useState(true);
  const [paginationLoad, setPaginationLoad] = useState(false);
  const [patientList, setPatientList] = useState([]);
  const [updatedArr, setUpdatedArr] = useState([]);
  const [updatedArr1, setUpdatedArr1] = useState([]);
  const [patientList1, setPatientList1] = useState([]);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const containerRef = useRef();

  const [provider, setProvider] = useState(null);
  const [providerList, setProvidersList] = useState([]);
  const [providerId, setProviderId] = useState(
    searchParams.has("providerId")
      ? EncDctFn(searchParams.get("providerId"), "decrypt")
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

  const [merge, setMerge] = useState({
    mergeIds: [],
    openEvent: false,
    closeEvent: false,
    data: [],
  });

  //close event state
  const [errObj, setErrObj] = useState(errorObj);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredText, setReferredText] = useState("");
  const [referredReason, setReferredReason] = useState("");
  const [other, setOther] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);
  const [onlinePatient, setOnlinePatient] = useState({});

  // this function is used for search patient data
  useEffect(() => {
    if (userType !== "super_admin") {
      onlinePatientList();
    }
    const delayDebounceFn = setTimeout(() => {
      if (!isEmpty(searchFilter)) {
        setPatientList1([]);
        setPage(1);
        setSearchParams(
          {
            ...queryParams,
            search: EncDctFn(searchFilter, "encrypt"),
          },
          { replace: true }
        );
      } else {
        setPage(1);
        if (searchParams.has("search")) {
          delete queryParams.search;
          setSearchParams({ ...queryParams }, { replace: true });
        }
      }
    }, 500);
    // Cleanup the timeout to avoid unnecessary API calls
    return () => clearTimeout(delayDebounceFn);
  }, [searchFilter]);

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      PatientListApi();
    }
    return () => {
      isMounted = false; // Set to false when component unmounts
    };
  }, [searchParams]);

  useEffect(() => {
    let isMounted = true;
    if (hasMore && isMounted) {
      PatientListApi(hasMore);
    }
    return () => {
      isMounted = false; // Set to false when component unmounts
    };
  }, [hasMore]);

  useEffect(() => {
    if (
      userType === "super_admin" ||
      userType === "ops_admin" ||
      userType === "org_admin" ||
      userData?.personal_info?.is_provider === 1
    ) {
      providersApi();
    }
  }, []);

  useEffect(() => {
    setPatientList([]);
    setPatientList1([]);
  }, [eventType, assType]);

  useEffect(() => {
    if (
      searchParams.has("providerId") ||
      searchParams.has("search") ||
      searchParams.has("status") ||
      searchParams.has("type") ||
      searchParams.has("assType")
    ) {
      setUpdatedArr([]);
      setUpdatedArr1(filterValueById(patientList1, onlinePatients));
    } else {
      setUpdatedArr1([]);
      setUpdatedArr(filterValueById(patientList, onlinePatients));
    }
    // dispatch(setPatientStatus(false));
  }, [onlinePatients, patientList, patientList1]);

  // this function is used to set online status array in drawer array
  const filterValueById = (array1, array2) => {
    if (!isEmpty(array1)) {
      return array1.map((item1) => {
        if (!isEmpty(array2)) {
          const matchingItem = array2.find(
            (item2) => +item2.user_id === +item1.id
          );
          if (matchingItem) {
            return { ...item1, status: matchingItem.status };
          } else {
            return item1;
          }
        }
        return item1;
      });
    }
  };

  // get the filter container width and height
  const filterRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(filterRef.current.offsetHeight);
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
  }, [isToggleDrawer]);

  //this function is used to get patient list
  async function PatientListApi(load) {
    if (load) {
      setHasMore(false);
    } else {
      setLoader(true);
    }

    try {
      const response = await getApiData(
        `${Setting.endpoints.patientList}?provider_uid=${
          providerId || ""
        }&search=${searchFilter}&page=${page}&event_type=${
          assType ? assType : eventType ? eventType : ""
        }&assessment_status=${status ? status : ""}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (
          !isEmpty(response?.data?.access_patients) &&
          isArray(response?.data?.access_patients)
        ) {
          if (
            searchParams.has("providerId") ||
            searchParams.has("search") ||
            searchParams.has("status") ||
            searchParams.has("type") ||
            searchParams.has("assType")
          ) {
            setPatientList([]);
            setPatientList1((prevItems) => [
              ...prevItems,
              ...response?.data?.access_patients,
            ]);
          } else {
            setPatientList1([]);
            setPatientList((prev) => [
              ...prev,
              ...response?.data?.access_patients,
            ]);
          }
        } else {
          setPatientList([]);
          setPatientList1([]);
        }
        setPagination(response?.data?.pagination);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    } finally {
      setPaginationLoad(false);
      setLoader(false);
    }
  }

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

  //this function is used to get provider list
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
            setPage(1);
            if (
              searchParams.has("providerId") &&
              item?.user_id ===
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

  //check open events for patient
  async function checkOpenEventApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.checkOpenEvents,
        "POST",
        { patient_ids: merge?.mergeIds }
      );

      if (response?.status) {
        if (!isEmpty(response?.data) && response?.data.length > 1) {
          setMerge({ ...merge, openEvent: true, data: response?.data });
        } else {
          handleClick("merge", merge);
        }
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log(
        "🚀 ~ file: index.js:49 ~ getSelectedPatientApi ~ err======>>>>>>>",
        err
      );
    }
  }

  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (!isNumber(reason)) {
      valid = false;
      error.reasonErr = true;
      error.reasonMsg = "";
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

    setErrObj(error);
    if (valid) {
      closeEvent();
    }
  }

  async function closeEvent() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.closeEvent}?`,
        "POST",
        {
          event_id: merge?.eId,
          patient_id: merge?.pId,
          RRA: reason === 0 ? 1 : 0,
          RNRA: description || null,
          lost_follow_up: reason === 2 ? 1 : 0,
          provider_referral: referredTo === "Other" ? referredText : referredTo,
          referral_description: referredReason || null,
          other: other || null,
        }
      );
      if (response?.status) {
        checkOpenEventApi();
        toast.success(response.message);
        setMerge({ ...merge, closeEvent: false });
        clear();
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  function clear() {
    setReason("");
    setDescription("");
    setReferredTo("");
    setReferredText("");
    setReferredReason("");
    setOther("");
  }

  // this function is used to create a search text input
  function searchTextField() {
    return (
      <div id="search">
        <TextField
          placeholder="Search.."
          value={searchFilter}
          onChange={(e) => {
            let value = e.target.value;
            if (value.startsWith(" ")) {
              value = value.trimStart();
            }
            setSearchFilter(value);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search fill={color.primary} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="Search by name, email, phone or GUID" arrow>
                  <div style={{ lineHeight: 0, cursor: "pointer" }}>
                    <Info fill={color.gray} />
                  </div>
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </div>
    );
  }

  return (
    <Grid
      className={className.container}
      style={{ padding: from === "merge" && 0 }}
    >
      {from !== "merge" && (
        <Typography variant="title" style={{ color: color.primary }}>
          Patients
        </Typography>
      )}
      <Grid
        item
        xs={12}
        className={className.gridContainer}
        style={{
          height:
            from === "merge"
              ? "100%"
              : isTablet
              ? "calc(100% - 25px)"
              : "calc(100% - 40px)",
          marginTop: 5,
        }}
      >
        <Grid
          id={"filter"}
          ref={filterRef}
          item
          xs={12}
          display={"flex"}
          justifyContent="space-between"
          flexWrap={"nowrap"}
          gap="10px"
        >
          <Grid
            item
            display={"flex"}
            flexWrap="wrap"
            alignItems={"center"}
            gap={"10px"}
          >
            {from !== "merge" ? (
              <>
                {/* provider autocomplete */}
                {(userType === "super_admin" ||
                  userType === "ops_admin" ||
                  userType === "org_admin" ||
                  userData?.personal_info?.is_provider === 1) && (
                  <div id="providerSelect">
                    <Autocomplete
                      value={provider}
                      style={{ minWidth: 160 }}
                      onChange={(e, v, r, b) => {
                        setPatientList1([]);
                        setPage(1);
                        setProvider(v);
                        setProviderId(v?.user_id);
                        if (v?.id) {
                          setSearchParams(
                            {
                              ...queryParams,
                              providerId: EncDctFn(v?.user_id, "encrypt"),
                            },
                            { replace: true }
                          );
                        } else {
                          delete queryParams.providerId;
                          setSearchParams(
                            { ...queryParams },
                            { replace: true }
                          );
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
                {/* event type select */}
                <div id="eventSelect">
                  <Select
                    displayEmpty
                    disabled={!isEmpty(assType) ? true : false}
                    value={eventType || ""}
                    onChange={(e) => {
                      setPatientList1([]);
                      setPage(1);
                      if (e.target.value == 1) {
                        // setAssType(e.target.value);
                      } else {
                        setAssType("");
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
                        disabled={!isEmpty(assType) ? true : false}
                        sx={{
                          display: eventType ? "visible" : "none",
                          padding: 0,
                        }}
                        onClick={() => {
                          setEventType("");
                          delete queryParams.type;
                          setSearchParams(
                            { ...queryParams },
                            { replace: true }
                          );
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
                  <div id="assessmentSelect">
                    <Select
                      displayEmpty
                      value={assType || ""}
                      onChange={(e) => {
                        setPage(1);
                        setPatientList1([]);
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
                            setSearchParams(
                              { ...queryParams },
                              { replace: true }
                            );
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
                  <div id="assessmentSelect" style={{ border: "2px solid" }}>
                    <Select
                      disabled={true}
                      displayEmpty
                      value={assType || ""}
                      onChange={(e) => {
                        setPage(1);
                        setPatientList1([]);
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
                            setSearchParams(
                              { ...queryParams },
                              { replace: true }
                            );
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
                  <div id="assessmentSelect">
                    <Select
                      displayEmpty
                      value={assType || ""}
                      onChange={(e) => {
                        setPage(1);
                        setPatientList1([]);
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
                            setSearchParams(
                              { ...queryParams },
                              { replace: true }
                            );
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

                {/* status dot */}
                <Grid
                  item
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                ></Grid>
              </>
            ) : (
              <Grid item xs={12} display="flex" justifyContent={"center"}>
                <Tooltip
                  title="Max 6 patients can be merged simultaneously"
                  arrow
                >
                  <span>
                    <Button
                      style={{ minWidth: 135 }}
                      disabled={
                        merge?.mergeIds?.length < 2 ||
                        merge?.mergeIds.length > 6 ||
                        btnLoad
                      }
                      variant="contained"
                      onClick={() => checkOpenEventApi()}
                    >
                      {btnLoad ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Merge patients"
                      )}
                    </Button>
                  </span>
                </Tooltip>
              </Grid>
            )}
          </Grid>

          {searchTextField()}
        </Grid>
        <div style={{ width: "100%", padding: "10px 0px 0px 0px" }}>
          <Divider />
        </div>
        <Grid
          id={"infiniteSCroll"}
          ref={containerRef}
          item
          xs={12}
          className={className.scrollBar}
          style={{
            height: `calc(100% - ${height + 25}px)`,
          }}
          onScroll={(e) => {
            const container = e?.target;
            if (
              searchParams.has("providerId") ||
              searchParams.has("search") ||
              searchParams.has("status") ||
              searchParams.has("type") ||
              searchParams.has("assType")
            ) {
              if (
                !isEmpty(updatedArr1) &&
                isArray(updatedArr1) &&
                !paginationLoad &&
                pagination?.isMore &&
                container.clientHeight + container?.scrollTop + 1 >=
                  container?.scrollHeight
              ) {
                if (updatedArr.length < pagination.totalCount) {
                  setPaginationLoad(true);
                  setHasMore(true);
                  setPage(page + 1);
                }
              }
            } else if (
              !isEmpty(updatedArr) &&
              isArray(updatedArr) &&
              pagination?.isMore &&
              !paginationLoad &&
              container.clientHeight + container?.scrollTop + 1 >=
                container?.scrollHeight
            ) {
              if (updatedArr.length < pagination.totalCount) {
                setPaginationLoad(true);
                setHasMore(true);
                setPage(page + 1);
              }
            }
          }}
        >
          {searchParams.has("providerId") ||
          searchParams.has("search") ||
          searchParams.has("status") ||
          searchParams.has("type") ||
          searchParams.has("assType") ? (
            <Grid
              item
              xs={12}
              gap={3}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "10px 0px",
              }}
            >
              {loader ? (
                <Grid
                  item
                  xs={12}
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MainLoader />
                </Grid>
              ) : !isEmpty(updatedArr1) && isArray(updatedArr1) ? (
                <>
                  {updatedArr1.map((item, index) => {
                    let isOnline;
                    if (item?.status === "online") {
                      isOnline = true;
                    } else if (item?.status === "offline") {
                      isOnline = false;
                    } else if (onlinePatient[`${item?.id}`]) {
                      isOnline = true;
                    } else {
                      isOnline = false;
                    }
                    return (
                      <Zoom
                        key={index}
                        in={true}
                        timeout={300}
                        style={{
                          transitionDelay: "200ms",
                        }}
                        unmountOnExit
                      >
                        <Grid
                          id={index === 0 && "patientCard"}
                          item
                          xs={10}
                          sm={5.4}
                          md={3.6}
                          lg={2.8}
                          xl={1.8}
                        >
                          <Link
                            style={{ textDecoration: "none", outline: "none" }}
                            state={{ data: item }}
                            to={
                              isActivePatient != item?.id &&
                              `/patient/details?patient_id=${EncDctFn(
                                item?.id,
                                "encrypt"
                              )}`
                            }
                          >
                            <div style={{ cursor: "pointer" }}>
                              <PatientCard data={item} status={isOnline} />
                            </div>
                          </Link>
                        </Grid>
                      </Zoom>
                    );
                  })}
                  {paginationLoad && (
                    <Grid container display="flex" justifyContent={"center"}>
                      <CircularProgress size={22} />
                    </Grid>
                  )}
                </>
              ) : (
                <Grid
                  item
                  xs={12}
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <NoData />
                </Grid>
              )}
            </Grid>
          ) : (
            <Grid
              item
              xs={12}
              gap={3}
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                padding: "10px 0px",
              }}
            >
              {loader ? (
                <Grid
                  item
                  xs={12}
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <MainLoader />
                </Grid>
              ) : !isEmpty(updatedArr) && isArray(updatedArr) ? (
                <>
                  {updatedArr?.map((item, index) => {
                    let isOnline;
                    if (item?.status === "online") {
                      isOnline = true;
                    } else if (item?.status === "offline") {
                      isOnline = false;
                    } else if (onlinePatient[`${item?.id}`]) {
                      isOnline = true;
                    } else {
                      isOnline = false;
                    }

                    return (
                      <Zoom
                        key={index}
                        timeout={300}
                        in={true}
                        style={{
                          transitionDelay: "200ms",
                        }}
                        unmountOnExit
                      >
                        <Grid item xs={10} sm={5.4} md={3.6} lg={2.8} xl={1.8}>
                          {from === "merge" ? (
                            <div style={{ cursor: "pointer" }}>
                              <PatientCard
                                ischeckbox={from === "merge"}
                                data={item}
                                from={from}
                                id={merge?.mergeIds}
                                status={isOnline}
                                handleClick={(type) => {
                                  if (type === "select") {
                                    merge?.mergeIds.push(item?.id);
                                  } else {
                                    merge?.mergeIds.splice(
                                      merge?.mergeIds.indexOf(item?.id),
                                      1
                                    );
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <Link
                              style={{
                                textDecoration: "none",
                                outline: "none",
                              }}
                              state={{ data: item }}
                              to={
                                isActivePatient != item?.id &&
                                `/patient/details?patient_id=${EncDctFn(
                                  item?.id,
                                  "encrypt"
                                )}`
                              }
                            >
                              <div style={{ cursor: "pointer" }}>
                                <PatientCard
                                  data={item}
                                  id={merge?.mergeIds}
                                  status={isOnline}
                                />
                              </div>
                            </Link>
                          )}
                        </Grid>
                      </Zoom>
                    );
                  })}
                  {paginationLoad && (
                    <Grid container display="flex" justifyContent={"center"}>
                      <CircularProgress size={22} />
                    </Grid>
                  )}
                </>
              ) : (
                <Grid
                  item
                  xs={12}
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <NoData />
                </Grid>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>

      {/* open event modal */}
      <CModal
        title={"Open Event"}
        handleModal={(type) => {
          setMerge({ ...merge, openEvent: false });
        }}
        visible={merge?.openEvent}
        children={
          <Grid container gap={1}>
            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"center"}
              marginY={1}
            >
              <Typography variant="tableTitle" color={color.red}>
                Please close any {merge?.data.length - 1} event(s)
              </Typography>
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
              {["Patient", "Event", "Action"].map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    xs={4}
                    sm={3}
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <Typography fontSize={18} variant="tableTitle">
                      {item}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
            <Grid item xs={12}>
              {merge?.data?.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    display={"flex"}
                    justifyContent={"center"}
                    marginBottom={1}
                  >
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Typography variant="subTitle">
                        {item?.firstname +
                          " " +
                          (item?.middlename || "") +
                          " " +
                          item?.lastname}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Typography variant="subTitle">{item?.title}</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() =>
                          setMerge({
                            ...merge,
                            closeEvent: true,
                            eId: item?.event_id,
                            pId: item?.id,
                          })
                        }
                      >
                        Close event
                      </Button>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        }
      />

      <CloseEventConfirm
        maxWidth={"600px"}
        visible={merge?.closeEvent}
        title={"You are about to close this event!"}
        subTitle={`Once the event outcome is selected below and this event is closed, the outcome will be permanently recorded and no additional assessments will be recorded for this event.
        You will need to reopen the event to make any changes or resume assessments.`}
        btnLoad={btnLoad}
        btnTitle={"Close Event"}
        handleModal={(type) => {
          if (type === "close") {
            setMerge({ ...merge, closeEvent: false });
            setReason([]);
            clear();
          } else {
            validation();
          }
        }}
        child={
          <Grid container className={className.scrollBar}>
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
                  Please select a reason for closing event
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
        }
      />
    </Grid>
  );
}

export default Patient;
