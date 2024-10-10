import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown, TitleOutlined } from "@mui/icons-material";
import styles from "./styles";
import theme, { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull, isNumber, isObject, isUndefined } from "lodash";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { roleArr, sexArr, titleArr } from "../../../Config/Static_Data";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import UploadFile from "../../UploadFile";
import { useSearchParams } from "react-router-dom";
import MainLoader from "../../Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Email from "../../CustomIcon/Global/Email";
import Profile from "../../CustomIcon/Global/Profile";
import Phone from "../../CustomIcon/Global/Phone";
import Images from "../../../Config/Images";
import Sex from "../../CustomIcon/Global/Sex";
import Info from "../../CustomIcon/Global/Info";
import DateIcon from "../../CustomIcon/Global/DOB";
import { addHours } from "date-fns";
import { convertToIST } from "../../../Utils/CommonFunctions";

const errorObj = {
  fNameErr: false,
  fNameMsg: "",
  lNameErr: false,
  lNameMsg: "",
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
  genderErr: false,
  genderMsg: "",
  dobErr: false,
  dobMsg: "",
  orgErr: false,
  orgMsg: "",
  roleErr: false,
  roleMsg: "",
  providerErr: false,
  providerMsg: "",
  titleErr: false,
  titleMsg: "",
  dNameErr: false,
  dNameMsg: "",
  startTimeErr: false,
  startTimeMsg: "",
};

export default function AddProviders(props) {
  const { handleClick = () => null } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const className = styles();
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [errObj, setErrObj] = useState(errorObj);
  const [credential, setCredentials] = useState("");
  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [gender, setGender] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [role, setRole] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState({});
  const [check, setCheck] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);

  useEffect(() => {
    document
      .querySelector("#top")
      .scrollIntoView({ behavior: "auto", block: "end" });

    if (searchParams.has("id")) {
      providerDataApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, []);

  const setData = (editData) => {
    if (!isNull(editData?.firstname) || !isEmpty(editData?.firstname)) {
      setFname(editData?.firstname);
    }
    if (!isNull(editData?.lastname) || !isEmpty(editData?.lastname)) {
      setLname(editData?.lastname);
    }
    if (!isNull(editData?.phone) || !isEmpty(editData?.phone)) {
      setPhone(editData?.phone);
    }
    if (!isNull(editData?.email) || !isEmpty(editData?.email)) {
      setEmail(editData?.email);
    }
    if (!isNull(editData?.sex) || !isEmpty(editData?.sex)) {
      setGender(editData?.sex);
    }

    if (
      (!isNull(editData?.dob) && !isUndefined(editData?.dob)) ||
      !isEmpty(editData?.dob)
    ) {
      const convertedDOB = convertToIST(editData?.dob);
      setDob(convertedDOB);
    }

    if (!isNull(editData?.title) || !isEmpty(editData?.title)) {
      setTitle(editData?.title);
    }
    if (!isNull(editData?.credentials) || !isEmpty(editData?.credentials)) {
      setCredentials(editData?.credentials);
    }
    if (!isNull(editData?.role_slug) || !isEmpty(editData?.role_slug)) {
      setRole(editData?.role_slug);
    }

    if (!isNull(editData?.profile_pic) || !isEmpty(editData?.profile_pic)) {
      setFile(editData?.profile_pic);
      setSelectedFile(editData?.profile_pic);
    }
    if (
      !isNull(editData?.asmt_window_start_tm) ||
      !isEmpty(editData?.asmt_window_start_tm)
    ) {
      const convertedTime = convertToTimePickerValue(
        editData?.asmt_window_start_tm
      );
      setStartTime(convertedTime);
    }
    if (
      !isNull(editData?.asmt_window_end_tm) ||
      !isEmpty(editData?.asmt_window_end_tm)
    ) {
      const convertedTime = convertToTimePickerValue(
        editData?.asmt_window_end_tm
      );
      setEndTime(convertedTime);
    }
  };

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isNull(fName) || isEmpty(fName)) {
      valid = false;
      error.fNameErr = true;
      error.fNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }

    if (isNull(lName) || isEmpty(lName)) {
      valid = false;
      error.lNameErr = true;
      error.lNameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
      }
    }

    if (isNull(startTime)) {
      valid = false;
      error.startTimeErr = true;
      error.startTimeMsg = "Please select start time.";
      scroll = true;
      section = document.querySelector("#time");
    }

    if (check && (isNull(phone) || isEmpty(phone))) {
      valid = false;
      error.phoneErr = true;
      error.phoneMsg = "Please enter phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#phone");
      }
    } else if (check && phone.length < 10) {
      valid = false;
      error.phoneErr = true;
      error.phoneMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#phone");
      }
    }
    if (check && (isNull(email) || isEmpty(email))) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#email");
      }
    } else if (check && !email_Regex.test(email)) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter valid email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#email");
      }
    }

    if (check && isNull(dob)) {
      valid = false;
      error.dobErr = true;
      error.dobMsg = "Please select date of birth";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#dob");
      }
    } else if (dobError) {
      valid = false;
      error.dobErr = true;
      error.dobMsg = "Please select valid date of birth";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#dob");
      }
    }
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate()
    );
    if (minDate <= dob) {
      valid = false;
      error.dobErr = true;
      error.dobMsg = "Date must be within 15 years from today.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#dob");
      }
    }

    if (check && isEmpty(gender)) {
      valid = false;
      error.genderErr = true;
      error.genderMsg = "Please select sex";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#gender");
      }
    }

    if (check && isEmpty(role)) {
      valid = false;
      error.roleErr = true;
      error.roleMsg = "Please select role";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#role");
      }
    }

    setErrObj(error);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (valid) {
      addProviderApi();
    }
  }

  //convert to timestamps from spi response
  const convertToTimePickerValue = (timeString) => {
    timeString = moment.utc(timeString, "HH:mm").local().format("HH:mm");
    const [hours, minutes] = timeString.split(":");
    const currentDate = new Date();
    currentDate.setHours(parseInt(hours, 10));
    currentDate.setMinutes(parseInt(minutes, 10));
    return currentDate;
  };
  async function addProviderApi() {
    setBtnLoad(true);
    const date = moment(dob).format("YYYY-MM-DD");
    let start = moment.utc(startTime).format("HH:mm");
    let end = moment.utc(endTime).format("HH:mm");
    const data = {
      title: title || "",
      credentials: credential,
      checked: (isNull(editData?.provider_uid) || !isEdit) && check ? 1 : 0,
      firstname: fName?.trim(),
      lastname: lName?.trim(),
      phone_number: phone,
      email: email,
      dob: date,
      sex: gender,
      role_slug: role,
      profile_pic: selectedFile || [],
      asmt_window_end_tm: end,
      asmt_window_start_tm: start,
    };

    if (isEdit) {
      data["id"] = editData?.id;
    }

    const data1 = {
      title: title,
      credentials: credential,
      firstname: fName?.trim(),
      lastname: lName?.trim(),
      checked: check ? 1 : 0,
      asmt_window_end_tm: end,
      asmt_window_start_tm: start,
    };
    if (isEdit) {
      data1["id"] = editData?.id;
    }
    try {
      const response = await getAPIProgressData(
        isEdit
          ? Setting?.endpoints?.providerUpdate
          : Setting.endpoints.providerCreate,
        isEdit ? "PATCH" : "POST",
        check ? data : data1,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("success", response?.data?.provider_id);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("err=====>>>>>", err);
    } finally {
      setBtnLoad(false);
    }
  }

  async function providerDataApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.providerList}?page=${1}&id=${id}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          if (response?.data?.provider_uid) {
            setCheck(true);
          }
          setIsEdit(true);
          setEditData(response?.data);
          setData(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setLoader(false);
    }
  }

  const validateDate = (date) => {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate()
    );
    return date >= minDate;
  };

  return (
    <div className={className.container}>
      <Grid container className={className.gridContainer}>
        {loader ? (
          <Grid
            style={{
              width: "100%",
              height: "50vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MainLoader />
          </Grid>
        ) : (
          <>
            <Grid container alignItems={"center"}>
              <BackBtn handleClick={() => handleClick("cancel")} />
              <Typography variant="title" style={{ color: color.primary }}>
                {isEdit ? `Edit Provider` : `Add Provider`}
              </Typography>
            </Grid>

            {/* field container */}
            <Grid
              container
              style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
              id="top"
            >
              {/* Title field */}
              <Grid item xs={12} sm={5.8} id="title">
                <Grid item xs={12}>
                  <CTypography title={"Title"} />
                </Grid>
                <Grid item xs={12}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={title || ""}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{
                      color: isEmpty(title) ? color.placeholder : "",
                    }}
                    IconComponent={KeyboardArrowDown}
                    startAdornment={
                      <InputAdornment position="start">
                        <TitleOutlined style={{ color: color.primary }} />
                      </InputAdornment>
                    }
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "40vh",
                        },
                      },
                    }}
                  >
                    <MenuItem value="" hidden disabled selected>
                      Select title
                    </MenuItem>
                    {titleArr.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Grid>
              </Grid>
              {/* credential field */}
              <Grid item xs={12} sm={5.8}>
                <Grid item xs={12}>
                  <CTypography title={"Credentials"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter credentials"
                    inputProps={{ maxLength: 100 }}
                    value={credential}
                    onChange={(e) => {
                      setCredentials(e.target.value.trim());
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Profile fill={color.primary} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
              {/* firstname field */}
              <Grid item xs={12} sm={5.8} id="fname">
                <Grid item xs={12}>
                  <CTypography required title={"First name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter first name"
                    inputProps={{ maxLength: 100 }}
                    value={fName}
                    onChange={(e) => {
                      setFname(e.target.value);
                      setErrObj({ ...errObj, fNameErr: false, fNameMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Profile
                            fill={errObj.fNameErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.fNameErr}
                    helperText={errObj.fNameMsg}
                  />
                </Grid>
              </Grid>
              {/* last name field */}
              <Grid item xs={12} sm={5.8} id="lname">
                <Grid item xs={12}>
                  <CTypography required title={"Last name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter last name"
                    inputProps={{ maxLength: 100 }}
                    value={lName}
                    onChange={(e) => {
                      setLname(e.target.value);
                      setErrObj({ ...errObj, lNameErr: false, lNameMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Profile
                            fill={errObj.lNameErr ? color.error : color.primary}
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.lNameErr}
                    helperText={errObj.lNameMsg}
                  />
                </Grid>
              </Grid>

              <Grid
                container
                id="time"
                xs={12}
                style={{
                  marginTop: 10,
                  marginBottom: 10,
                }}
              >
                <Grid item xs={12}>
                  <CTypography
                    isDot
                    required
                    variant={"tableTitle"}
                    title="Select assessment window (4 hours)"
                  />
                </Grid>
                <Grid
                  item
                  display={"flex"}
                  xs={12}
                  gap={2}
                  wrap="nowrap"
                  marginTop={"20px"}
                >
                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <FormControl fullWidth error={errObj?.startTimeErr}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker
                          value={startTime}
                          onChange={(newValue) => {
                            setStartTime(newValue);
                            setEndTime(addHours(newValue, 4));
                            setErrObj({
                              ...errObj,
                              startTimeErr: false,
                              startTimeMsg: "",
                            });
                          }}
                          ampmInClock={true}
                        />
                        {errObj?.startTimeErr && (
                          <FormHelperText style={{ color: color.error }}>
                            {errObj?.startTimeMsg}
                          </FormHelperText>
                        )}
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6} sm={4} md={3} lg={2}>
                    <FormControl fullWidth>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <TimePicker value={endTime} disabled />
                      </LocalizationProvider>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>

              {/* Checkbox */}
              {(isNull(editData?.provider_uid) || !isEdit) && (
                <Grid
                  item
                  xs={12}
                  display={"flex"}
                  alignItems={"center"}
                  marginBottom={3}
                >
                  <FormControlLabel
                    style={{ paddingTop: 0, marginRight: 0 }}
                    control={
                      <Checkbox
                        disabled={isNumber(editData?.provider_uid)}
                        checked={check}
                        onChange={() => setCheck(!check)}
                        size="medium"
                      />
                    }
                    label="Create User"
                  />
                  {check ? (
                    <div style={{ lineHeight: 0, marginLeft: 5 }}>
                      <Info fill={color.gray} />
                    </div>
                  ) : (
                    <Tooltip
                      title="Click the checkbox to create a user for this provider"
                      arrow
                    >
                      <div style={{ lineHeight: 0, marginLeft: 5 }}>
                        <Info fill={color.gray} />
                      </div>
                    </Tooltip>
                  )}
                </Grid>
              )}
              {(isNull(editData?.provider_uid) || !isEdit) && check && (
                <>
                  {/* phone field*/}
                  <Grid item xs={12} sm={5.8} id="phone">
                    <Grid item xs={12}>
                      <CTypography required title={"Phone"} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        placeholder="Enter phone no."
                        value={phone}
                        disabled={isNumber(editData?.provider_uid)}
                        onChange={(e) => {
                          setPhone(
                            e.target.value.replace(
                              Setting.JS_Regex.numberRegex,
                              ""
                            )
                          );
                          setErrObj({
                            ...errObj,
                            phoneErr: false,
                            phoneMsg: "",
                          });
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
                  {/* email field */}
                  <Grid item xs={12} sm={5.8} id="email">
                    <Grid item xs={12}>
                      <CTypography required title={"Email"} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        placeholder="Enter email"
                        value={email}
                        disabled={isNumber(editData?.provider_uid)}
                        onChange={(e) => {
                          setEmail(e.target.value.trim());
                          setErrObj({
                            ...errObj,
                            emailErr: false,
                            emailMsg: "",
                          });
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
                  {/* Sex field */}
                  <Grid item xs={12} sm={5.8} id="gender">
                    <Grid item xs={12}>
                      <CTypography required title={"Sex"} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={errObj.genderErr}>
                        <Select
                          fullWidth
                          displayEmpty
                          value={gender || ""}
                          disabled={isNumber(editData?.provider_uid)}
                          onChange={(e) => {
                            setGender(e.target.value);
                            setErrObj({
                              ...errObj,
                              genderErr: false,
                              genderMsg: "",
                            });
                          }}
                          style={{
                            color: isEmpty(gender) ? color.placeholder : "",
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: "40vh",
                              },
                            },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <Sex
                                fill={
                                  errObj?.sexErr ? color.error : color.primary
                                }
                              />
                            </InputAdornment>
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value={""} disabled hidden selected>
                            Select sex
                          </MenuItem>
                          {sexArr.map((item, index) => {
                            return (
                              <MenuItem key={index} value={item?.id}>
                                {item?.name}
                              </MenuItem>
                            );
                          })}
                        </Select>
                        {errObj?.genderErr ? (
                          <FormHelperText>{errObj?.genderMsg}</FormHelperText>
                        ) : null}
                      </FormControl>
                    </Grid>
                  </Grid>
                  {/* DOB field */}
                  <Grid item xs={12} sm={5.8} id="dob">
                    <Grid item xs={12}>
                      <CTypography required title={"Date of Birth"} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={errObj.dobErr}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                          <DatePicker
                            disabled={isNumber(editData?.provider_uid)}
                            sx={{
                              width: "100%",
                              "& .MuiOutlinedInput-root": {
                                border: errObj.dobErr && "1px solid red",
                              },
                              "& .Mui-focused": {
                                border:
                                  errObj.dobErr && "1px solid red !important",
                                outline: errObj.dobErr && "1px solid red",
                              },
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: errObj.dobErr && "none",
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
                            disableFuture
                            value={dob}
                            views={["year", "month", "day"]}
                            shouldDisableDate={(date) => validateDate(date)}
                            shouldDisableMonth={(date) => validateDate(date)}
                            shouldDisableYear={validateDate}
                            onChange={(newValue) => {
                              setDob(newValue);
                              setErrObj({
                                ...errObj,
                                dobErr: false,
                                dobMsg: "",
                              });
                            }}
                            onError={(error) => {
                              if (!isNull(error)) {
                                setDobError(true);
                              } else {
                                setDobError(false);
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
                                    errObj?.dobErr ? color.error : color.primary
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
                        {errObj?.dobErr ? (
                          <FormHelperText style={{ color: color.error }}>
                            {errObj?.dobMsg}
                          </FormHelperText>
                        ) : null}
                      </FormControl>
                    </Grid>
                  </Grid>
                  {/* Role field */}
                  <Grid item xs={12} sm={5.8} id="role">
                    <Grid item xs={12}>
                      <CTypography required title={"Role"} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth error={errObj.roleErr}>
                        <Select
                          fullWidth
                          displayEmpty
                          value={role || ""}
                          disabled={isNumber(editData?.provider_uid)}
                          onChange={(e) => {
                            setRole(e.target.value);
                            setErrObj({
                              ...errObj,
                              roleErr: false,
                              roleMsg: "",
                            });
                          }}
                          style={{
                            color: isEmpty(role) ? color.placeholder : "",
                          }}
                          MenuProps={{
                            PaperProps: {
                              style: {
                                maxHeight: "40vh",
                              },
                            },
                          }}
                          startAdornment={
                            <InputAdornment position="start">
                              <img
                                src={Images.roles}
                                style={{
                                  width: 20,
                                  height: 20,
                                }}
                                alt={"role"}
                              />
                            </InputAdornment>
                          }
                          IconComponent={KeyboardArrowDown}
                        >
                          <MenuItem value={""} disabled hidden selected>
                            Select role
                          </MenuItem>
                          {roleArr.map((item, index) => {
                            if (
                              item?.role_slug === "super_admin" ||
                              item?.role_slug === "patient"
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
                        {errObj?.roleErr ? (
                          <FormHelperText>{errObj?.roleMsg}</FormHelperText>
                        ) : null}
                      </FormControl>
                    </Grid>
                  </Grid>

                  {/* image upload field */}
                  <Grid item xs={12} sm={5.8}>
                    <Grid item>
                      <CTypography title={"User Photo"} />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      style={{ display: "flex", alignItems: "center" }}
                    >
                      <UploadFile
                        disabled={isNumber(editData?.provider_uid)}
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
                </>
              )}
            </Grid>

            <Grid
              item
              gap={2}
              xs={12}
              display="flex"
              wrap={"nowrap"}
              justifyContent={"center"}
              alignItems={"center"}
              margin={"16px 0px"}
            >
              <Grid item xs={1}>
                <Button
                  fullWidth
                  variant={"contained"}
                  className={className.btnStyle}
                  onClick={() => validation()}
                  disabled={btnLoad}
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
}
