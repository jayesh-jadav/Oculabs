import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  FormHelperText,
  Button,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import styles from "./styles";
import { color } from "../../../Config/theme";
import { KeyboardArrowDown } from "@mui/icons-material";
import { CTypography } from "../../CTypography";
import {
  genderArr,
  pronounsArr,
  seasonArr,
  sexArr,
} from "../../../Config/Static_Data";
import { isArray, isEmpty, isNull, isNumber } from "lodash";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { Setting } from "../../../Utils/Setting";
import CModal from "../CModal";
import { getAPIProgressData, getApiData } from "../../../Utils/APIHelper";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";
import UploadFile from "../../UploadFile";
import Email from "../../CustomIcon/Global/Email";
import Profile from "../../CustomIcon/Global/Profile";
import Phone from "../../CustomIcon/Global/Phone";
import Images from "../../../Config/Images";
import Sex from "../../CustomIcon/Global/Sex";
import Pronouns from "../../CustomIcon/Global/Pronouns";
import Gender from "../../CustomIcon/Global/Gender";
import DateIcon from "../../CustomIcon/Global/DOB";
import moment from "moment";
import Calendar from "../../CustomIcon/Header/Calendar";

const errorObject = {
  // persional info
  firstNameErr: false,
  firstNameMsg: "",
  lastNameErr: false,
  lastNameMsg: "",
  genderErr: false,
  genderMsg: "",
  dobErr: false,
  dobMsg: "",
  sexErr: false,
  sexMsg: "",
  otherErr: false,
  otherMsg: "",

  // contact info
  patientPhoneErr: false,
  patientPhoneMsg: "",
  patientEmailErr: false,
  patientEmailMsg: "",
  emergencyPhoneErr: false,
  emergencyPhoneMsg: "",
  emergencyEmailErr: false,
  emergencyEmailMsg: "",

  organizationErr: false,
  organizationMsg: "",

  providerErr: false,
  providerMsg: "",
};

export default function AddPatient(props) {
  const { visible = false, handleModal = () => null, from } = props;
  const { userType, userOrg, userData } = useSelector((state) => state.auth);
  const { setDrawerList } = authActions;
  const dispatch = useDispatch();
  const className = styles();

  // persional info state
  const [fName, setFName] = useState("");
  const [mName, setMname] = useState("");
  const [lName, setLName] = useState("");
  const [sex, setSex] = useState("");
  const [gender, setGender] = useState("");
  const [other, setOther] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [DOB, setDOB] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [sportList, setSportList] = useState([]);
  const [sport, setSport] = useState([]);
  const [graduationYear, setGraduationYear] = useState(null);
  const [graduationSeason, setGraduationSeason] = useState("");
  const [file, setFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // contact info state
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");

  // provider
  const [provider, setProvider] = useState("");
  const [providersList, setProvidersList] = useState([]);

  const [btnLoader, setBtnLoader] = useState(false);

  // error object
  const [errObj, setErrObj] = useState(errorObject);

  // email regex
  const email_Regex = Setting.JS_Regex.email_Regex;

  useEffect(() => {
    if (visible) {
      providersApi();
      getSportListApi();
    }
  }, [visible]);

  useEffect(() => {
    if (
      !isEmpty(providersList) &&
      isArray(providersList) &&
      userData?.personal_info?.is_provider === 1
    ) {
      providersList?.map((item, index) => {
        if (item?.user_id === userData?.personal_info?.id) {
          setProvider(item?.id);
        }
      });
    }
  }, [providersList]);

  // validation
  function validation() {
    let valid = true;
    let error = { ...errObj };
    let section = null;
    let scroll = false;

    if (isNull(fName) || isEmpty(fName?.trim())) {
      valid = false;
      error.firstNameErr = true;
      error.firstNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }
    if (isNull(lName) || isEmpty(lName?.trim())) {
      valid = false;
      error.lastNameErr = true;
      error.lastNameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
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

    if (isNull(DOB)) {
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
    if (isNull(patientPhone) || isEmpty(patientPhone?.trim())) {
      valid = false;
      error.patientPhoneErr = true;
      error.patientPhoneMsg = "Please enter phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#patientphone");
      }
    } else if (patientPhone.length < 10) {
      valid = false;
      error.patientPhoneErr = true;
      error.patientPhoneMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#patientphone");
      }
    }
    if (isNull(patientEmail) || isEmpty(patientEmail?.trim())) {
      valid = false;
      error.patientEmailErr = true;
      error.patientEmailMsg = "Please enter email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#patientemail");
      }
    } else if (!email_Regex.test(patientEmail)) {
      valid = false;
      error.patientEmailErr = true;
      error.patientEmailMsg = "Please enter valid email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#patientemail");
      }
    }

    if (!isEmpty(emergencyPhone?.trim()) && emergencyPhone.length < 10) {
      valid = false;
      error.emergencyPhoneErr = true;
      error.emergencyPhoneMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#emergencyphone");
      }
    }

    if (!isEmpty(emergencyEmail?.trim()) && !email_Regex.test(emergencyEmail)) {
      valid = false;
      error.emergencyEmailErr = true;
      error.emergencyEmailMsg = "Please enter valid email";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#emergencyemail");
      }
    }

    if (isEmpty(provider.toString()) && userType?.includes("admin")) {
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
      createPatient();
    }
  }

  // create patient api integration
  async function createPatient() {
    setBtnLoader(true);
    const sportIds = sport.map((item) => item?.id);
    const gYear = !isNull(graduationYear)
      ? moment(graduationYear).format("yyyy")
      : "";

    const data = {
      firstname: fName?.trim(),
      middlename: mName?.trim(),
      lastname: lName?.trim(),
      phone_number: patientPhone,
      email: patientEmail,
      two_factor_enabled: 0,
      profile_pic: selectedFile || [],
      provider_id: provider,
      dob: moment(DOB, "YYYY-MM-DD").format("YYYY-MM-DD"),
      sex: sex,
      gender: gender === "Other" ? other : gender,
      pronouns: pronouns,
      emergency_phone: emergencyPhone || "",
      emergency_email: emergencyEmail || "",
      sports_id: sportIds || [],
      graduation_year: gYear,
      graduation_season: graduationSeason,
    };

    try {
      const response = await getAPIProgressData(
        Setting.endpoints.createPatient,
        "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response.message);
        dispatch(setDrawerList(true));
        if (!isEmpty(response?.data)) {
          providersApi();
          handleModal("success", response?.data?.id);
        }
        clearData();
      } else {
        toast.error(response?.message);
      }
      setBtnLoader(false);
    } catch (error) {
      console.log("error =======>>>", error);
      setBtnLoader(false);
      toast.error(error.toString());
    }
  }

  // get provider list
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
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
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

  function getMinDate(date) {
    const fifteenYearsInMilliseconds = 15 * 365 * 24 * 60 * 60 * 1000;
    const futureDate = new Date(date?.getTime() + fifteenYearsInMilliseconds);
    return futureDate;
  }

  const clearData = () => {
    setFName("");
    setLName("");
    setMname("");
    setGender("");
    setSex("");
    setOther("");
    setPronouns("");
    setDOB(null);
    setPatientPhone("");
    setPatientEmail("");
    setEmergencyEmail("");
    setEmergencyPhone("");
    setProvider("");
    setSelectedFile(null);
    setFile("");
    setSport([]);
    setGraduationYear(null);
    setGraduationSeason("");
  };

  return (
    <CModal
      title={"Add New Patient"}
      visible={visible}
      handleModal={() => {
        handleModal("close");
        setErrObj(errorObject);
        clearData();
      }}
      children={
        <>
          <Grid
            container
            style={{ height: "60vh" }}
            className={className.scrollbar}
          >
            {/* Patient Information container */}
            <Grid item xs={12} style={{ marginBottom: 20 }}>
              <Typography variant="tableTitle">Patient Information</Typography>
            </Grid>
            <Grid container display={"flex"} justifyContent={"space-between"}>
              {/* first name field */}
              <Grid
                item
                xs={12}
                sm={5.8}
                id="fname"
                style={{ marginBottom: 10 }}
              >
                <Grid item xs={12}>
                  <CTypography required title={"First Name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter first name"
                    inputProps={{ maxLength: 100 }}
                    value={fName}
                    onChange={(e) => {
                      setFName(e.target.value);
                      setErrObj({
                        ...errObj,
                        firstNameErr: false,
                        firstNameMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Profile
                            fill={
                              errObj.firstNameErr ? color.error : color.primary
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.firstNameErr}
                    helperText={errObj.firstNameMsg}
                  />
                </Grid>
              </Grid>
              {/* middle name field */}
              <Grid item xs={12} sm={5.8} style={{ marginBottom: 10 }}>
                <Grid item xs={12}>
                  <CTypography title={"Middle Name"} />
                </Grid>
                <Grid item xs={12}>
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
              <Grid
                item
                xs={12}
                sm={5.8}
                id="lname"
                style={{ marginBottom: 10 }}
              >
                <Grid item xs={12}>
                  <CTypography required title={"Last Name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter last name"
                    inputProps={{ maxLength: 100 }}
                    value={lName}
                    onChange={(e) => {
                      setLName(e.target.value);
                      setErrObj({
                        ...errObj,
                        lastNameErr: false,
                        lastNameMsg: "",
                      });
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Profile
                            fill={
                              errObj.lastNameErr ? color.error : color.primary
                            }
                          />
                        </InputAdornment>
                      ),
                    }}
                    error={errObj.lastNameErr}
                    helperText={errObj.lastNameMsg}
                  />
                </Grid>
              </Grid>
              {/* sex field  */}
              <Grid item xs={12} sm={5.8} id="sex" style={{ marginBottom: 10 }}>
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
                        setErrObj({
                          ...errObj,
                          sexErr: false,
                          sexMsg: "",
                        });
                      }}
                      style={{
                        color: isEmpty(sex) ? color.placeholder : "",
                        minWidth: "auto",
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
                            fill={errObj?.sexErr ? color.error : color.primary}
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
                    {errObj?.sexErr ? (
                      <FormHelperText style={{ color: color.error }}>
                        {errObj?.sexMsg}
                      </FormHelperText>
                    ) : null}
                  </FormControl>
                </Grid>
              </Grid>
              {/* gender field  */}
              <Grid
                item
                xs={12}
                sm={5.8}
                id="gender"
                style={{ marginBottom: 10 }}
              >
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
                        setErrObj({
                          ...errObj,
                          genderErr: false,
                          genderMsg: "",
                          otherErr: false,
                          otherMsg: "",
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
                          <Gender
                            fill={
                              errObj?.genderErr ? color.error : color.primary
                            }
                          />
                        </InputAdornment>
                      }
                      IconComponent={KeyboardArrowDown}
                    >
                      <MenuItem value={""} disabled hidden selected>
                        Select gender
                      </MenuItem>
                      {genderArr.map((item, index) => {
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
              {/* pronouns field */}
              <Grid
                item
                xs={12}
                sm={5.8}
                id="pronouns"
                style={{ marginBottom: 10 }}
              >
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
                      color: !pronouns ? color.placeholder : "",
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
                        <Pronouns fill={color.primary} />
                      </InputAdornment>
                    }
                    IconComponent={KeyboardArrowDown}
                  >
                    <MenuItem value={""} disabled hidden selected>
                      Select pronouns
                    </MenuItem>
                    {pronounsArr.map((item, index) => {
                      return (
                        <MenuItem key={index} value={item?.id}>
                          {item?.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </Grid>
              </Grid>
              {/* other field */}
              {gender === "Other" && (
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  id="other"
                  style={{ marginBottom: 10 }}
                >
                  <Grid item xs={12}>
                    <CTypography title={"Other (Gender)"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter gender"
                      value={other}
                      disabled={gender !== "Other"}
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
                </Grid>
              )}

              {/* dob field */}
              <Grid item xs={12} sm={5.8} id="dob" style={{ marginBottom: 10 }}>
                <Grid item xs={12}>
                  <CTypography required title={"Date of Birth"} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={errObj.dobErr}>
                    <LocalizationProvider
                      dateAdapter={AdapterDateFns}
                      style={{ borderColor: "red" }}
                    >
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
                        showToolbar={false}
                        slots={{
                          // actionBar: "hidden",
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
                        disableFuture
                        value={DOB}
                        views={["year", "month", "day"]}
                        onChange={(newValue) => {
                          setDOB(newValue);
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
                        InputProps={{
                          disableUnderline: true,
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            inputProps={{
                              ...params.inputProps,
                            }}
                            error={errObj.dobErr}
                            helperText={errObj.dobMsg}
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

              {/* sport field */}
              <Grid
                item
                xs={12}
                sm={5.8}
                id="sport"
                style={{ marginBottom: 10 }}
              >
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
                      getOptionLabel={(option) => {
                        return option?.sport_name;
                      }}
                      onChange={(e, v, r, b) => {
                        setSport(v);
                      }}
                      popupIcon={<KeyboardArrowDown />}
                      renderInput={(params) => (
                        <TextField {...params} placeholder="Select sports" />
                      )}
                    />
                  </FormControl>
                </Grid>
              </Grid>

              {/* graduation year */}
              <Grid
                item
                xs={12}
                sm={5.8}
                id="year"
                style={{ marginBottom: 10 }}
              >
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
                          <Calendar
                            height={20}
                            width={20}
                            fill={color.primary}
                          />
                        ),
                      }}
                      slotProps={{
                        inputAdornment: {
                          position: "start",
                        },
                      }}
                      value={graduationYear}
                      minDate={getMinDate(DOB)}
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
              <Grid
                item
                xs={12}
                sm={5.8}
                id="season"
                style={{ marginBottom: 10 }}
              >
                <Grid item xs={12}>
                  <CTypography title={"Graduation Season"} />
                </Grid>
                <Grid item xs={12}>
                  <Select
                    fullWidth
                    displayEmpty
                    value={graduationSeason}
                    IconComponent={KeyboardArrowDown}
                    onChange={(e) => setGraduationSeason(e.target.value)}
                    style={{
                      color: isNumber(graduationSeason)
                        ? ""
                        : color.placeholder,
                    }}
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

              {/* uplod btn */}
              <Grid item xs={12} style={{ marginBottom: 10 }}>
                <Grid item xs={12}>
                  <Grid item>
                    <CTypography title={"Patient Image"} />
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
            </Grid>

            {/* contact information container */}
            <Grid container style={{ marginTop: 20, marginBottom: 20 }}>
              <Grid item xs={12} style={{ marginBottom: 20 }}>
                <Typography variant="tableTitle">
                  Contact Information
                </Typography>
              </Grid>
              <Grid container display={"flex"} justifyContent={"space-between"}>
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  id="patientphone"
                  style={{ marginBottom: 10 }}
                >
                  <Grid item xs={12}>
                    <CTypography required title={"Patient phone"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter phone no."
                      value={patientPhone}
                      onChange={(e) => {
                        setPatientPhone(
                          !Number.isNaN(Number(e.target.value))
                            ? e.target.value
                            : patientPhone
                        );
                        setErrObj({
                          ...errObj,
                          patientPhoneErr: false,
                          patientPhoneMsg: "",
                        });
                      }}
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              fill={
                                errObj.patientPhoneErr
                                  ? color.error
                                  : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.patientPhoneErr}
                      helperText={errObj.patientPhoneMsg}
                    />
                  </Grid>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  style={{ marginBottom: 10 }}
                  id="patientemail"
                >
                  <Grid item xs={12}>
                    <CTypography required title={"Patient email"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter email"
                      value={patientEmail}
                      onChange={(e) => {
                        setPatientEmail(e.target.value);
                        setErrObj({
                          ...errObj,
                          patientEmailErr: false,
                          patientEmailMsg: "",
                        });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email
                              fill={
                                errObj.patientEmailErr
                                  ? color.error
                                  : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.patientEmailErr}
                      helperText={errObj.patientEmailMsg}
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid container display={"flex"} justifyContent={"space-between"}>
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  id="emergencyphone"
                  style={{ marginBottom: 10 }}
                >
                  <Grid item xs={12}>
                    <CTypography title={"Emergency contact phone"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter phone no."
                      value={emergencyPhone}
                      onChange={(e) => {
                        setEmergencyPhone(
                          !Number.isNaN(Number(e.target.value))
                            ? e.target.value
                            : emergencyPhone
                        );
                        setErrObj({
                          ...errObj,
                          emergencyPhoneErr: false,
                          emergencyPhoneMsg: "",
                        });
                      }}
                      inputProps={{ maxLength: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              fill={
                                errObj.emergencyPhoneErr
                                  ? color.error
                                  : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.emergencyPhoneErr}
                      helperText={errObj.emergencyPhoneMsg}
                    />
                  </Grid>
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  id="emergencyemail"
                  style={{ marginBottom: 10 }}
                >
                  <Grid item xs={12}>
                    <CTypography title={"Emergency contact email"} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      placeholder="Enter email"
                      value={emergencyEmail}
                      onChange={(e) => {
                        setEmergencyEmail(e.target.value);
                        setErrObj({
                          ...errObj,
                          emergencyEmailErr: false,
                          emergencyEmailMsg: "",
                        });
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email
                              fill={
                                errObj.emergencyEmailErr
                                  ? color.error
                                  : color.primary
                              }
                            />
                          </InputAdornment>
                        ),
                      }}
                      error={errObj.emergencyEmailErr}
                      helperText={errObj.emergencyEmailMsg}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            {/* Provider field */}
            <Grid container style={{ marginBottom: 20 }}>
              <Grid item xs={12} style={{ marginBottom: 20 }}>
                <Typography variant="tableTitle">{"Provider"}</Typography>
              </Grid>
              <Grid container display={"flex"} justifyContent={"space-between"}>
                <Grid
                  item
                  xs={12}
                  sm={5.8}
                  style={{ marginBottom: 10 }}
                  id="provider"
                >
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
                          color: !provider ? color.placeholder : "",
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
                        {providersList.map((item, index) => {
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
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={3}
            style={{
              display: "flex",
              marginLeft: "auto",
            }}
          >
            <Button
              variant="contained"
              fullWidth
              style={{
                minWidth: 120,
                marginBottom: 15,
                marginTop: 10,
              }}
              onClick={() => validation()}
              disabled={btnLoader}
            >
              {btnLoader ? (
                <CircularProgress size={22} />
              ) : from === "drawer" ? (
                "Submit"
              ) : (
                "Next"
              )}
            </Button>
          </Grid>
        </>
      }
    />
  );
}
