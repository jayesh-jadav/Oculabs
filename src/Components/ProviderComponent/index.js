import {
  Autocomplete,
  Avatar,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  Zoom,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { color } from "../../Config/theme";
import { KeyboardArrowDown } from "@mui/icons-material";
import PatientCard from "../PatientCard";
import BackBtn from "../BackBtn";
import { isMobile, isTablet } from "react-device-detect";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { cloneDeep, isArray, isEmpty, isNull, isObject } from "lodash";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import AddProviders from "../Forms/AddProviders";
import AddPatientsForm from "../Forms/AddPatients";
import AddUsersForm from "../Forms/AddUsers/index";
import moment from "moment";
import MainLoader from "../Loader/MainLoader";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import Search from "../CustomIcon/Global/Search";
import ImagePreview from "../ImagePreview";
import { findRole } from "../../Utils/CommonFunctions";
import Info from "../CustomIcon/Global/Info";

export default function ProviderComponent(props) {
  const { handleClick = () => null } = props;
  const { isOnline, userType, userData } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const classes = styles();
  const [data, setData] = useState("");
  const [role, setRole] = useState();
  const isProvider = data?.is_provider;
  const [tabValue, setTabValue] = useState(0);
  const [tabValue1, setTabValue1] = useState(1);
  const [search, setSearch] = useState("");
  const [check, setCheck] = useState(false);
  const [check1, setCheck1] = useState(false);

  const [provider, setProvider] = useState([]);

  const [providersList, setProvidersList] = useState([]);

  const [fltProviderList, setFltProviderList] = useState([]);

  const [patientAllList, setPatientAllList] = useState([]);

  const [allPatients, setAllPatients] = useState([]);

  const [patientList, setPatientList] = useState([]);

  const [arrayData, setArraydata] = useState([]);

  const [selectedPatients, setSelectedPatients] = useState([]);

  const [searchSelectedPatients, setSearchSelectedPatients] = useState([]);
  const [selectedPatientLoader, setSelectedPatientLoader] = useState(false);

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  const [providerName, setPoviderName] = useState("");
  const [changeTab, setChangeTab] = useState("");
  // permission state
  const [permission, setPermission] = useState(false);

  const [selectedProvider, setSelectedProvider] = useState([]);
  const [image, setImage] = useState("");

  useEffect(() => {
    if (
      userType === "super_admin" ||
      userType === "ops_admin" ||
      userType === "org_admin" ||
      userData?.personal_info?.is_provider === 1
    ) {
      setPermission(true);
    }
  }, []);

  useEffect(() => {
    if (searchParams.has("id")) {
      if (
        searchParams.has("tab") &&
        searchParams.get("tab") === "patient_info"
      ) {
        getPatient(Number(EncDctFn(searchParams.get("id"), "decrypt")));
      }
      if (searchParams.has("tab") && searchParams.get("tab") === "user_info") {
        getUserData(Number(EncDctFn(searchParams.get("id"), "decrypt")));
      }
      if (
        searchParams.has("tab") &&
        searchParams.get("tab") === "provider_info"
      ) {
        providerDataApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
      }
      if (searchParams.has("subTab")) {
        setChangeTab(searchParams.get("subTab"));
      }
    }
  }, [searchParams]);

  useEffect(() => {
    tabValue === 1 && viewSelectedPatientApi();
    if (
      !isEmpty(data?.provider_title) &&
      !isEmpty(data?.provider_firstname) &&
      !isEmpty(data?.provider_lastname) &&
      !isEmpty(data?.provider_credentials)
    ) {
      setPoviderName(
        data?.provider_title +
          " " +
          data?.provider_firstname +
          " " +
          data?.provider_lastname +
          " " +
          data?.provider_credentials || ""
      );
    }
  }, [tabValue, tabValue1]);

  useEffect(() => {
    if (!isEmpty(providersList) && isArray(providersList)) {
      let dummy_Arr = providersList.filter(
        (obj) => obj?.id !== (data?.provider_id || data?.id)
      );
      setFltProviderList(dummy_Arr);
    }
  }, [providersList]);

  useEffect(() => {
    setArraydata(patientList);
  }, [patientList]);

  useEffect(() => {
    setSearchSelectedPatients(selectedPatients);
  }, [selectedPatients]);

  useEffect(() => {
    setSearch("");
  }, [tabValue1]);

  useEffect(() => {
    if (isEmpty(allPatients)) {
      const allPatient = patientAllList.reduce((accumulator, currentItem) => {
        return accumulator.concat(currentItem.patient_data);
      }, []);

      setAllPatients(allPatient);
    }
  }, [patientAllList, tabValue1]);

  useEffect(() => {
    const mainProvider = data?.provider_id;
    if (!isEmpty(selectedPatients)) {
      setSelectedProvider((item) => {
        const data = [...item];
        selectedPatients.forEach((it) => {
          if (it.provider_id !== mainProvider) {
            data.push(it.provider_id);
          }
        });
        return data;
      });
    }
  }, [selectedPatients]);

  useEffect(() => {
    if (!isEmpty(selectedProvider)) {
      const dummy_Arr = providersList.filter(
        (it) => !selectedProvider.includes(it?.id)
      );

      setFltProviderList(dummy_Arr);

      const arr = providersList.filter((it) =>
        selectedProvider.includes(it?.id)
      );
      setProvider(arr);

      arr.map((item) => {
        addpatientArr(item, "selectOption");
      });
    }
  }, [selectedProvider]);

  useEffect(() => {
    if (isEmpty(provider)) {
      providersApi();
    }
  }, [tabValue1]);

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
        }
      } else {
        toast.error(response.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function patientApi() {
    try {
      const response = await getApiData(`${Setting.endpoints.patients}`, "get");
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setPatientAllList(cloneDeep(response?.data));
        } else {
          setPatientList([]);
        }
      } else {
        toast.error(response.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function saveDataAccess(data1) {
    setBtnLoad(true);
    try {
      let newData = [];
      await data1.map((e) => {
        if (e?.provider_id != data?.id) {
          newData.push(e);
        }
      });
      const response = await getApiData(
        Setting.endpoints.saveData,
        "POST",
        {
          data: JSON.stringify(newData),
          every_thing: check ? 1 : 0,
          user_id: data?.provider_uid || data?.id,
        },
        true
      );
      if (response.status) {
        toast.success(response.message);
        setTabValue1(1);
        setProvider([]);
        setPatientList([]);
      } else {
        toast.error(response.message);
      }
      setBtnLoad(false);
    } catch (error) {
      console.log("error =======>>>", error);
      setBtnLoad(false);
    }
  }

  async function viewSelectedPatientApi() {
    setSelectedPatientLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.viewSelectedPatient}?id=${
          data?.provider_uid || data?.id
        }`,
        "GET",
        {}
      );
      if (response?.status) {
        if (response?.everything === 1) {
          setSelectedPatients([]);
          setCheck1(true);
        } else {
          setSelectedProvider([]);
          setSelectedPatients(response?.data);
          setCheck1(false);
        }
      } else {
        toast.error(response?.message);
      }
      setSelectedPatientLoader(false);
    } catch (er) {
      setSelectedPatientLoader(false);
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  function handleCheck(type, i) {
    const dummy_Arr = [...arrayData];

    dummy_Arr.map((item, index) => {
      if (type === "sall") {
        item.status = true;
      } else if (type === "dall") {
        item.status = false;
      } else if (type === "check") {
        if (index === i) {
          item.status = !item.status;
        }
      }
    });

    setArraydata(dummy_Arr);
  }

  function filterVal(val, tab) {
    if (tab === 0) {
      if (isEmpty(val)) {
        setArraydata(patientList);
      } else {
        const newData = patientList?.filter((item) => {
          return item?.fullname?.toLowerCase().indexOf(val?.toLowerCase()) > -1;
        });
        setArraydata(newData);
      }
    } else {
      if (isEmpty(val)) {
        setSearchSelectedPatients(selectedPatients);
      } else {
        const newData = selectedPatients?.filter((item) => {
          return item?.fullname?.toLowerCase().indexOf(val?.toLowerCase()) > -1;
        });
        setSearchSelectedPatients(newData);
      }
    }
    setSearch(val);
  }

  function submitData() {
    let finalArr = [];

    provider.map((item, index) => {
      let patientArr = [];

      let finalObj = {
        provider_id: item?.id,
        patient_id: [],
        is_all: true,
      };

      let dummy_Arr = patientList.filter(function (obj) {
        return obj?.provider_id === item?.id;
      });

      !isEmpty(dummy_Arr) &&
        dummy_Arr.map((i) => {
          finalObj.provider_id = i?.provider_id;
          if (i?.status) {
            patientArr.push(i?.patient_id);
          } else {
            finalObj.is_all = false;
          }
        });

      finalObj.patient_id = finalObj.is_all ? [] : patientArr;
      finalArr.push(finalObj);
    });
    saveDataAccess(finalArr);
  }

  let dummy_Arr = [];
  function addpatientArr(pro_data, type) {
    if (type === "selectOption") {
      let x = null;
      fltProviderList?.map((item, index) => {
        if (item?.provider_id == pro_data?.id) {
          x = pro_data.id;
        }
      });
      if (!isNull(x)) {
        fltProviderList.pop(x);
      }
      patientAllList?.map((item) => {
        let pro_id = [pro_data.id];
        provider?.map((e) => {
          if (!pro_id.includes(e.id)) {
            pro_id.push(e.id);
          }
        });

        if (pro_id.includes(item.provider_id)) {
          let new_arr = [...item.patient_data];
          let existKey = true;
          new_arr?.map((e) => {
            dummy_Arr?.map((d) => {
              if (d.patient_id == e.patient_id) {
                existKey = false;
              }
            });
            if (existKey) {
              dummy_Arr.push(e);
            }
          });
        }
      });

      setPatientList(dummy_Arr);
    } else if (type === "removeOption") {
      let new_arr = [];

      patientList?.map((item) => {
        let existKey = true;
        if (item?.provider_id == pro_data?.id) {
          existKey = false;
        }
        if (existKey) {
          new_arr.push(item);
        }
      });
      setPatientList(new_arr);

      let existKey = true;
      fltProviderList?.map((item) => {
        if (item?.id == pro_data?.id) {
          existKey = false;
        }
      });
      if (existKey && data.provider_id != pro_data.id) {
        fltProviderList.push(pro_data);
      }
    }
  }

  // get patient data by id
  async function getPatient(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getPatient}?patient_id=${id}&created_from=web`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setData(response?.data);
          setRole(response?.data?.role_slug);
          providersApi();
          patientApi();
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

  // get user data by id
  const getUserData = async (id) => {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.userData}?created_from=web&id=${id}`,
        "GET"
      );
      if (response.status) {
        setLoader(false);
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setData(response?.data);
          setRole(response?.data?.role_slug);
          providersApi();
          patientApi();
        }
      } else {
        setLoader(false);
        toast.error(response.message);
      }
    } catch (error) {
      setLoader(false);
      console.log("error =======>>>", error);
      toast.error(error.error);
    }
  };

  // get provider data by id
  async function providerDataApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.providerList}?page=${1}&id=${id}`,
        "GET",
        {}
      );
      if (response?.status) {
        setLoader(false);
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setData(response?.data);
          setRole(response?.data?.role_slug);
          providersApi();
          patientApi();
        }
      } else {
        setLoader(false);
        toast.error(response?.message);
      }
    } catch (er) {
      setLoader(false);
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  return (
    <>
      {changeTab === "edit" ? (
        role === "patient" ? (
          <AddPatientsForm
            handleClick={(type) => {
              setChangeTab("");
              delete queryParams.subTab;
              setSearchParams({ ...queryParams }, { replace: true });
            }}
          />
        ) : searchParams.has("tab") &&
          searchParams.get("tab") === "provider_info" ? (
          <AddProviders
            editData={data}
            from={"provider"}
            handleClick={(type) => {
              setChangeTab("");
              delete queryParams.subTab;
              setSearchParams({ ...queryParams }, { replace: true });
            }}
          />
        ) : (
          <AddUsersForm
            handleClick={(type) => {
              setChangeTab("");
              delete queryParams.subTab;
              setSearchParams({ ...queryParams }, { replace: true });
            }}
          />
        )
      ) : (
        <Grid container className={classes.container}>
          {loader ? (
            <Grid
              item
              xs={12}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <MainLoader />
            </Grid>
          ) : (
            <>
              <Grid
                item
                xs={12}
                display="flex"
                justifyContent={"space-between"}
                alignItems="center"
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <BackBtn handleClick={() => handleClick("cancel")} />
                  <Typography variant="title" style={{ color: color.primary }}>
                    User Info
                  </Typography>
                </div>
                {permission && (
                  <Button
                    variant="contained"
                    style={{ minWidth: 120 }}
                    onClick={() =>
                      setSearchParams(
                        { ...queryParams, subTab: "edit" },
                        { replace: true }
                      )
                    }
                  >
                    Edit
                  </Button>
                )}
              </Grid>
              <Grid container flexDirection={"column"}>
                <Grid
                  item
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    padding: "20px 0px",
                  }}
                >
                  <Grid item paddingLeft={1}>
                    <Avatar
                      onClick={() =>
                        setImage(data?.profile_pic || data?.user_photo)
                      }
                      style={{
                        borderRadius: "15%",
                        width: "80px",
                        height: "90px",
                        objectFit: "cover",
                      }}
                      src={data?.profile_pic || data?.user_photo}
                    />
                  </Grid>
                  <Grid
                    item
                    marginLeft={2}
                    display={"flex"}
                    flexDirection={"column"}
                    justifyContent={"center"}
                  >
                    <Typography variant="tableTitle" paddingBottom={1}>
                      {isProvider === 1
                        ? (data?.credentials && data?.title
                            ? data?.title
                            : "") +
                          " " +
                          (data?.firstname ? data?.firstname : "") +
                          " " +
                          (data?.lastname ? data?.lastname : "") +
                          " " +
                          (data?.credentials ? data?.credentials : "")
                        : (data?.firstname ? data?.firstname : "") +
                          " " +
                          (data?.middlename ? data?.middlename : "") +
                          " " +
                          (data?.lastname ? data?.lastname : "")}
                    </Typography>
                    <Typography>{data?.phone}</Typography>
                    <Typography>{data?.role}</Typography>
                  </Grid>
                </Grid>
                <Grid
                  container
                  style={{
                    borderBottom: `1px solid ${color.borderColor}`,
                  }}
                >
                  <Tabs
                    value={tabValue}
                    onChange={(i, e) => {
                      setTabValue(e);
                    }}
                  >
                    <Tab label="Basic Info" />
                    {role !== "patient" &&
                      role !== "super_admin" &&
                      role !== "org_admin" &&
                      role !== "ops_admin" && (
                        <Tab label="Patient Data Access" />
                      )}
                  </Tabs>
                </Grid>
              </Grid>

              <div
                style={{
                  padding: isMobile ? "10px 0" : 10,
                  flex: 1,
                }}
              >
                {tabValue === 0 ? (
                  <Grid container gap={2}>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">Name :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography>
                          {isProvider === 1
                            ? (data?.credentials && data?.title
                                ? data?.title
                                : "") +
                              " " +
                              (data?.firstname ? data?.firstname : "") +
                              " " +
                              (data?.lastname ? data?.lastname : "") +
                              " " +
                              (data?.credentials ? data?.credentials : "")
                            : (data?.firstname ? data?.firstname : "") +
                              " " +
                              (data?.middlename ? data?.middlename : "") +
                              " " +
                              (data?.lastname ? data?.lastname : "")}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">Phone No. :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography>{data.phone || "-"}</Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">Email :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography>{data.email || "-"}</Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">Sex :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography>
                          {data.sex === "1"
                            ? "Male"
                            : data.sex === "0"
                            ? "Female"
                            : "Intersex" || "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">DOB :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography>
                          {moment(data.dob).format("MM-DD-YYYY") || "-"}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={6} sm={3} md={2}>
                        <Typography variant="subTitle">Role :</Typography>
                      </Grid>
                      <Grid item xs={6} sm={9} md={10}>
                        <Typography style={{ textTransform: "capitalize" }}>
                          {searchParams.has("tab") &&
                          searchParams.get("tab") === "patient_info"
                            ? "Patient"
                            : findRole(data?.role_slug)}
                        </Typography>
                      </Grid>
                    </Grid>
                    {!isEmpty(providerName) && (
                      <Grid container>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="subTitle">
                            Practitioner :
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={9} md={10}>
                          <Typography>{providerName || "-"}</Typography>
                        </Grid>
                      </Grid>
                    )}
                    {!isNull(data?.id) && (
                      <Grid container>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="subTitle">ID :</Typography>
                        </Grid>
                        <Grid item xs={6} sm={9} md={10}>
                          <Typography>{data?.id || "-"}</Typography>
                        </Grid>
                      </Grid>
                    )}
                    {!isEmpty(data?.global_unique_key) && (
                      <Grid container>
                        <Grid item xs={6} sm={3} md={2}>
                          <Typography variant="subTitle">GUID :</Typography>
                        </Grid>
                        <Grid item xs={6} sm={9} md={10}>
                          <Typography>
                            {data?.global_unique_key || "-"}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Grid container>
                    <Grid
                      container
                      style={{
                        borderBottom: `1px solid ${color.borderColor}`,
                        width: "100%",
                      }}
                    >
                      <Tabs
                        value={tabValue1}
                        onChange={(i, e) => {
                          setTabValue1(e);
                          setCheck(false);
                        }}
                      >
                        <Tab label="Edit" />
                        <Tab label="View selected" />
                      </Tabs>
                    </Grid>

                    {tabValue1 === 0 ? (
                      <div
                        style={{
                          padding: !isMobile && 10,
                          flex: 1,
                        }}
                      >
                        <Grid item xs={12} paddingTop={2}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={check}
                                onChange={() => setCheck(!check)}
                              />
                            }
                            label="Entire Organization"
                          />
                        </Grid>
                        {!check && (
                          <>
                            <Grid item xs={12} marginTop={2}>
                              <Autocomplete
                                fullWidth
                                multiple
                                disableClearable
                                options={fltProviderList}
                                getOptionLabel={(option) =>
                                  (option?.credentials && option?.title
                                    ? option?.title
                                    : "") +
                                  " " +
                                  option?.firstname +
                                  " " +
                                  option?.lastname +
                                  " " +
                                  (option?.credentials
                                    ? option?.credentials
                                    : "")
                                }
                                popupIcon={<KeyboardArrowDown />}
                                filterSelectedOptions
                                value={provider}
                                disabled={tabValue1 === 1}
                                onChange={(e, v, r, b) => {
                                  addpatientArr(b?.option, r);
                                  setProvider(v);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    placeholder="Select providers"
                                  />
                                )}
                              />
                            </Grid>
                            {!isEmpty(provider) ? (
                              <Grid item xs={12} marginTop={2}>
                                <TextField
                                  fullWidth
                                  placeholder="Search patient"
                                  value={search}
                                  onChange={(e) => {
                                    filterVal(e.target.value, 0);
                                  }}
                                  InputProps={{
                                    startAdornment: (
                                      <InputAdornment position="start">
                                        <Search fill={color.primary} />
                                      </InputAdornment>
                                    ),
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Tooltip
                                          title="Search by name"
                                          placement="bottom"
                                          arrow
                                        >
                                          <div
                                            style={{
                                              lineHeight: 0,
                                              cursor: "pointer",
                                            }}
                                          >
                                            <Info fill={color.gray} />
                                          </div>
                                        </Tooltip>
                                      </InputAdornment>
                                    ),
                                  }}
                                />
                              </Grid>
                            ) : null}
                          </>
                        )}

                        <Grid container>
                          <Grid container marginTop={2} gap={isTablet ? 1 : 2}>
                            {!check && (
                              <>
                                {!isEmpty(arrayData) && (
                                  <Grid item xs={12}>
                                    <Button
                                      variant="contained"
                                      onClick={() => {
                                        handleCheck("sall");
                                      }}
                                    >
                                      Select All
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      style={{ marginLeft: 10 }}
                                      onClick={() => {
                                        handleCheck("dall");
                                      }}
                                    >
                                      Deselect All
                                    </Button>
                                  </Grid>
                                )}
                                {arrayData.map((item, index) => {
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
                                        item
                                        xs={isTablet && 5.9}
                                        sm={isTablet && 3.9}
                                      >
                                        <PatientCard
                                          from="accessPatient"
                                          data={item}
                                          ischeckbox
                                          handleClick={() => {
                                            handleCheck("check", index);
                                          }}
                                        />
                                      </Grid>
                                    </Zoom>
                                  );
                                })}
                              </>
                            )}

                            <Grid
                              container
                              justifyContent={!check && "center"}
                              marginTop={2}
                            >
                              <Button
                                variant="contained"
                                style={{
                                  width: "150px",
                                }}
                                disabled={
                                  (!check || btnLoad || !isOnline) &&
                                  isEmpty(arrayData)
                                }
                                onClick={() => {
                                  submitData();
                                }}
                              >
                                {btnLoad ? (
                                  <CircularProgress size={22} />
                                ) : (
                                  "Save"
                                )}
                              </Button>
                            </Grid>
                          </Grid>
                        </Grid>
                      </div>
                    ) : (
                      <div
                        style={{
                          padding: !isMobile && 10,
                          flex: 1,
                        }}
                      >
                        {!check1 && (
                          <>
                            <Grid item xs={12} marginTop={2}>
                              <TextField
                                fullWidth
                                placeholder="Search patient"
                                value={search}
                                onChange={(e) => {
                                  filterVal(e.target.value);
                                }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Search fill={color.primary} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <Tooltip
                                        title="Search by name"
                                        placement="bottom"
                                        arrow
                                      >
                                        <div
                                          style={{
                                            lineHeight: 0,
                                            cursor: "pointer",
                                          }}
                                        >
                                          <Info fill={color.gray} />
                                        </div>
                                      </Tooltip>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </>
                        )}

                        {!check1 && selectedPatientLoader ? (
                          <Grid
                            container
                            alignItems={"center"}
                            justifyContent={"center"}
                            style={{ minHeight: "200px" }}
                          >
                            <MainLoader />
                          </Grid>
                        ) : (
                          <Grid container marginTop={2} gap={isTablet ? 1 : 2}>
                            {searchSelectedPatients.map((item, index) => {
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
                                    item
                                    xs={isTablet && 5.9}
                                    sm={isTablet && 3.9}
                                  >
                                    <PatientCard
                                      from="accessPatient"
                                      data={item}
                                    />
                                  </Grid>
                                </Zoom>
                              );
                            })}
                          </Grid>
                        )}
                      </div>
                    )}
                  </Grid>
                )}
              </div>
            </>
          )}
        </Grid>
      )}
      <ImagePreview image={image} handleClose={() => setImage("")} />
    </>
  );
}
