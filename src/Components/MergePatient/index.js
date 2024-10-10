import React, { useEffect, useState } from "react";
import {
  Avatar,
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
} from "@mui/material";
import moment from "moment";
import styles from "./styles";
import MainLoader from "../Loader/MainLoader";
import { genderArr, pronounsArr, sexArr } from "../../Config/Static_Data";
import { color } from "../../Config/theme";
import BackBtn from "../BackBtn";
import { toast } from "react-toastify";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { isArray, isEmpty, isNull, isNumber } from "lodash";
import { KeyboardArrowDown } from "@mui/icons-material";
import NoData from "../../Components/NoData";
import Profile from "../CustomIcon/Global/Profile";
import Sex from "../CustomIcon/Global/Sex";
import Gender from "../CustomIcon/Global/Gender";
import Pronouns from "../CustomIcon/Global/Pronouns";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import Phone from "../CustomIcon/Global/Phone";
import Email from "../CustomIcon/Global/Email";
import Images from "../../Config/Images";
import { useSelector } from "react-redux";
import { isTablet } from "react-device-detect";
import DateIcon from "../CustomIcon/Global/DOB";
import { convertToIST } from "../../Utils/CommonFunctions";

const errorObject = {
  idErr: false,
  idMsg: "",
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

export default function MergePatient(props) {
  const { data = [], handleClick = () => null, from = "" } = props;

  const className = styles();
  const { userType } = useSelector((state) => state.auth);

  const email_Regex = Setting.JS_Regex.email_Regex;

  const [errObj, setErrObj] = useState(errorObject);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  const [mergePatient, setMergePatient] = useState([]);

  // persional info state
  const [id, setId] = useState("");
  const [fName, setFName] = useState("");
  const [mName, setMname] = useState(null);
  const [lName, setLName] = useState("");
  const [sex, setSex] = useState("");
  const [gender, setGender] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [DOB, setDOB] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [provider, setProvider] = useState("");

  const [providersList, setProvidersList] = useState([]);

  // contact info state
  const [patientPhone, setPatientPhone] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyEmail, setEmergencyEmail] = useState("");

  useEffect(() => {
    getMergePatientApi();
    providersApi();
  }, [data]);

  async function getMergePatientApi() {
    setLoader(true);
    try {
      const response = await getApiData(Setting.endpoints.getPatients, "POST", {
        patient_ids: data,
      });

      if (response?.status) {
        setMergePatient(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log(
        "🚀 ~ file: index.js:49 ~ getSelectedPatientApi ~ err======>>>>>>>",
        err
      );
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
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  function validation() {
    let valid = true;
    let error = { ...errObj };
    let section = null;
    let scroll = false;

    if (!isNumber(id)) {
      valid = false;
      error.idErr = true;
      error.idMsg = "Please select default patient";
    }

    if (isNull(fName) || isEmpty(fName.trim())) {
      valid = false;
      error.firstNameErr = true;
      error.firstNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }
    if (isNull(lName) || isEmpty(lName.trim())) {
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
    if (isNull(patientPhone) || isEmpty(patientPhone.trim())) {
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
    if (isNull(patientEmail) || isEmpty(patientEmail.trim())) {
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

    if (!isEmpty(emergencyPhone.trim()) && emergencyPhone.length < 10) {
      valid = false;
      error.emergencyPhoneErr = true;
      error.emergencyPhoneMsg = "Please enter valid phone no.";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#emergencyphone");
      }
    }

    if (!isEmpty(emergencyEmail.trim()) && !email_Regex.test(emergencyEmail)) {
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
      mergePatientApi();
    }
  }

  async function mergePatientApi() {
    setBtnLoad(true);

    const mergeData = {
      firstname: fName?.trim(),
      middlename: mName?.trim(),
      lastname: lName?.trim(),
      sex: sex,
      gender: gender,
      pronouns: pronouns,
      dob: DOB,
      email: patientEmail,
      phone_number: patientPhone,
      emergency_phone: emergencyPhone,
      emergency_email: emergencyEmail,
      replace_image: selectedFile,
      provider_id: provider,
      patient_id: id,
      patient_ids: data,
    };

    try {
      const response = await getApiData(
        Setting.endpoints.mergePatient,
        "POST",
        mergeData
      );

      if (response?.status) {
        toast.success(response?.message);
        handleClick("cancel");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log(
        "🚀 ~ file: index.js:307 ~ mergePatientApi ~ err======>>>>>>>",
        err
      );
    }
  }

  function findVal(item, type) {
    const arr =
      type === "sex" ? sexArr : type === "pronouns" ? pronounsArr : [];
    const val = arr.find((it) => it?.id == item);
    return val?.name;
  }

  return (
    <Grid className={className.gridContainer}>
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
          <Grid
            container
            alignItems={"center"}
            marginBottom={from === "patientDetails" ? 0 : 1}
          >
            {from === "patientDetails" ? (
              <Typography marginBottom={2} variant="tableTitle">
                Merge patient
              </Typography>
            ) : (
              <>
                <BackBtn handleClick={() => handleClick("cancel")} />
                <Typography variant="title" style={{ color: color.primary }}>
                  Merge patient
                </Typography>
              </>
            )}
          </Grid>

          {isEmpty(mergePatient) ? (
            <NoData />
          ) : (
            <>
              <Grid
                container
                rowGap={1}
                className={className.scrollContainer}
                style={{
                  height:
                    from === "patientDetails" &&
                    (isTablet ? "calc(100vh - 520px)" : "calc(100vh - 410px)"),
                }}
              >
                {/* title row */}
                <Grid
                  container
                  wrap="nowrap"
                  alignItems={"center"}
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Default patient</Typography>
                  </Grid>
                  {mergePatient?.map((item, index) => {
                    const patientCount = index + 1;
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        style={{ minWidth: 120, cursor: "pointer" }}
                        onClick={() => {
                          setId(item?.id);
                          setErrObj({ ...errObj, idErr: false, idMsg: "" });
                        }}
                      >
                        <Tooltip
                          title="Select which Patient ID and metadata to keep"
                          arrow
                          placement="top"
                        >
                          <FormControlLabel
                            style={{
                              paddingTop: 0,
                              marginRight: 0,
                            }}
                            control={
                              <Checkbox
                                checked={id === item?.id}
                                onChange={() => {
                                  setId(item?.id);
                                  setErrObj({
                                    ...errObj,
                                    idErr: false,
                                    idMsg: "",
                                  });
                                }}
                                size="small"
                              />
                            }
                            label={
                              <Typography
                                variant="subTitle"
                                style={{
                                  color:
                                    id === item?.id
                                      ? color.primary
                                      : color.textColor,
                                }}
                              >
                                Patient {patientCount}
                              </Typography>
                            }
                          />
                        </Tooltip>
                      </Grid>
                    );
                  })}

                  <Grid
                    item
                    xs={2}
                    display={"flex"}
                    justifyContent={"center"}
                    marginLeft={"auto"}
                    minWidth={250}
                  >
                    <Typography variant="subTitle">Final patient</Typography>
                  </Grid>
                </Grid>

                {errObj?.idErr ? (
                  <>
                    <Grid
                      item
                      display={"flex"}
                      alignItems={"start"}
                      style={{ minWidth: 120, marginTop: -10 }}
                    >
                      <FormHelperText style={{ color: color.error }}>
                        {errObj?.idMsg}
                      </FormHelperText>
                    </Grid>
                  </>
                ) : null}
                {/* patient image */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Patient Image</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                        style={{ minWidth: 120 }}
                      >
                        <Avatar
                          onClick={() => setSelectedFile(item?.profile_pic)}
                          src={item?.profile_pic || ""}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "cover",
                            borderRadius: 12,
                            padding: 1,
                            border:
                              selectedFile === item?.profile_pic
                                ? `2px solid ${color.primary}`
                                : "none",
                          }}
                        />
                      </Grid>
                    );
                  })}
                  <Grid
                    item
                    xs={2}
                    display={"flex"}
                    justifyContent={"center"}
                    marginLeft={"auto"}
                    minWidth={250}
                  >
                    <Avatar
                      src={selectedFile || ""}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 12,
                      }}
                    />
                  </Grid>
                </Grid>

                {/* first name */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                  id="#fname"
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant={"subTitle"}>First Name</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Tooltip title={item?.firstname} arrow>
                          <Button
                            fullWidth
                            variant="outlined"
                            style={{
                              backgroundColor:
                                item?.firstname === fName ? color.green : "",
                              color:
                                item?.firstname === fName ? color.white : "",
                              border: "none",
                            }}
                            onClick={() => {
                              setFName(item?.firstname);
                              setErrObj({
                                ...errObj,
                                firstNameErr: false,
                                firstNameMsg: "",
                              });
                            }}
                          >
                            <div
                              style={{
                                width: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item?.firstname}
                            </div>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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
                                errObj.firstNameErr
                                  ? color.error
                                  : color.primary
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

                {/* middle name */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Middle name</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Tooltip title={item?.middlename} arrow>
                          <Button
                            disabled={
                              isEmpty(item?.middlename) ||
                              isNull(item?.middlename)
                            }
                            fullWidth
                            variant="outlined"
                            style={{
                              backgroundColor:
                                item?.middlename === mName ? color.green : "",
                              color:
                                item?.middlename === mName ? color.white : "",
                              border: "none",
                            }}
                            onClick={() => setMname(item?.middlename)}
                          >
                            <div
                              style={{
                                width: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item?.middlename || "-"}
                            </div>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* last name */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                  id="#lname"
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Last name</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Tooltip title={item?.lastname} arrow>
                          <Button
                            fullWidth
                            variant="outlined"
                            style={{
                              backgroundColor:
                                item?.lastname === lName ? color.green : "",
                              color:
                                item?.lastname === lName ? color.white : "",
                              border: "none",
                            }}
                            onClick={() => {
                              setLName(item?.lastname);
                              setErrObj({
                                ...errObj,
                                lastNameErr: false,
                                lastNameMsg: "",
                              });
                            }}
                          >
                            <div
                              style={{
                                width: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item?.lastname || "-"}
                            </div>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* sex */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Sex</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.sex === sex ? color.green : "",
                            color: item?.sex === sex ? color.white : "",
                            border: "none",
                          }}
                          onClick={() => {
                            setSex(item?.sex);
                            setErrObj({
                              ...errObj,
                              sexErr: false,
                              sexMsg: "",
                            });
                          }}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {findVal(item?.sex, "sex") || "-"}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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
                      {errObj?.sexErr ? (
                        <FormHelperText style={{ color: color.error }}>
                          {errObj?.sexMsg}
                        </FormHelperText>
                      ) : null}
                    </FormControl>
                  </Grid>
                </Grid>

                {/* gender */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Gender</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          disabled={
                            isEmpty(item?.gender) || isNull(item?.gender)
                          }
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.gender === gender ? color.green : "",
                            color: item?.gender === gender ? color.white : "",
                            border: "none",
                          }}
                          onClick={() => setGender(item?.gender)}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item?.gender || "-"}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
                    {gender !== "Male" &&
                    gender !== "Female" &&
                    !isEmpty(gender) ? (
                      <TextField
                        fullWidth
                        placeholder="Enter gender"
                        value={gender}
                        onChange={(e) => {
                          setGender(e.target.value);
                          setErrObj({
                            ...errObj,
                            otherErr: false,
                            otherMsg: "",
                          });
                        }}
                        error={errObj.otherErr}
                        helperText={errObj.otherMsg}
                      />
                    ) : (
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
                              <Gender
                                fill={
                                  errObj?.genderErr
                                    ? color.error
                                    : color.primary
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
                    )}
                  </Grid>
                </Grid>

                {/* Pronouns */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Pronouns</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          disabled={
                            isEmpty(item?.pronouns) || isNull(item?.pronouns)
                          }
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.pronouns === pronouns ? color.green : "",
                            color:
                              item?.pronouns === pronouns ? color.white : "",
                            border: "none",
                          }}
                          onClick={() => setPronouns(item?.pronouns)}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {findVal(item?.pronouns, "pronouns") || "-"}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={pronouns || ""}
                      onChange={(e) => {
                        setPronouns(e.target.value);
                      }}
                      style={{
                        color: !pronouns ? color.placeholder : "",
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

                {/* Date of Birth */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Date of Birth</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    const convertedDOB = convertToIST(item?.dob);
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.dob === moment(DOB).format("YYYY-MM-DD")
                                ? color.green
                                : "",
                            color:
                              item?.dob === moment(DOB).format("YYYY-MM-DD")
                                ? color.white
                                : "",
                            border: "none",
                          }}
                          onClick={() => {
                            setDOB(convertedDOB);
                            setErrObj({
                              ...errObj,
                              dobErr: false,
                              dobMsg: "",
                            });
                          }}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {moment(convertedDOB).format("MM-DD-YYYY") || "-"}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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
                          showToolbar={false}
                          slotProps={{
                            inputAdornment: {
                              position: "start",
                            },
                          }}
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

                {/* patient phone */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Patient phone</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.phone === patientPhone ? color.green : "",
                            color:
                              item?.phone === patientPhone ? color.white : "",
                            border: "none",
                          }}
                          onClick={() => {
                            setPatientPhone(item?.phone);
                            setErrObj({
                              ...errObj,
                              patientPhoneErr: false,
                              patientPhoneMsg: "",
                            });
                          }}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item?.phone}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* patient email */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Patient email</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Tooltip title={item?.email} arrow>
                          <Button
                            fullWidth
                            variant="outlined"
                            style={{
                              backgroundColor:
                                item?.email == patientEmail ? color.green : "",
                              color:
                                item?.email == patientEmail ? color.white : "",
                              border: "none",
                            }}
                            onClick={() => {
                              setPatientEmail(item?.email);
                              setErrObj({
                                ...errObj,
                                patientEmailErr: false,
                                patientEmailMsg: "",
                              });
                            }}
                          >
                            <div
                              style={{
                                width: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item?.email}
                            </div>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* Emergency contact phone */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">
                      Emergency contact phone
                    </Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          disabled={
                            isEmpty(item?.guardian_phone) ||
                            isNull(item?.guardian_phone)
                          }
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.guardian_phone === emergencyPhone
                                ? color.green
                                : "",
                            color:
                              item?.guardian_phone === emergencyPhone
                                ? color.white
                                : "",
                            border: "none",
                          }}
                          onClick={() =>
                            setEmergencyPhone(item?.guardian_phone)
                          }
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {item?.guardian_phone || "-"}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* Emergency contact email */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">
                      Emergency contact email
                    </Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Tooltip title={item?.guardian_email} arrow>
                          <Button
                            disabled={
                              isEmpty(item?.guardian_email) ||
                              isNull(item?.guardian_email)
                            }
                            fullWidth
                            variant="outlined"
                            style={{
                              textOverflow: "ellipsis",
                              backgroundColor:
                                item?.guardian_email == emergencyEmail
                                  ? color.green
                                  : "",
                              color:
                                item?.guardian_email == emergencyEmail
                                  ? color.white
                                  : "",
                              border: "none",
                            }}
                            onClick={() =>
                              setEmergencyEmail(item?.guardian_email)
                            }
                          >
                            <div
                              style={{
                                width: 100,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {item?.guardian_email || "-"}
                            </div>
                          </Button>
                        </Tooltip>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

                {/* Provider */}
                <Grid
                  container
                  alignItems={"center"}
                  wrap="nowrap"
                  columnGap={2}
                  id="#provider"
                >
                  <Grid item xs={1} style={{ minWidth: 105 }}>
                    <Typography variant="subTitle">Provider</Typography>
                  </Grid>
                  {mergePatient.map((item, index) => {
                    return (
                      <Grid
                        key={index}
                        item
                        xs={1}
                        display={"flex"}
                        justifyContent={"center"}
                      >
                        <Button
                          fullWidth
                          variant="outlined"
                          style={{
                            backgroundColor:
                              item?.provider_id === provider ? color.green : "",
                            color:
                              item?.provider_id === provider ? color.white : "",
                            border: "none",
                          }}
                          onClick={() => {
                            setProvider(item?.provider_id);
                            setErrObj({
                              ...errObj,
                              providerErr: false,
                              providerMsg: "",
                            });
                          }}
                        >
                          <div
                            style={{
                              width: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {(isNull(item?.provider_credentials) ||
                            (isEmpty(item?.provider_credentials) &&
                              (!isNull(item?.provider_title) ||
                                !isEmpty(item?.provider_title)))
                              ? item?.provider_title || ""
                              : "") +
                              " " +
                              item?.provider_firstname +
                              " " +
                              item?.provider_lastname +
                              " " +
                              (!isNull(item?.provider_credentials) &&
                              !isEmpty(item?.provider_credentials)
                                ? item?.provider_credentials
                                : "")}
                          </div>
                        </Button>
                      </Grid>
                    );
                  })}
                  <Grid item xs={2} marginLeft={"auto"} minWidth={250}>
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

              <Grid
                item
                container
                gap={2}
                wrap={"nowrap"}
                justifyContent={"center"}
                alignItems={"center"}
                margin={
                  from === "patientDetails" ? "20px 0 0 0" : "25px 0 15px"
                }
              >
                <Grid item xs={1}>
                  <Button
                    fullWidth
                    variant={"contained"}
                    className={className.btnStyle}
                    onClick={() => validation()}
                    disabled={btnLoad}
                  >
                    {btnLoad ? <CircularProgress size={22} /> : "Merge patient"}
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
        </>
      )}
    </Grid>
  );
}
