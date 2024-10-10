import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { AddOutlined, KeyboardArrowDown } from "@mui/icons-material";
import theme, { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isArray, isEmpty, isNull, isNumber, isObject } from "lodash";
import { getAPIProgressData, getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { useDispatch } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  genderArr,
  pronounsArr,
  seasonArr,
  sexArr,
} from "../../../Config/Static_Data";
import moment from "moment";
import UploadFile from "../../UploadFile";
import styles from "./styles";
import { useSearchParams } from "react-router-dom";
import MainLoader from "../../Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Email from "../../CustomIcon/Global/Email";
import Profile from "../../CustomIcon/Global/Profile";
import Phone from "../../CustomIcon/Global/Phone";
import Images from "../../../Config/Images";
import Sex from "../../CustomIcon/Global/Sex";
import Pronouns from "../../CustomIcon/Global/Pronouns";
import Gender from "../../CustomIcon/Global/Gender";
import DateIcon from "../../CustomIcon/Global/DOB";
import Calendar from "../../CustomIcon/Header/Calendar";
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
  gphoneErr: false,
  gphoneMsg: "",
  gemailErr: false,
  gemailMsg: "",
  sexErr: false,
  sexMsg: "",
  genderErr: false,
  genderMsg: "",
  otherErr: false,
  otherMsg: "",
  dobErr: false,
  dobMsg: "",
  orgErr: false,
  orgMsg: "",
  roleErr: false,
  roleMsg: "",
  providerErr: false,
  providerMsg: "",
  dNameMsg: "",
};

export default function AddPatientsForm(props) {
  const { handleClick = () => null } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const className = styles();
  const { setDrawerList } = authActions;
  const dispatch = useDispatch();
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [errObj, setErrObj] = useState(errorObj);
  const [fName, setFname] = useState("");
  const [mName, setMname] = useState("");
  const [lName, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gPhone, setGphone] = useState("");
  const [gEmail, setGemail] = useState("");
  const [dob, setDob] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [sex, setSex] = useState("");
  const [gender, setGender] = useState("");
  const [other, setOther] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [provider, setProvider] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState("");
  const [sportList, setSportList] = useState([]);
  const [sport, setSport] = useState([]);
  const [graduationYear, setGraduationYear] = useState(null);
  const [graduationSeason, setGraduationSeason] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [providersList, setProvidersList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [data, setData] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    document
      .querySelector("#fname")
      .scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    providersApi();
    getSportListApi();
  }, []);

  useEffect(() => {
    if (searchParams.has("id")) {
      getPatient(Number(EncDctFn(searchParams.get("id"), "decrypt")));
      setIsEdit(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEdit) {
      editData();
    }
  }, [data]);

  function editData() {
    if (!isNull(data?.firstname) || !isEmpty(data?.firstname)) {
      setFname(data?.firstname);
    }
    if (!isNull(data?.lastname) || !isEmpty(data?.lastname)) {
      setLname(data?.lastname);
    }
    if (!isNull(data?.middlename) || !isEmpty(data?.middlename)) {
      setMname(data?.middlename);
    }
    if (data?.pronouns) {
      setPronouns(data?.pronouns);
    }
    if (!isNull(data?.provider_id) || !isEmpty(data?.provider_id)) {
      setProvider(data?.provider_id);
    }
    if (!isNull(data?.title) || !isEmpty(data?.title)) {
      setTitle(data?.title);
    }
    if (!isNull(data?.provider_title) || !isEmpty(data?.provider_title)) {
      setTitle(data?.provider_title);
    }
    if (!isNull(data?.guardian_phone) && !isEmpty(data?.guardian_phone)) {
      setGphone(data?.guardian_phone);
    }
    if (!isNull(data?.guardian_email) && !isEmpty(data?.guardian_email)) {
      setGemail(data?.guardian_email);
    }
    if (!isNull(data?.dob) || !isEmpty(data?.dob)) {
      const convertedDOB = convertToIST(data?.dob);
      setDob(convertedDOB);
    }
    if (!isNull(data?.phone) || !isEmpty(data?.phone)) {
      setPhone(data?.phone);
    }
    if (!isNull(data?.email) || !isEmpty(data?.email)) {
      setEmail(data?.email);
    }
    if (!isNull(data?.sex) || !isEmpty(data?.sex)) {
      setSex(data?.sex);
    }
    if (!isNull(data?.gender) || !isEmpty(data?.gender)) {
      if (data?.gender === "Male" || data?.gender === "Female") {
        setGender(data?.gender);
      } else {
        setGender("Other");
        setOther(
          data?.gender !== "Male" || data?.gender !== "Female"
            ? data?.gender
            : ""
        );
      }
    }
    if (!isNull(data?.profile_pic) && !isEmpty(data?.profile_pic)) {
      setFile(data?.profile_pic);
      setSelectedFile(data?.profile_pic);
    }

    if (!isEmpty(data?.sport_ids) || isArray(data?.sport_ids)) {
      const flt = sportList.filter((item) =>
        data?.sport_ids?.includes(item?.id)
      );
      setSport(flt);
    }

    const year =
      !isNull(data?.graduation_year) || isNumber(data?.graduation_year)
        ? new Date(data?.graduation_year?.toString())
        : null;
    if (!isNull(data?.graduation_year) && isNumber(data?.graduation_year)) {
      setGraduationYear(year);
    }

    if (!isNull(data?.graduation_season) && !isEmpty(data?.graduation_season)) {
      setGraduationSeason(data?.graduation_season);
    }
  }

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isEmpty(fName.trim())) {
      valid = false;
      error.fNameErr = true;
      error.fNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }

    if (isEmpty(lName.trim())) {
      valid = false;
      error.lNameErr = true;
      error.lNameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
      }
    }

    if (isEmpty(phone.trim())) {
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
    if (isEmpty(email.trim())) {
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
    if (!isEmpty(gPhone) && gPhone.length < 10) {
      valid = false;
      error.gphoneErr = true;
      error.gphoneMsg = "Please enter valid guardian's phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#gphone");
      }
    }
    if (!isEmpty(gEmail) && !email_Regex.test(gEmail)) {
      valid = false;
      error.gemailErr = true;
      error.gemailMsg = "Please enter valid guardian's email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#gemail");
      }
    }

    if (isNull(dob)) {
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

    if (isEmpty(sex)) {
      valid = false;
      error.sexErr = true;
      error.sexMsg = "Please select sex";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#sex");
      }
    }

    if (gender === "Other" && isEmpty(other)) {
      valid = false;
      error.otherErr = true;
      error.otherMsg = "Please enter other gender";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#other");
      }
    }

    if (!provider) {
      valid = false;
      error.providerErr = true;
      error.providerMsg = "Please select provider";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#provider");
      }
    }

    setErrObj(error);

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (valid) {
      addUserFormApiCall();
    }
  }

  async function addUserFormApiCall() {
    setBtnLoad(true);

    const date = moment(dob).format("YYYY-MM-DD");
    const sportIds = sport.map((item) => item?.id);
    const gYear = !isNull(graduationYear)
      ? moment(graduationYear).format("yyyy")
      : "";

    const data = {
      firstname: fName?.trim(),
      middlename: mName?.trim(),
      lastname: lName?.trim(),
      phone_number: phone,
      emergency_phone: gPhone,
      emergency_email: gEmail,
      email: email,
      dob: date,
      sex: sex,
      gender: gender === "Other" ? other : gender,
      pronouns: pronouns,
      role_slug: "patient",
      provider_id: provider,
      title: title || "",
      profile_pic: selectedFile || [],
      sports_id: sportIds || [],
      graduation_year: gYear,
      graduation_season: graduationSeason,
    };

    if (searchParams.has("id")) {
      data["user_id"] = Number(EncDctFn(searchParams.get("id"), "decrypt"));
    }

    try {
      const response = await getAPIProgressData(
        isEdit
          ? Setting?.endpoints?.updatePatient
          : Setting.endpoints.createPatient,
        isEdit ? "PATCH" : "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        dispatch(setDrawerList(true));
        handleClick("success");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      console.log("err=====>>>>>", err);
      toast.error(err.toString());
    }
  }

  async function providersApi() {
    setProvidersList([]);
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
      console.log("error=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function getSportListApi() {
    try {
      const response = await getApiData(
        Setting.endpoints.sportActiveList,
        "GET"
      );

      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setSportList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ getSportListApi ~ err==========>>>>>>>>>>", err);
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

  function getMinDate(date) {
    const fifteenYearsInMilliseconds = 15 * 365 * 24 * 60 * 60 * 1000;
    const futureDate = new Date(date?.getTime() + fifteenYearsInMilliseconds);
    return futureDate;
  }

  return (
    <Grid container className={className.gridContainer}>
      {loader ? (
        <Grid
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
            width: "100%",
          }}
        >
          <MainLoader />
        </Grid>
      ) : (
        <>
          <Grid container alignItems={"center"}>
            <BackBtn handleClick={() => handleClick("cancel")} />
            <Typography variant="title" style={{ color: color.primary }}>
              {isEdit ? "Edit Patient" : "Add Patient"}
            </Typography>
          </Grid>

          {/* field container */}
          <Grid
            container
            style={{
              margin: 16,
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            {/* first name field */}
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
            {/* middle name field */}
            <Grid item xs={12} sm={5.8}>
              <Grid item>
                <CTypography title={"Middle name"} />
              </Grid>
              <Grid>
                <TextField
                  fullWidth
                  placeholder="Enter middle name"
                  inputProps={{ maxLength: 100 }}
                  value={mName}
                  onChange={(e) => {
                    setMname(e.target.value);
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
            {/* last name field */}
            <Grid item xs={12} sm={5.8} id="lname">
              <Grid item>
                <CTypography required title={"Last name"} />
              </Grid>
              <Grid item>
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
                  error={errObj.emailErr}
                  helperText={errObj.emailMsg}
                />
              </Grid>
            </Grid>
            {/* sex field */}
            <Grid item xs={12} sm={5.8} id="sex">
              <Grid item xs={12}>
                <CTypography required title={"Sex"} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={errObj.sexErr}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={sex || ""}
                    onChange={(e) => {
                      setSex(e.target.value);
                      setErrObj({ ...errObj, sexErr: false, sexMsg: "" });
                    }}
                    style={{
                      color: isEmpty(sex) ? color.placeholder : "",
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Sex
                          fill={errObj?.sexErr ? color.error : color.primary}
                        />
                      </InputAdornment>
                    }
                    IconComponent={KeyboardArrowDown}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "40vh",
                        },
                      },
                    }}
                  >
                    <MenuItem value={""} disabled hidden selected>
                      Select sex
                    </MenuItem>
                    {!isEmpty(sexArr) &&
                      isArray(sexArr) &&
                      sexArr.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item?.id}>
                            {item?.name}
                          </MenuItem>
                        );
                      })}
                  </Select>
                  {errObj?.sexErr ? (
                    <FormHelperText>{errObj?.sexMsg}</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>
            </Grid>
            {/*  Gender field */}
            <Grid item xs={12} sm={5.8} id="gender">
              <Grid item xs={12}>
                <CTypography title={"Gender"} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={errObj.genderErr}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={gender || ""}
                    onChange={(e) => {
                      setGender(e.target.value);
                      setErrObj({ ...errObj, genderErr: false, genderMsg: "" });
                    }}
                    style={{
                      color: isEmpty(gender) ? color.placeholder : "",
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <Gender
                          fill={errObj?.genderErr ? color.error : color.primary}
                        />
                      </InputAdornment>
                    }
                    IconComponent={KeyboardArrowDown}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "40vh",
                        },
                      },
                    }}
                  >
                    <MenuItem value={""} disabled hidden selected>
                      Select gender
                    </MenuItem>
                    {!isEmpty(genderArr) &&
                      isArray(genderArr) &&
                      genderArr.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item?.name}>
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
            {gender === "Other" && (
              <Grid item xs={12} sm={5.8} id="other">
                <Grid item xs={12}>
                  <CTypography required title={"Other (Gender)"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter gender"
                    value={other}
                    onChange={(e) => {
                      setOther(e.target.value);
                      setErrObj({ ...errObj, otherErr: false, otherMsg: "" });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AddOutlined
                            stroke={
                              errObj.phoneErr ? color.error : color.primary
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.otherErr}
                    helperText={errObj.otherMsg}
                  />
                </Grid>
              </Grid>
            )}
            {/* DOB field */}
            <Grid item xs={12} sm={5.8} id="dob">
              <Grid item xs={12}>
                <CTypography required title={"Date of Birth"} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={errObj.dobErr}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          border: errObj.dobErr && "1px solid red",
                        },
                        "& .Mui-focused": {
                          border: errObj.dobErr && "1px solid red !important",
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
                      onChange={(newValue) => {
                        setDob(newValue);
                        setErrObj({ ...errObj, dobErr: false, dobMsg: "" });
                      }}
                      DialogProps={{ className: className.datePicker }}
                      slots={{
                        toolbar: "hidden",
                        openPickerIcon: () => (
                          <DateIcon
                            height={20}
                            width={20}
                            fill={errObj?.dobErr ? color.error : color.primary}
                          />
                        ),
                      }}
                      slotProps={{
                        inputAdornment: {
                          position: "start",
                        },
                      }}
                      onError={(error) => {
                        if (!isNull(error)) {
                          setDobError(true);
                        } else {
                          setDobError(false);
                        }
                      }}
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

            {/* pronouns field */}
            <Grid item xs={12} sm={5.8} id="other">
              <Grid item xs={12}>
                <CTypography title={"Pronouns"} />
              </Grid>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  displayEmpty
                  value={pronouns || ""}
                  onChange={(e) => {
                    setPronouns(e.target.value);
                  }}
                  style={{
                    color: isEmpty(pronouns) ? color.placeholder : "",
                  }}
                  IconComponent={KeyboardArrowDown}
                  startAdornment={
                    <InputAdornment position="start">
                      <Pronouns fill={color.primary} />
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
                  <MenuItem value={""} disabled hidden selected>
                    Select pronouns
                  </MenuItem>
                  {!isEmpty(pronounsArr) &&
                    isArray(pronounsArr) &&
                    pronounsArr.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item?.id}>
                          {item?.name}
                        </MenuItem>
                      );
                    })}
                </Select>
              </Grid>
            </Grid>

            {/* provider field */}
            <Grid item xs={12} sm={5.8} id="provider">
              <Grid item xs={12}>
                <CTypography required title={"Provider"} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={errObj.providerErr}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={provider || ""}
                    onChange={(e) => {
                      setProvider(e.target.value);
                      setErrObj({
                        ...errObj,
                        providerErr: false,
                        providerMsg: "",
                      });
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <img
                          src={Images.providers}
                          style={{ width: 20, height: 20 }}
                          alt={"date"}
                        />
                      </InputAdornment>
                    }
                    IconComponent={KeyboardArrowDown}
                    style={{
                      color: provider ? "" : color.placeholder,
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "40vh",
                        },
                      },
                    }}
                  >
                    <MenuItem value={""} disabled hidden selected>
                      Select provider
                    </MenuItem>
                    {!isEmpty(providersList) &&
                      isArray(providersList) &&
                      providersList.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item?.id}>
                            {(item?.credentials ||
                            (item?.credentials && item?.title)
                              ? item?.title
                              : "") +
                              " " +
                              item?.firstname +
                              " " +
                              item?.lastname +
                              " " +
                              (item?.credentials || item?.credentials
                                ? item?.credentials
                                : "")}
                          </MenuItem>
                        );
                      })}
                  </Select>
                  {errObj?.providerErr ? (
                    <FormHelperText>{errObj?.providerMsg}</FormHelperText>
                  ) : null}
                </FormControl>
              </Grid>
            </Grid>

            {/* sport field */}
            <Grid item xs={12} sm={5.8} id="sport">
              <Grid item xs={12}>
                <CTypography title={"Sport"} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Autocomplete
                    fullWidth
                    multiple
                    disableCloseOnSelect
                    value={sport}
                    options={sportList}
                    getOptionLabel={(option) => option?.sport_name}
                    onChange={(e, v, r, b) => setSport(v)}
                    popupIcon={<KeyboardArrowDown />}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select sports" />
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>

            {/* graduation year */}
            <Grid item xs={12} sm={5.8} id="year">
              <Grid item xs={12}>
                <CTypography title={"Graduation Year"} />
              </Grid>
              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    sx={{
                      width: "100%",
                      "& .MuiSvgIcon-root": {
                        fontSize: 22,
                      },
                      "& .MuiIconButton-root:hover": {
                        backgroundColor: "transparent",
                      },
                    }}
                    showToolbar={false}
                    slots={{
                      toolbar: "hidden",
                      openPickerIcon: () => (
                        <Calendar height={20} width={20} fill={color.primary} />
                      ),
                    }}
                    slotProps={{
                      inputAdornment: {
                        position: "start",
                      },
                    }}
                    value={graduationYear}
                    minDate={getMinDate(dob)}
                    views={["year"]}
                    onChange={(newValue) => {
                      setGraduationYear(newValue);
                    }}
                    InputProps={{
                      disableUnderline: true,
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
            </Grid>

            {/* graduation season */}
            <Grid item xs={12} sm={5.8} id="season">
              <Grid item xs={12}>
                <CTypography title={"Graduation Season"} />
              </Grid>
              <Grid item xs={12}>
                <Select
                  fullWidth
                  displayEmpty
                  value={graduationSeason}
                  onChange={(e) => setGraduationSeason(e.target.value)}
                  style={{
                    color: isNumber(graduationSeason) ? "" : color.placeholder,
                  }}
                  IconComponent={KeyboardArrowDown}
                >
                  <MenuItem value={""} hidden selected disabled>
                    Select Graduation Season
                  </MenuItem>
                  {seasonArr?.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item?.id}>
                        {item?.name}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>
            </Grid>

            {/*Guardian phone field*/}
            <Grid item xs={12} sm={5.8} id="gphone">
              <Grid item xs={12}>
                <CTypography title={"Guardian's Phone"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter guardian's phone no."
                  value={gPhone}
                  onChange={(e) => {
                    setGphone(
                      !Number.isNaN(Number(e.target.value))
                        ? e.target.value.trim()
                        : gPhone
                    );
                    setErrObj({ ...errObj, gphoneErr: false, gphoneMsg: "" });
                  }}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone
                          fill={errObj.gphoneErr ? color.error : color.primary}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.gphoneErr}
                  helperText={errObj.gphoneMsg}
                />
              </Grid>
            </Grid>
            {/*Guardian email field */}
            <Grid item xs={12} sm={5.8} id="gemail">
              <CTypography title={"Guardian's Email"} />
              <TextField
                fullWidth
                placeholder="Enter guardian's email"
                value={gEmail}
                onChange={(e) => {
                  setGemail(e.target.value.trim());
                  setErrObj({ ...errObj, gemailErr: false, gemailMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email
                        fill={errObj.gemailErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                }}
                error={errObj.gemailErr}
                helperText={errObj.gemailMsg}
              />
            </Grid>
            {/* image upload field */}
            <Grid
              item
              xs={12}
              sm={5.8}
              display={"flex"}
              flexDirection={"column"}
            >
              <Grid item>
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
            display="flex"
            xs={12}
            gap={2}
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
  );
}
