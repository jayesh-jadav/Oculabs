import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import {
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  InputAdornment,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { isEmpty, isNull, isObject } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackBtn from "../../Components/BackBtn";
import { CTypography } from "../../Components/CTypography";
import theme, { color } from "../../Config/theme";
import { getApiData, getAPIProgressData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import styles from "./styles";
import authActions from "../../Redux/reducers/auth/actions";
import UploadFile from "../../Components/UploadFile";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import moment from "moment";
import Email from "../../Components/CustomIcon/Global/Email";
import Profile from "../../Components/CustomIcon/Global/Profile";
import Phone from "../../Components/CustomIcon/Global/Phone";
import DateIcon from "../../Components/CustomIcon/Global/DOB";
import TFA from "../../Components/CustomIcon/Global/TFA";
import PassValidation from "../../Components/PasswordValidation";
import Password from "../../Components/CustomIcon/Global/Password";
import { convertToIST } from "../../Utils/CommonFunctions";

const errorObj = {
  fnameErr: false,
  lnameErr: false,
  emailErr: false,
  phoneErr: false,
  countryErr: false,
  dobErr: false,

  // error message
  fnameMsg: "",
  lnameMsg: "",
  emailMsg: "",
  phoneMsg: "",
  countryMsg: "",
  dobMsg: "",
};

const chngaPassErrorObj = {
  cPassErr: false,
  newPassErr: false,
  cunfPassErr: false,

  // error message
  cPassMsg: "",
  newPassMsg: "",
  cunfPassMsg: "",
};

export default function UserProfile() {
  const className = styles();
  const { userData } = useSelector((state) => state.auth);
  const { setUserData } = authActions;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const email_Regex = Setting.JS_Regex.email_Regex;

  // profile field state
  const [fName, setFName] = useState("");
  const [lName, setLName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [checked, setChecked] = useState(false);
  const [pLoader, setPLoader] = useState(false);
  const [dob, setDob] = useState(null);
  const [dobError, setDobError] = useState(false);

  const [errObj, setErrObj] = useState(errorObj);
  const [changeErrobj, setChangeErrObj] = useState(chngaPassErrorObj);

  // change password state
  const [cPassword, setCPassword] = useState(null);
  const [showCPass, setShowCPass] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [confPassword, setConfPassword] = useState("");
  const [showConfPass, setShowConfPass] = useState(false);
  const [cLoader, setCLoader] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [passValid, setPassValid] = useState(false);

  useEffect(() => {
    setFName(userData?.personal_info?.firstname);
    setLName(userData?.personal_info?.lastname);
    setEmail(userData?.personal_info?.email);
    setPhone(userData?.personal_info?.phone);
    if (userData?.personal_info?.two_factor_enabled === 1) {
      setChecked(true);
    } else {
      setChecked(false);
    }
    setFile(userData?.personal_info?.profile_pic);
    setSelectedFile(userData?.personal_info?.profile_pic);
    if (
      !isNull(userData?.personal_info?.dob) ||
      !isEmpty(userData?.personal_info?.dob)
    ) {
      const convertedDOB = convertToIST(userData?.personal_info?.dob);
      setDob(convertedDOB);
    }
  }, [userData]);

  // update profive validation
  const validation = () => {
    const error = { ...errObj };
    let valid = true;
    let section = null;
    let scroll = false;
    if (isEmpty(fName.trim())) {
      valid = false;
      scroll = true;
      error.fnameErr = true;
      error.fnameMsg = "Please enter first name";
      section = document.querySelector("#fname");
    }
    if (isEmpty(lName.trim())) {
      valid = false;
      error.lnameErr = true;
      error.lnameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
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
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setErrObj(error);
    if (valid) {
      updateProfile();
    }
  };
  // update profile api
  const updateProfile = async () => {
    const date = moment(dob).format("YYYY-MM-DD");
    setPLoader(true);
    try {
      const response = await getAPIProgressData(
        Setting.endpoints.updateProfile,
        "PATCH",
        {
          email: email,
          phone_number: phone,
          firstname: fName?.trim(),
          lastname: lName?.trim(),
          two_factor_enabled: checked ? 1 : 0,
          profile_pic: selectedFile || [],
          dob: date,
        },
        true
      );
      if (response.status) {
        toast.success(response.message);
        getUserData();
        navigate(-1);
      } else {
        toast.error(response.message);
      }
      setPLoader(false);
    } catch (error) {
      setPLoader(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  };

  // get user data
  const getUserData = async () => {
    try {
      const response = await getApiData(
        userData?.personal_info?.role_slug === "super_admin"
          ? Setting.endpoints.getSingleAdminData
          : Setting.endpoints.userData,
        "GET"
      );
      if (response.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          userData["personal_info"]["email"] =
            response?.data?.personal_info?.email;
          userData["personal_info"]["phone_number"] =
            response?.data?.personal_info?.phone;
          userData["personal_info"]["firstname"] =
            response?.data?.personal_info?.firstname;
          userData["personal_info"]["lastname"] =
            response?.data?.personal_info?.lastname;
          userData["personal_info"]["two_factor_enabled"] =
            response?.data?.personal_info?.two_factor_enabled;
          userData["personal_info"]["profile_pic"] =
            response?.data?.personal_info?.profile_pic;
          userData["personal_info"]["dob"] = response?.data?.personal_info?.dob;
          dispatch(setUserData(userData));
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  };

  // change password validation
  const changepassValidation = () => {
    const error = { ...changeErrobj };
    let valid = true;
    let section = null;
    let scroll = false;
    if (isEmpty(cPassword.trim())) {
      valid = false;
      scroll = true;
      error.cPassErr = true;
      error.cPassMsg = "Please enter current password";
      section = document.querySelector("#cPass");
    } else if (cPassword.length < 6 || cPassword.length > 15) {
      valid = false;
      error.cPassErr = true;
      error.cPassMsg = "The password length must Between 6 to 15 Character";
    }
    if (isEmpty(newPassword.trim())) {
      valid = false;
      error.newPassErr = true;
      error.newPassMsg = "Please enter new password";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#newPass");
      }
    } else if (newPassword.length < 6 || newPassword.length > 15) {
      valid = false;
      error.newPassErr = true;
      error.newPassMsg = "The password length must Between 6 to 15 Character";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#newPass");
      }
    } else if (cPassword === newPassword) {
      valid = false;
      error.newPassErr = true;
      error.newPassMsg =
        "Your new password cannot be the same as your old password";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#newPass");
      }
    }
    if (isEmpty(confPassword.trim())) {
      valid = false;
      error.cunfPassErr = true;
      error.cunfPassMsg = "Please enter confirm password";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#confPass");
      }
    } else if (newPassword !== confPassword) {
      valid = false;
      error.cunfPassErr = true;
      error.cunfPassMsg = "New password and confirm password must be same";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#confPass");
      }
    } else if (confPassword.length < 6 || confPassword.length > 15) {
      valid = false;
      error.cunfPassErr = true;
      error.cunfPassMsg = "The password length must Between 6 to 15 Character";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#newPass");
      }
    }

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setChangeErrObj(error);
    if (valid) {
      changePassword();
    }
  };

  // change password
  const changePassword = async () => {
    setCLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changePassword,
        "post",
        {
          currentPassword: cPassword,
          newPassword: newPassword,
          confirmPassword: confPassword,
        }
      );
      if (response.status) {
        toast.success(response.message);
        navigate(-1);
      } else {
        toast.error(response.message);
      }
      setCLoader(false);
    } catch (error) {
      toast.error(error.toString());
      setCLoader(false);
      console.log("error =======>>>", error);
    }
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

  return (
    <Grid className={className.container}>
      <Grid container justifyContent={"space-between"}>
        {/* userProfile */}
        <Grid
          item
          xs={12}
          md={6.9}
          className={className.gridContainer}
          style={{ marginBottom: md && 20 }}
        >
          <Grid
            item
            xs={12}
            style={{ marginBottom: 20 }}
            display="flex"
            alignItems={"center"}
          >
            <BackBtn handleClick={() => navigate(-1)} />
            <Typography variant="title" style={{ color: color.primary }}>
              User Profile
            </Typography>
          </Grid>
          <Grid item id={"fname"} style={{ marginBottom: 20 }}>
            <Grid item xs={12}>
              <CTypography required title={"First Name"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter first name"
                inputProps={{ maxLength: 100 }}
                value={fName}
                error={errObj.fnameErr}
                helperText={errObj.fnameErr ? errObj.fnameMsg : null}
                onChange={(e) => {
                  setFName(e.target.value);
                  setErrObj({ ...errObj, fnameErr: false, fnameMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Profile
                        fill={errObj.fnameErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid item id={"lname"} style={{ marginBottom: 20 }}>
            <Grid item xs={12}>
              <CTypography required title={"Last Name"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter last name"
                inputProps={{ maxLength: 100 }}
                value={lName}
                error={errObj.lnameErr}
                helperText={errObj.lnameErr ? errObj.lnameMsg : null}
                onChange={(e) => {
                  setLName(e.target.value);
                  setErrObj({ ...errObj, lnameErr: false, lnameMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Profile
                        fill={errorObj.lnameErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          <Grid item id={"email"} style={{ marginBottom: 20 }}>
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
                  setEmail(e.target.value);
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
          <Grid item id={"phone"} style={{ marginBottom: 20 }}>
            <Grid item xs={12}>
              <CTypography required title={"Phone"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter phone no."
                // type={"number"}
                value={phone}
                error={errObj.phoneErr}
                className={className.numberInput}
                helperText={errObj.phoneErr ? errObj.phoneMsg : null}
                onChange={(e) => {
                  setPhone(
                    !Number.isNaN(Number(e.target.value))
                      ? e.target.value
                      : phone
                  );
                  setErrObj({ ...errObj, phoneErr: false, phoneMsg: "" });
                }}
                inputProps={{ maxLength: 10 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone
                        fill={errorObj.phoneErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    validation();
                  }
                }}
              />
            </Grid>
          </Grid>
          {/* DOB field */}
          <Grid
            item
            container
            xs={12}
            sm={5.8}
            display={"flex"}
            alignItems={"center"}
            style={{ marginBottom: errObj.dobErr ? 5 : 35 }}
            id="dob"
          >
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
                    onError={(error) => {
                      if (!isNull(error)) {
                        setDobError(true);
                      } else {
                        setDobError(false);
                      }
                    }}
                    DialogProps={{ className: className.datePicker }}
                    slots={{
                      // actionBar: "hidden",
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

          {/* upload field */}

          <Grid
            item
            xs={12}
            display={"flex"}
            flexDirection={"column"}
            style={{ marginBottom: 20 }}
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
                clearable
                handleFile={(e) => {
                  setFile(e);
                }}
                handleSelectedFile={(e) => {
                  setSelectedFile(e.target.files[0]);
                }}
                handleClear={() => {
                  setFile(null);
                  setSelectedFile(null);
                }}
              />
            </Grid>
          </Grid>

          <Grid item xs={12} style={{ display: "flex", alignItems: "center" }}>
            <Tooltip
              arrow
              title={`${
                checked ? "Disable" : "Enable"
              } Two Factor Authentication`}
            >
              <span style={{ padding: 0 }}>
                <TFA fill={color.primary} height={30} width={30} />
              </span>
            </Tooltip>

            <Switch checked={checked} onChange={() => setChecked(!checked)} />
          </Grid>
          <Typography mb={3} style={{ width: "50%" }}>
            Note: When you turn on 2 Factor Authentication your verification
            code will be sent to your email address.
          </Typography>

          <Grid item xs={12} display="flex" justifyContent="center">
            <Button
              variant="contained"
              style={{ width: 200 }}
              onClick={() => validation()}
              disabled={pLoader}
            >
              {pLoader ? <CircularProgress size={22} /> : "Save"}
            </Button>
          </Grid>
        </Grid>

        {/*-------------------------- change password ----------------------------------------- */}
        <Grid item xs={12} md={4.9}>
          <Grid item xs={12} className={className.gridContainer}>
            <Grid item style={{ marginBottom: 20 }}>
              <Typography variant="title" style={{ color: color.primary }}>
                Change Password
              </Typography>
            </Grid>
            <Grid item xs={12} id={"cPass"} style={{ marginBottom: 20 }}>
              <Grid item xs={12}>
                <CTypography required title={"Current Password"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter current password"
                  type={showCPass ? "text" : "password"}
                  value={cPassword}
                  autoCorrect={false}
                  autoComplete="new-password"
                  onChange={(e) => {
                    setCPassword(e.target.value);
                    setChangeErrObj({
                      ...changeErrobj,
                      cPassErr: false,
                      cPassMsg: "",
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        style={{ marginRight: -5 }}
                        position="start"
                      >
                        <Password
                          fill={
                            changeErrobj.cPassErr ? color.error : color.primary
                          }
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowCPass(!showCPass)}
                      >
                        {showCPass ? (
                          <VisibilityOutlined
                            style={{
                              color: color.primary,
                            }}
                          />
                        ) : (
                          <VisibilityOffOutlined />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  error={changeErrobj.cPassErr}
                  helperText={changeErrobj.cPassMsg}
                />
              </Grid>
            </Grid>
            <Grid item xs={12} id={"newPass"} style={{ marginBottom: 20 }}>
              <Grid item xs={12}>
                <CTypography required title={"New Password"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter new password"
                  type={showNewPass ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setChangeErrObj({
                      ...changeErrobj,
                      newPassErr: false,
                      newPassMsg: "",
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        style={{ marginRight: -5 }}
                        position="start"
                      >
                        <Password
                          fill={
                            changeErrobj.newPassErr
                              ? color.error
                              : color.primary
                          }
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowNewPass(!showNewPass)}
                      >
                        {showNewPass ? (
                          <VisibilityOutlined
                            style={{
                              color: color.primary,
                            }}
                          />
                        ) : (
                          <VisibilityOffOutlined />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  error={changeErrobj.newPassErr}
                  helperText={changeErrobj.newPassMsg}
                />
              </Grid>
              <PassValidation
                password={newPassword}
                name={userData?.personal_info?.firstname}
                handleValid={(value) => {
                  setPassValid(value);
                }}
              />
            </Grid>
            <Grid item xs={12} id={"confPass"} style={{ marginBottom: 20 }}>
              <Grid item xs={12}>
                <CTypography required title={"Confirm Password"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Enter confirm password"
                  type={showConfPass ? "text" : "password"}
                  value={confPassword}
                  onChange={(e) => {
                    setConfPassword(e.target.value);
                    setChangeErrObj({
                      ...changeErrobj,
                      cunfPassErr: false,
                      cunfPassMsg: "",
                    });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      changepassValidation();
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment
                        style={{ marginRight: -5 }}
                        position="start"
                      >
                        <Password
                          fill={
                            changeErrobj.cunfPassErr
                              ? color.error
                              : color.primary
                          }
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="end"
                        style={{ cursor: "pointer" }}
                        onClick={() => setShowConfPass(!showConfPass)}
                      >
                        {showConfPass ? (
                          <VisibilityOutlined
                            style={{
                              color: color.primary,
                            }}
                          />
                        ) : (
                          <VisibilityOffOutlined />
                        )}
                      </InputAdornment>
                    ),
                  }}
                  error={changeErrobj.cunfPassErr}
                  helperText={changeErrobj.cunfPassMsg}
                />
              </Grid>
            </Grid>
            <Grid
              item
              xs={12}
              display="flex"
              justifyContent="center"
              style={{ marginTop: 20 }}
            >
              <Button
                variant="contained"
                style={{ width: 200 }}
                onClick={() => changepassValidation()}
                disabled={cLoader || !passValid}
              >
                {cLoader ? <CircularProgress size={22} /> : "Save"}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
