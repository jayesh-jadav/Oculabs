import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import styles from "./styles";
import { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import {
  Domain,
  KeyboardArrowDown,
  LanguageOutlined,
  LocationOnOutlined,
  PublicOutlined,
} from "@mui/icons-material";
import TokenIcon from "@mui/icons-material/Token";
import { BsFileEarmarkPlus } from "react-icons/bs";
import { isEmpty, isNull, isObject } from "lodash";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import UploadFile from "../../UploadFile";
import { useSearchParams } from "react-router-dom";
import MainLoader from "../../Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Email from "../../CustomIcon/Global/Email";
import Phone from "../../CustomIcon/Global/Phone";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { useDispatch, useSelector } from "react-redux";
import TFA from "../../CustomIcon/Global/TFA";
import authActions from "../../../Redux/reducers/auth/actions";
import City from "../../CustomIcon/Global/City";
import DateIcon from "../../CustomIcon/Global/DOB";
import DataManagement from "../../CustomIcon/Patients/DataManagement";
import Organization from "../../CustomIcon/Global/Organization";
import CryptoJS from "crypto-js";
import { convertToIST } from "../../../Utils/CommonFunctions";

const errorObj = {
  nameErr: false,
  domainErr: false,
  phoneErr: false,
  emailErr: false,
  websiteErr: false,
  addressErr: false,
  cityErr: false,
  countryErr: false,
  contactPersonErr: false,
  imageErr: false,
  otherErr: false,
  dateErr: false,
  sizeErr: false,
  tokenErr: false,
  // error message
  nameMsg: "",
  domainMsg: "",
  phoneMsg: "",
  emailMsg: "",
  websiteMsg: "",
  addressMsg: "",
  cityMsg: "",
  countryMsg: "",
  contactPersonMsg: "",
  imageMsg: "",
  otherMsg: "",
  dateMsg: "",
  sizeMsg: "",
  tokenMsg: "",
};

const AddOrganizationForm = (props) => {
  const { handleClick = () => null } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const { userType, userData, isOnline, refDemoTime } = useSelector(
    (state) => state.auth
  );
  const { setChangeOrganizationStatus, setRefDemoTime } = authActions;
  const dispatch = useDispatch();
  const className = styles();
  const email_Regex = Setting.JS_Regex.email_Regex;
  const website_Regex = Setting.JS_Regex.urlRegex;
  const token_Regex = Setting.JS_Regex.tokenRegex;

  const hasUAT =
    !window.location.href.toLowerCase().includes("uat") &&
    !window.location.href.toLowerCase().includes("dev");

  // form field state
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [date, setDate] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [other, setOther] = useState("");
  const [databaseSize, setDatabaseSize] = useState("");
  const [file, setFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [tfa, setTfa] = useState("0");
  const [eyeTracking, setEyeTracking] = useState(false);
  const [digitRecall, setDigitRecall] = useState(false);
  const [wordRecall, setWordRecall] = useState(false);
  const [tokenKey, setTokenKey] = useState("");
  const [data, setData] = useState("");
  const [isEdit, setEdit] = useState(false);

  const [errObj, setErrObj] = useState(errorObj);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [timestamp, setTimestamp] = useState(null);
  const [refreshBtnLoad, setRefreshBtnLoad] = useState(false);

  useEffect(() => {
    if (searchParams.has("id") || userType === "org_admin") {
      if (userType === "org_admin") {
        getOranizationdata(userData?.personal_info?.tenant_id);
      } else {
        getOranizationdata(Number(EncDctFn(searchParams.get("id"), "decrypt")));
      }
    }
    if (searchParams.has("tab") && searchParams.get("tab") === "edit") {
      setEdit(true);
    }
  }, [searchParams]);
  useEffect(() => {
    if (!isEmpty(data) || userType === "org_admin") {
      if (!isEmpty(data)) {
        editData(data);
      }
    }
  }, [data]);

  // this useEffect is used to disable or enable button based on timestamp
  useEffect(() => {
    if (refDemoTime) {
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - parseInt(refDemoTime, 10);
      if (timeDifference < 30000) {
        setIsButtonDisabled(true);
        setTimestamp(parseInt(refDemoTime, 10));
        setTimeout(() => {
          setIsButtonDisabled(false);
          setTimestamp(null);
          dispatch(setRefDemoTime(""));
        }, 30000 - timeDifference);
      }
    }
  }, []);

  const editData = (data) => {
    if (!isNull(data?.name) || !isEmpty(data?.name)) {
      setName(data?.name);
    }
    if (!isNull(data?.tenant_alias) || !isEmpty(data?.tenant_alias)) {
      setDomain(data?.tenant_alias);
    }
    if (!isNull(data?.phone) || !isEmpty(data?.phone)) {
      setPhone(data?.phone);
    }
    if (!isNull(data?.email) || !isEmpty(data?.email)) {
      setEmail(data?.email);
    }
    if (!isNull(data?.website) || !isEmpty(data?.website)) {
      setWebsite(data?.website);
    }
    if (!isNull(data?.license_end_date) || !isEmpty(data?.license_end_date)) {
      const convertedDate = convertToIST(data?.license_end_date);
      setDate(convertedDate);
    }
    if (!isNull(data?.address) || !isEmpty(data?.address)) {
      setAddress(data?.address);
    }
    if (!isNull(data?.city) || !isEmpty(data?.city)) {
      setCity(data?.city);
    }
    if (!isNull(data?.country) || !isEmpty(data?.country)) {
      setCountry(data?.country);
    }
    if (!isNull(data?.other) || !isEmpty(data?.other)) {
      setOther(data?.other);
    }
    if (
      !isNull(data?.two_factor_authentication) ||
      !isEmpty(data?.two_factor_authentication)
    ) {
      setTfa(data?.two_factor_authentication.toString() || "");
    }

    if (!isNull(data?.contact_person) || !isEmpty(data?.contact_person)) {
      setContactPerson(data?.contact_person);
    }
    if (userType === "super_admin") {
      if (!isNull(data?.et_admin_status) || !isEmpty(data?.et_admin_status)) {
        setEyeTracking(data?.et_admin_status === 1 ? true : false);
      }
      if (!isNull(data?.dr_admin_status) || !isEmpty(data?.dr_admin_status)) {
        setDigitRecall(data?.dr_admin_status === 1 ? true : false);
      }
      if (!isNull(data?.wr_admin_status) || !isEmpty(data?.wr_admin_status)) {
        setWordRecall(data?.wr_admin_status === 1 ? true : false);
      }
    } else {
      if (!isNull(data?.eye_tracking) || !isEmpty(data?.eye_tracking)) {
        setEyeTracking(data?.eye_tracking === 1 ? true : false);
      }
      if (!isNull(data?.digit_recall) || !isEmpty(data?.digit_recall)) {
        setDigitRecall(data?.digit_recall === 1 ? true : false);
      }
      if (!isNull(data?.word_recall) || !isEmpty(data?.word_recall)) {
        setWordRecall(data?.word_recall === 1 ? true : false);
      }
    }
    if (!isNull(data?.logo) || !isEmpty(data?.logo)) {
      setFile(data?.logo);
      setSelectedFile(data?.logo);
    }
    if (data?.size) {
      setDatabaseSize(data?.size);
    }
    if (data?.token_key) {
      setTokenKey(data?.token_key);
    }
  };

  const validation = () => {
    const error = { ...errObj };
    let valid = true;
    let section = null;
    let scroll = false;
    if (isNull(name) || isEmpty(name.trim())) {
      valid = false;
      scroll = true;
      error.nameErr = true;
      error.nameMsg = "Please enter name";
      section = document.querySelector("#name");
    }
    if (isNull(domain) || isEmpty(domain.trim())) {
      valid = false;
      error.domainErr = true;
      error.domainMsg = "Please enter domain";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#domain");
      }
    }

    if (isNull(phone) || isEmpty(phone.trim())) {
      valid = false;
      error.phoneErr = true;
      error.phoneMsg = "Please enter phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#phone");
      }
    } else if (phone.length < 10) {
      valid = false;
      error.phoneErr = true;
      error.phoneMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#phone");
      }
    }
    if (isNull(email) || isEmpty(email.trim())) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#email");
      }
    } else if (!email_Regex.test(email)) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter valid email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#email");
      }
    }
    if (isNull(website) || isEmpty(website.trim())) {
      valid = false;
      error.websiteErr = true;
      error.websiteMsg = "Please enter website";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#website");
      }
    } else if (!website_Regex.test(website)) {
      valid = false;
      error.websiteErr = true;
      error.websiteMsg =
        "Please enter a valid website URL starting with 'https://'";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#website");
      }
    }
    if (isNull(address) || isEmpty(address.trim())) {
      valid = false;
      error.addressErr = true;
      error.addressMsg = "Please enter address";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#address");
      }
    }
    if (isNull(city) || isEmpty(city.trim())) {
      valid = false;
      error.cityErr = true;
      error.cityMsg = "Please enter city";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#city");
      }
    }
    if (isNull(country) || isEmpty(country.trim())) {
      valid = false;
      error.countryErr = true;
      error.countryMsg = "Please enter country";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#country");
      }
    }
    if (!isEmpty(contactPerson) && contactPerson.length < 10) {
      valid = false;
      error.contactPersonErr = true;
      error.contactPersonMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#contactP");
      }
    }
    if (userType === "super_admin") {
      if (isNull(date)) {
        valid = false;
        error.dateErr = true;
        error.dateMsg = "Please select license date";
        if (!scroll) {
          scroll = true;
          section = document.querySelector("#date");
        }
      } else if (dateError) {
        valid = false;
        error.dateErr = true;
        error.dateMsg = "Please select valid license date";
        if (!scroll) {
          scroll = true;
          section = document.querySelector("#date");
        }
      }
      if (!databaseSize) {
        valid = false;
        error.sizeErr = true;
        error.sizeMsg = "Please select size";
      }
      if (!isEdit && userType === "super_admin") {
        if (isEmpty(tokenKey)) {
          valid = false;
          error.tokenErr = true;
          error.tokenMsg = "Please enter token key";
          if (!scroll) {
            scroll = true;
            section = document.querySelector("#token");
          }
        } else if (!token_Regex.test(tokenKey)) {
          valid = false;
          error.tokenErr = true;
          error.tokenMsg = "Please enter valid token key";
          if (!scroll) {
            scroll = true;
            section = document.querySelector("#token");
          }
        }
      }
    }
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setErrObj(error);
    if (valid) {
      createOrganization();
    }
  };

  // this function is used to create organization
  async function createOrganization() {
    setBtnLoad(true);
    const baseData = {
      name: name,
      logo: selectedFile || [],
      domain: domain,
      phone: phone,
      email: email,
      website: website,
      other: other,
      address: address,
      city: city,
      country: country,
      contact_person: contactPerson,
      two_factor_authentication: tfa,
    };

    const data1 = {
      ...baseData,
      ...(userType === "super_admin" && {
        license_end_date: date,
        size: databaseSize,
        et_admin_status: eyeTracking ? 1 : 0,
        wr_admin_status: wordRecall ? 1 : 0,
        dr_admin_status: digitRecall ? 1 : 0,
      }),
      ...(userType !== "super_admin" && {
        eye_tracking: eyeTracking ? 1 : 0,
        digit_recall: digitRecall ? 1 : 0,
        word_recall: wordRecall ? 1 : 0,
      }),
      ...(!isEdit && {
        token_key: tokenKey,
      }),
    };

    if (isEdit) {
      data1["tenant_id"] = data?.id;
    }
    try {
      const response = await getAPIProgressData(
        isEdit ? Setting.endpoints.update : Setting.endpoints.organization,
        isEdit ? "PATCH" : "POST",
        data1,
        true
      );
      if (response.status) {
        dispatch(setChangeOrganizationStatus(null));
        toast.success(response.message);
        getOranizationdata(userData?.personal_info?.id);
        dispatch(setChangeOrganizationStatus(userData?.personal_info?.id));
        handleClick("cancel");
      } else {
        toast.error(response.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
    }
  }

  // this function is used for get a org data by id
  async function getOranizationdata(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getOrgByID}?tenant_id=${id}`,
        "GET"
      );
      if (response.status) {
        setLoader(false);
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setData(response?.data);
        }
      } else {
        setLoader(false);
        toast.error(response.message);
      }
    } catch (error) {
      setLoader(false);
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  // this function is used to Refresh Demo Environment data
  async function refreshDemoData() {
    try {
      setRefreshBtnLoad(true);
      const response = await getApiData(
        Setting.endpoints.createDemo,
        "POST",
        { tenant_id: userData?.tenant_id },
        ""
      );
      if (response?.status) {
        toast.error(response?.message);
        setIsButtonDisabled(true);
        const currentTimestamp = new Date().getTime();
        setTimestamp(currentTimestamp);
        dispatch(setRefDemoTime(currentTimestamp.toString()));
        setTimeout(() => {
          setIsButtonDisabled(false);
          setTimestamp(null);
          dispatch(setRefDemoTime(""));
        }, 30000);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error =======>>>", error);
      toast.error(error.toString());
    } finally {
      setRefreshBtnLoad(false);
    }
  }

  // this function is used to create a random token_key
  function generateTokenKey() {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    const secretKey = randomBytes.toString(CryptoJS.enc.Base64);
    setTokenKey(secretKey);
  }

  return (
    <div className={className.container}>
      <Grid container className={className.gridContainer}>
        {loader ? (
          <Grid
            item
            style={{
              height: "50vh",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MainLoader />
          </Grid>
        ) : (
          <>
            <Grid
              container
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Grid item display={"flex"} alignItems={"center"}>
                <BackBtn handleClick={() => handleClick("cancel")} />
                <Typography variant="title" style={{ color: color.primary }}>
                  {isEdit || userType === "org_admin" ? "Edit " : "Add "}
                  {userType === "super_admin" ? "Client" : "Organization"}
                </Typography>
              </Grid>
              {hasUAT && userType === "org_admin" && (
                <Grid item xs={5} sm={3.5} md={2.5} lg={2}>
                  <Tooltip
                    arrow
                    title={
                      isButtonDisabled
                        ? `Button will be re-enabled at: ${new Date(
                            timestamp + 30000
                          ).toLocaleTimeString()}`
                        : "The action of Refreshing Demo Data does not impact any data in the production environment. However, this process will remove all existing data from the UAT environment and replace it with refreshed sample patients and event"
                    }
                  >
                    <div>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => refreshDemoData()}
                        disabled={isButtonDisabled || refreshBtnLoad}
                      >
                        {refreshBtnLoad ? (
                          <CircularProgress size={22} />
                        ) : (
                          "Refresh UAT instance data"
                        )}
                      </Button>
                    </div>
                  </Tooltip>
                </Grid>
              )}
            </Grid>

            {/* field container */}
            <Grid
              container
              style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
            >
              {/* name field */}
              <Grid item id={"name"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter name"
                    value={name}
                    error={errObj.nameErr}
                    helperText={errObj.nameErr ? errObj.nameMsg : null}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrObj({ ...errObj, nameErr: false, nameMsg: "" });
                    }}
                    inputProps={{ maxLength: 100 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Organization
                            fill={errObj.nameErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* domain field */}
              <Grid item id={"domain"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Domain"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    disabled={isEdit}
                    placeholder="Enter domain"
                    value={domain}
                    error={errObj.domainErr}
                    helperText={errObj.domainErr ? errObj.domainMsg : null}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setErrObj({ ...errObj, domainErr: false, domainMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Domain
                            style={{
                              color: errObj.domainErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* phone field*/}
              <Grid item id={"phone"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Phone"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter phone No."
                    className={className.numberInput}
                    error={errObj.phoneErr}
                    helperText={errObj.phoneErr ? errObj.phoneMsg : null}
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
                            fill={errObj.phoneErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* email field */}
              <Grid item id={"email"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Email"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter email"
                    value={email}
                    error={errObj.emailErr}
                    helperText={errObj.emailErr ? errObj.emailMsg : null}
                    onChange={(e) => {
                      setEmail(e.target.value.trim());
                      setErrObj({ ...errObj, emailErr: false, emailMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            fill={errObj.emailErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* website field */}
              <Grid item id={"website"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Website"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter website"
                    value={website}
                    error={errObj.websiteErr}
                    helperText={errObj.websiteErr ? errObj.websiteMsg : null}
                    onChange={(e) => {
                      setWebsite(e.target.value.trim());
                      setErrObj({
                        ...errObj,
                        websiteErr: false,
                        websiteMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LanguageOutlined
                            style={{
                              color: errObj.websiteErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* license date field */}
              {userType === "super_admin" && (
                <Grid item xs={12} sm={5.8} id="date">
                  <Grid item xs={12}>
                    <CTypography required title={"License Date"} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={errObj.dateErr}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                          sx={{
                            width: "100%",
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
                          InputProps={{
                            disableUnderline: true,
                          }}
                          fullWidth
                          showToolbar={false}
                          disablePast
                          value={date}
                          views={["year", "month", "day"]}
                          onChange={(newValue) => {
                            setDate(newValue);
                            setErrObj({
                              ...errObj,
                              dateErr: false,
                              dateMsg: "",
                            });
                          }}
                          onError={(error) => {
                            if (!isNull(error)) {
                              setDateError(true);
                            } else {
                              setDateError(false);
                            }
                          }}
                          DialogProps={{ className: className.datePicker }}
                          slots={{
                            toolbar: "hidden",
                            openPickerIcon: () => (
                              <DateIcon
                                height={20}
                                width={20}
                                fill={
                                  errObj?.dateErr ? color.error : color.primary
                                }
                              />
                            ),
                          }}
                          slotProps={{
                            inputAdornment: {
                              position: "start",
                            },
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
                      {errObj?.dateErr ? (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.dateMsg}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {/* address field */}
              <Grid item id={"address"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Address"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter address"
                    value={address}
                    error={errObj.addressErr}
                    helperText={errObj.addressErr ? errObj.addressMsg : null}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setErrObj({
                        ...errObj,
                        addressErr: false,
                        addressMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnOutlined
                            style={{
                              color: errObj.addressErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* city field */}
              <Grid item id={"city"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"City"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter city"
                    value={city}
                    error={errObj.cityErr}
                    helperText={errObj.cityErr ? errObj.cityMsg : null}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setErrObj({ ...errObj, cityErr: false, cityMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <City
                            fill={errObj.cityErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* country field */}
              <Grid item id={"country"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography required title={"Country"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter country"
                    value={country}
                    error={errObj.countryErr}
                    helperText={errObj.countryErr ? errObj.countryMsg : null}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setErrObj({
                        ...errObj,
                        countryErr: false,
                        countryMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PublicOutlined
                            style={{
                              color: errObj.countryErr
                                ? color.error
                                : color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* Contact_Person field */}
              <Grid item id={"contactP"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography title={"Contact Person"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter contact person"
                    value={contactPerson}
                    error={errObj.contactPersonErr}
                    helperText={
                      errObj.contactPersonErr ? errObj.contactPersonMsg : null
                    }
                    inputProps={{ maxLength: 10 }}
                    onChange={(e) => {
                      setContactPerson(
                        !Number.isNaN(Number(e.target.value))
                          ? e.target.value.trim()
                          : contactPerson.trim()
                      );
                      setErrObj({
                        ...errObj,
                        contactPersonErr: false,
                        contactPersonMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone
                            fill={
                              errObj.contactPersonErr
                                ? color.error
                                : color.primary
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* other field */}
              <Grid item id={"other"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography title={"Other"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Other"
                    value={other}
                    error={errObj.otherErr}
                    helperText={errObj.otherErr ? errObj.otherMsg : null}
                    onChange={(e) => {
                      setOther(e.target.value);
                      setErrObj({ ...errObj, otherErr: false, otherMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BsFileEarmarkPlus
                            style={{
                              color: color.primary,
                              paddingRight: 5,
                              fontSize: "22px",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              {/* database size dropdown */}
              {userType === "super_admin" && (
                <Grid item xs={12} sm={5.8}>
                  <Grid item>
                    <CTypography required title={"Size"} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={errObj.sizeErr}>
                      <Select
                        fullWidth
                        displayEmpty
                        value={databaseSize || ""}
                        onChange={(e) => {
                          setDatabaseSize(e.target.value);
                          setErrObj({
                            ...errObj,
                            sizeErr: false,
                            sizeMsg: "",
                          });
                        }}
                        style={{
                          color: !databaseSize ? color.placeholder : "",
                          minWidth: "auto",
                        }}
                        IconComponent={KeyboardArrowDown}
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: "40vh",
                            },
                          },
                        }}
                        startAdornment={
                          <InputAdornment position="start">
                            <DataManagement
                              fill={
                                errObj?.sizeErr ? color.error : color.primary
                              }
                              height={20}
                              width={20}
                            />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value={""} disabled hidden selected>
                          Select size
                        </MenuItem>
                        <MenuItem value={"S"}>Small</MenuItem>
                        <MenuItem value={"M"}>Medium</MenuItem>
                        <MenuItem value={"L"}>Large</MenuItem>
                        <MenuItem value={"XL"}>Extra Large</MenuItem>
                      </Select>
                      {errObj?.sizeErr ? (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.sizeMsg}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                </Grid>
              )}

              {!isEdit && userType === "super_admin" && (
                <Grid item id={"token"} xs={12} sm={5.8}>
                  <Grid item xs={12}>
                    <CTypography required title={"Token"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter token key"
                      value={tokenKey}
                      disabled={isEdit && !isEmpty(tokenKey)}
                      error={errObj.tokenErr}
                      helperText={errObj.tokenErr ? errObj.tokenMsg : null}
                      onChange={(e) => {
                        setTokenKey(e.target.value.trim());
                        setErrObj({
                          ...errObj,
                          tokenErr: false,
                          tokenMsg: "",
                        });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TokenIcon
                              style={{
                                color: errObj.tokenErr
                                  ? color.error
                                  : color.primary,
                                paddingRight: 5,
                                fontSize: "22px",
                              }}
                            />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <Button
                              variant="contained"
                              style={{
                                fontSize: 10,
                                backgroundColor: color.green,
                              }}
                              onClick={() => {
                                setErrObj({
                                  ...errObj,
                                  tokenErr: false,
                                  tokenMsg: "",
                                });
                                generateTokenKey();
                              }}
                            >
                              Generate
                            </Button>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              )}

              {/* tfa */}
              <Tooltip
                title="Enabling Two-Factor Authentication will make it required for all Users logging into your organization on the web."
                arrow
              >
                <Grid item xs={12} sm={5.8}>
                  <Grid item>
                    <CTypography required title={"Two Factor Authentication"} />
                  </Grid>
                  <Grid item xs={12}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={tfa || ""}
                      onChange={(e) => {
                        setTfa(e.target.value);
                      }}
                      style={{
                        color: isEmpty(tfa) ? color.placeholder : "",
                      }}
                      MenuProps={{
                        PaperProps: {
                          style: {
                            maxHeight: "40vh",
                          },
                        },
                      }}
                      IconComponent={KeyboardArrowDown}
                      startAdornment={
                        <InputAdornment position="start">
                          <TFA fill={color.primary} />
                        </InputAdornment>
                      }
                    >
                      <MenuItem value={""} disabled hidden selected>
                        Select 2FA
                      </MenuItem>
                      <MenuItem value="1">Enable</MenuItem>
                      <MenuItem value="0"> Disable</MenuItem>
                    </Select>
                  </Grid>
                </Grid>
              </Tooltip>
              {(userType === "super_admin" ||
                +data?.et_admin_status === 1 ||
                +data?.wr_admin_status === 1 ||
                +data?.dr_admin_status === 1) && (
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  display="flex"
                  alignItems={"center"}
                  gap={2}
                >
                  {userType === "super_admin" || data?.et_admin_status ? (
                    <Tooltip
                      title="Enable/Disable eye-tracking for entire organization"
                      arrow
                    >
                      <Grid item display="flex" flexDirection={"column"}>
                        <CTypography
                          title="Eye Tracking"
                          style={{ marginBottom: 0 }}
                        />
                        <Switch
                          checked={eyeTracking}
                          onChange={() => setEyeTracking(!eyeTracking)}
                        />
                      </Grid>
                    </Tooltip>
                  ) : null}
                  {userType === "super_admin" || data?.wr_admin_status ? (
                    <Tooltip
                      title="Enable/Disable the digit recall section for all Initial visit and Immediate post injury assessments, this will make these sections required for a Patient to complete."
                      arrow
                    >
                      <Grid item display="flex" flexDirection={"column"}>
                        <CTypography
                          title="Immediate Recall"
                          style={{ marginBottom: 0 }}
                        />
                        <Switch
                          checked={wordRecall}
                          onChange={() => setWordRecall(!wordRecall)}
                        />
                      </Grid>
                    </Tooltip>
                  ) : null}
                  {userType === "super_admin" || data?.dr_admin_status ? (
                    <Tooltip
                      title="Enable/Disable the immediate recall section for all Initial visit and Immediate post injury assessments, this will make these sections required for a Patient to complete."
                      arrow
                    >
                      <Grid item display="flex" flexDirection={"column"}>
                        <CTypography
                          title="Digit Recall"
                          style={{ marginBottom: 0 }}
                        />
                        <Switch
                          checked={digitRecall}
                          onChange={() => setDigitRecall(!digitRecall)}
                        />
                      </Grid>
                    </Tooltip>
                  ) : null}
                </Grid>
              )}

              {/* image upload field */}
              <Grid item id={"image"} xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography title={"User Photo"} />
                </Grid>
                <Grid
                  item
                  xs={12}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <UploadFile
                    file={file}
                    handleFile={(e) => {
                      setFile(e);
                    }}
                    handleSelectedFile={(e) => {
                      setSelectedFile(e.target.files[0]);
                    }}
                    clearable
                    handleClear={() => {
                      setSelectedFile(null);
                      setFile(null);
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              gap={2}
              display="flex"
              justifyContent={"center"}
              alignItems={"center"}
              wrap="nowrap"
              margin={"16px 0px"}
            >
              <Grid item xs={1}>
                <Button
                  fullWidth
                  variant={"contained"}
                  className={className.btnStyle}
                  onClick={() => validation()}
                  disabled={btnLoad || !isOnline}
                >
                  {btnLoad ? (
                    <CircularProgress size={22} />
                  ) : isEdit ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </Grid>
              <Grid item xs={1}>
                <Button
                  fullWidth
                  variant={"outlined"}
                  className={className.btnStyle}
                  onClick={() => handleClick("cancel")}
                >
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </div>
  );
};

export default AddOrganizationForm;
