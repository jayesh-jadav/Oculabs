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
  useMediaQuery,
} from "@mui/material";
import { KeyboardArrowDown } from "@mui/icons-material";
import styles from "./styles";
import theme, { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull, isObject } from "lodash";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { roleArr, sexArr } from "../../../Config/Static_Data";
import { useSelector } from "react-redux";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
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
import DateIcon from "../../CustomIcon/Global/DOB";
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
};

export default function AddUsersForm(props) {
  const { handleClick = () => null } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const className = styles();
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { userType } = useSelector((state) => state.auth);
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [isEdit, setIsEdit] = useState(false);
  const [errObj, setErrObj] = useState(errorObj);
  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState(null);
  const [dobError, setDobError] = useState(false);
  const [gender, setGender] = useState("");

  const [role, setRole] = useState("");
  const [file, setFile] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    if (userType !== "super_admin") {
      userType !== "org_admin" && setRole(userType);
    }

    document
      .querySelector("#top")
      .scrollIntoView({ behavior: "auto", block: "end" });
  }, []);

  useEffect(() => {
    if (searchParams.has("id")) {
      setIsEdit(true);
      getUserData(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, [searchParams]);

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

    if (!isNull(editData?.role_slug) || !isEmpty(editData?.role_slug)) {
      setRole(editData?.role_slug);
    }
    if (!isNull(editData?.dob) || !isEmpty(editData?.dob)) {
      const convertedDOB = convertToIST(editData?.dob);
      setDob(convertedDOB);
    }
    if (
      !isNull(editData?.user_photo || editData?.profile_pic) ||
      !isEmpty(editData?.user_photo || editData?.profile_pic)
    ) {
      setFile(editData?.user_photo || editData?.profile_pic);
      setSelectedFile(editData?.user_photo || editData?.profile_pic);
    }
  };

  function validation() {
    let error = { ...errObj };
    let valid = true;
    let scroll = false;
    let section = null;

    if (isNull(fName) || isEmpty(fName.trim())) {
      valid = false;
      error.fNameErr = true;
      error.fNameMsg = "Please enter first name";
      scroll = true;
      section = document.querySelector("#fname");
    }

    if (isNull(lName) || isEmpty(lName.trim())) {
      valid = false;
      error.lNameErr = true;
      error.lNameMsg = "Please enter last name";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#lname");
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

    if (isEmpty(role)) {
      valid = false;
      error.roleErr = true;
      error.roleMsg = "Please select role";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#role");
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

    if (isEmpty(gender)) {
      valid = false;
      error.genderErr = true;
      error.genderMsg = "Please select sex";
      if (!scroll) {
        scroll = true;
        section = document.querySelector("#gender");
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
    const date = moment(dob).format("YYYY-MM-DD");
    setBtnLoad(true);
    const data = {
      firstname: fName?.trim(),
      lastname: lName?.trim(),
      phone_number: phone,
      email: email,
      dob: date,
      sex: gender,
      role_slug: role,
      profile_pic: selectedFile || [],
    };
    if (isEdit) {
      if (searchParams.has("id")) {
        data["user_id"] = Number(EncDctFn(searchParams.get("id"), "decrypt"));
      }
    }
    try {
      const response = await getAPIProgressData(
        isEdit ? Setting?.endpoints?.updateUser : Setting.endpoints.addUser,
        isEdit ? "PATCH" : "POST",
        data,
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        handleClick("success");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      toast.error(err.toString());
      setBtnLoad(false);
      console.log("err=====>>>>>", err);
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

  // get user data
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
                {isEdit ? `Edit User` : `Add User`}
              </Typography>
            </Grid>

            {/* field container */}
            <Grid
              container
              style={{
                margin: "20px 0px",
                justifyContent: "space-between",
                gap: 10,
              }}
              id="top"
            >
              {/* first name field */}
              <Grid item xs={12} sm={5.9} id="fname">
                <Grid item xs={12}>
                  <CTypography required title={"First name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter first name"
                    value={fName}
                    onChange={(e) => {
                      setFname(e.target.value?.trimStart());
                      setErrObj({
                        ...errObj,
                        fNameErr: false,
                        fNameMsg: "",
                      });
                    }}
                    inputProps={{ maxLength: 100 }}
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
              <Grid item xs={12} sm={5.9} id="lname">
                <Grid item xs={12}>
                  <CTypography required title={"Last name"} />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    placeholder="Enter last name"
                    value={lName}
                    onChange={(e) => {
                      setLname(e.target.value);
                      setErrObj({
                        ...errObj,
                        lNameErr: false,
                        lNameMsg: "",
                      });
                    }}
                    inputProps={{ maxLength: 100 }}
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
              <Grid item xs={12} sm={5.9} id="phone">
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
              <Grid item xs={12} sm={5.9} id="email">
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

              {/* Gender field */}
              <Grid item xs={12} sm={5.9} id="gender">
                <Grid item xs={12}>
                  <CTypography required title={"Sex"} />
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
                    {errObj?.genderErr ? (
                      <FormHelperText>{errObj?.genderMsg}</FormHelperText>
                    ) : null}
                  </FormControl>
                </Grid>
              </Grid>
              {/* DOB field */}
              <Grid item xs={12} sm={5.9} id="dob">
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
              <Grid item xs={12} sm={5.9} id="role">
                <Grid item xs={12}>
                  <CTypography required title={"Role"} />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth error={errObj.roleErr}>
                    <Select
                      fullWidth
                      displayEmpty
                      value={role || ""}
                      onChange={(e) => {
                        setRole(e.target.value);
                        setErrObj({ ...errObj, roleErr: false, roleMsg: "" });
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
              <Grid
                item
                xs={12}
                sm={5.9}
                style={{ marginBottom: 20, marginLeft: !sm ? "1%" : 0 }}
              >
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
