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
  TextField,
  Typography,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull, isObject } from "lodash";
import { getAPIProgressData, getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { sexArr } from "../../../Config/Static_Data";
import moment from "moment";
import UploadFile from "../../UploadFile";
import styles from "./styles";
import { useSearchParams } from "react-router-dom";
import MainLoader from "../../Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Email from "../../CustomIcon/Global/Email";
import Phone from "../../CustomIcon/Global/Phone";
import Profile from "../../CustomIcon/Global/Profile";
import Sex from "../../CustomIcon/Global/Sex";
import DateIcon from "../../CustomIcon/Global/DOB";
import { convertToIST } from "../../../Utils/CommonFunctions";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";

const errorObj = {
  fNameErr: false,
  fNameMsg: "",
  lNameErr: false,
  lNameMsg: "",
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
  sexErr: false,
  sexMsg: "",
  dobErr: false,
  dobMsg: "",
};

export default function AddSuperAdmin(props) {
  const { handleClick = () => null } = props;
  const className = styles();
  const { userData } = useSelector((state) => state.auth);
  const { setUserData } = authActions;
  const dispatch = useDispatch();

  const email_Regex = Setting.JS_Regex.email_Regex;
  const [searchParams, setSearchParams] = useSearchParams();

  const [user, setUser] = useState({});
  const isEdit = !isEmpty(user);

  const [errObj, setErrObj] = useState(errorObj);
  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [sex, setSex] = useState("");
  const [file, setFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [pageLoad, setPageLoad] = useState(false);
  const [loader, setLoader] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setData();
    }
  }, [isEdit]);

  useEffect(() => {
    if (searchParams.has("id")) {
      getUserByIdApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, [searchParams]);

  const setData = () => {
    if (!isNull(user?.firstname) || !isEmpty(user?.firstname)) {
      setFname(user?.firstname);
    }
    if (!isNull(user?.lastname) || !isEmpty(user?.lastname)) {
      setLname(user?.lastname);
    }

    if (!isNull(user?.dob) || !isEmpty(user?.dob)) {
      const convertedDOB = convertToIST(user?.dob);
      setDob(convertedDOB);
    }
    if (!isNull(user?.phone) || !isEmpty(user?.phone)) {
      setPhone(user?.phone);
    }
    if (!isNull(user?.email) || !isEmpty(user?.email)) {
      setEmail(user?.email);
    }
    if (!isNull(user?.sex) || !isEmpty(user?.sex)) {
      setSex(user?.sex);
    }
    if (!isNull(user?.sex) || !isEmpty(user?.sex)) {
      setFile(user?.profile_pic);
      setSelectedFile(user?.profile_pic);
    }
  };

  async function getUserByIdApi(id) {
    setPageLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getSingleAdminData}?id=${id}`,
        "GET",
        {}
      );

      if (response.status) {
        setUser(response?.data?.personal_info);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("🚀 ~ file: index.js:136 ~ getUserByIdApi ~ er:", er);
      toast.error(er.toString());
    } finally {
      setPageLoad(false);
    }
  }

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isEmpty(fName)) {
      valid = false;
      error.fNameErr = true;
      error.fNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }

    if (isEmpty(lName)) {
      valid = false;
      error.lNameErr = true;
      error.lNameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
      }
    }

    if (isEmpty(phone)) {
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
    if (isEmpty(email)) {
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

    setErrObj(error);

    if (valid) {
      addUserFormApiCall();
    }
  }

  async function addUserFormApiCall() {
    const date = moment(dob).format("YYYY-MM-DD");
    setLoader(true);
    const data = {
      firstname: fName?.trim(),
      lastname: lName?.trim(),
      phone_number: phone,
      email: email,
      dob: date,
      sex: sex,
      role_slug: "patient",
      profile_pic: selectedFile || [],
    };

    if (isEdit) {
      data["user_id"] = searchParams.has("id")
        ? Number(EncDctFn(searchParams.get("id"), "decrypt"))
        : "";
    }

    try {
      const response = await getAPIProgressData(
        isEdit ? Setting.endpoints.updateAdmin : Setting.endpoints.addAdmin,
        isEdit ? "PATCH" : "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("cancel");
        if (isEdit && +user?.id === +userData?.personal_info?.id) {
          getUserData();
        }
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("err=====>>>>>", err);
    } finally {
      setLoader(false);
    }
  }

  const clearData = () => {
    setFname("");
    setLname("");
    setSex("");
    setSelectedFile(null);
    setFile("");
    setDob(null);
    setPhone("");
    setEmail("");
  };

  const validateDate = (date) => {
    const today = new Date();
    const minDate = new Date(
      today.getFullYear() - 15,
      today.getMonth(),
      today.getDate()
    );
    return date >= minDate;
  };

  // get user data
  const getUserData = async () => {
    try {
      const endpoint =
        userData?.personal_info?.role_slug === "super_admin"
          ? Setting.endpoints.getSingleAdminData
          : Setting.endpoints.userData;

      const response = await getApiData(endpoint, "GET");

      if (response?.status) {
        const { data } = response;
        // Check if data is not empty and is an object
        if (!isEmpty(data) && isObject(data)) {
          const personalInfo = data?.personal_info;

          // Update userData only if personal_info exists
          if (personalInfo) {
            userData.personal_info = {
              ...userData.personal_info,
              email: personalInfo.email || userData.personal_info.email,
              phone_number:
                personalInfo.phone || userData.personal_info.phone_number,
              firstname:
                personalInfo.firstname || userData.personal_info.firstname,
              lastname:
                personalInfo.lastname || userData.personal_info.lastname,
              two_factor_enabled:
                personalInfo.two_factor_enabled ??
                userData.personal_info.two_factor_enabled,
              profile_pic:
                personalInfo.profile_pic || userData.personal_info.profile_pic,
              dob: personalInfo.dob || userData.personal_info.dob,
            };

            dispatch(setUserData(userData));
          }
        }
      } else {
        toast.error(response?.message || "Failed to retrieve user data.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching user data.");
      console.error("Error fetching user data:", error);
    }
  };

  return (
    <div className={className.container}>
      <Grid container className={className.gridContainer}>
        <Grid container alignItems={"center"}>
          <BackBtn
            handleClick={() => {
              handleClick("cancel");
              clearData();
            }}
          />
          <Typography variant="title" style={{ color: color.primary }}>
            {isEdit ? "Edit Super Admin" : "Add Super Admin"}
          </Typography>
        </Grid>

        {/* field container */}
        {pageLoad ? (
          <Grid item flex={1}>
            <MainLoader />
          </Grid>
        ) : (
          <>
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
              {/* last name field */}
              <Grid item xs={12} sm={5.8} id="lname">
                <Grid item>
                  <CTypography required title={"Last name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter last name"
                    inputProps={{ maxLength: 100 }}
                    value={lName}
                    onChange={(e) => {
                      setLname(e.target.value.trimStart());
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
                        shouldDisableDate={(date) => validateDate(date)}
                        shouldDisableMonth={(date) => validateDate(date)}
                        shouldDisableYear={validateDate}
                        onChange={(newValue) => {
                          setDob(newValue);
                          setErrObj({ ...errObj, dobErr: false, dobMsg: "" });
                        }}
                        DialogProps={{ className: className.datePicker }}
                        slots={{
                          actionBar: "hidden",
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
                        onError={(error) => {
                          if (!isNull(error)) {
                            setDobError(true);
                          } else {
                            setDobError(false);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            inputProps={{
                              ...params.inputProps,
                            }}
                            sx={{
                              svg: {
                                color: errObj.dobErr
                                  ? color.error
                                  : color.primary,
                              },
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
                      <FormHelperText>{errObj?.sexMsg}</FormHelperText>
                    ) : null}
                  </FormControl>
                </Grid>
              </Grid>

              {/* image upload field */}
              <Grid item xs={12} display={"flex"} flexDirection={"column"}>
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
              xs={12}
              display="flex"
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
                  disabled={loader}
                >
                  {loader ? (
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
                  onClick={() => {
                    handleClick("cancel");
                    clearData();
                  }}
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
