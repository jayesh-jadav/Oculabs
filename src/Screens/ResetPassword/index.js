import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isArray, isEmpty, isNull } from "lodash";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { color } from "../../Config/theme";
import LoginComponent from "../../Components/LoginComponent";
import { useSelector } from "react-redux";
import MainLoader from "../../Components/Loader/MainLoader";
import Password from "../../Components/CustomIcon/Global/Password";
import PassValidation from "../../Components/PasswordValidation";

const errorObj = {
  cPassErr: false,
  cPassMsg: "",
  passErr: false,
  passMsg: "",
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { captcha } = useSelector((state) => state.auth);
  const [token, setToken] = useState("");
  const [errObj, setErrObj] = useState(errorObj);
  const [password, setPassword] = useState("");
  const [cPassword, setCpassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [disable, setDisable] = useState(false);
  const [checkExpiredToken, setCheckExpiredToken] = useState({
    message: "",
    bool: false,
  });
  const [pageLoad, setPageLoad] = useState(false);
  const [passValid, setPassValid] = useState(false);

  useEffect(() => {
    if (!isNull(location?.state)) {
      setToken(location?.state?.otp_token);
    } else {
      const newToken = location?.search.split("=");
      if (isArray(newToken) && !isEmpty(newToken)) {
        setToken(newToken[1]);
        if (!isEmpty(newToken[1])) {
          checkResetToken(newToken[1]);
        }
      }
    }
  }, [location]);

  useEffect(() => {
    if (captcha > 2) {
      setDisable(true);
    }
  }, [captcha]);

  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (isEmpty(password)) {
      valid = false;
      error.passErr = true;
      error.passMsg = "Please enter new password";
    } else if (password.length < 6 || password.length > 15) {
      valid = false;
      error.passErr = true;
      error.passMsg = "The password length must between 6 to 15 character";
    }

    if (isEmpty(cPassword)) {
      valid = false;
      error.cPassErr = true;
      error.cPassMsg = "Please enter confirm password";
    } else if (password.length < 6 || password.length > 15) {
      valid = false;
      error.cPassErr = true;
      error.cPassMsg = "The password length must Between 6 to 15 Character";
    } else if (password.toString() !== cPassword.toString()) {
      valid = false;
      error.cPassErr = true;
      error.cPassMsg = "New password & confirm password does not match";
    }

    setErrObj(error);

    if (valid) {
      ResetPassword();
    }
  }

  // this function is used to reset password
  async function ResetPassword() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        !isEmpty(location?.search)
          ? Setting.endpoints.setPassword
          : Setting.endpoints.resetPassword,
        "POST",
        !isEmpty(location?.search)
          ? {
              new_password: password,
              confirm_password: cPassword,
              token: token || "",
            }
          : {
              password: cPassword,
              token: token || "",
            }
      );
      if (response?.status) {
        toast.success(response?.message);
        navigate("/login");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      console.log("ERROR=====>>>>>", err);
      toast.error(err.toString());
      setBtnLoad(false);
    }
  }

  // this function is used check reset password link expired or not
  async function checkResetToken(checkToken) {
    setPageLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.checkResetTokenExpired,
        "POST",
        {
          token: checkToken || "",
        }
      );
      if (response?.status) {
        setPageLoad(false);
        toast.success(response?.message);
        setCheckExpiredToken({ bool: false });
      } else {
        setCheckExpiredToken({ bool: true, message: response?.message });
        // toast.error(response?.message);
      }
      setPageLoad(false);
    } catch (err) {
      setPageLoad(false);
      console.log("ERROR=====>>>>>", err);
      toast.error(err.toString());
    }
  }
  return (
    <LoginComponent
      pageLoad={pageLoad}
      handleCaptcha={(e) => {
        setDisable(e);
      }}
      child={
        pageLoad ? (
          <MainLoader />
        ) : !checkExpiredToken.bool ? (
          <>
            <Grid item xs={11} sm={10} md={9}>
              <TextField
                fullWidth
                label="New Password"
                placeholder="Enter new password"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value?.trim());
                  setErrObj({ ...errObj, passErr: false, passMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      style={{ marginRight: -5 }}
                      position="start"
                    >
                      <Password
                        fill={errObj.passErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPass(!showPass)}
                    >
                      {showPass ? (
                        <VisibilityOutlinedIcon
                          style={{
                            color: color.primary,
                          }}
                        />
                      ) : (
                        <VisibilityOffOutlinedIcon />
                      )}
                    </InputAdornment>
                  ),
                }}
                error={errObj.passErr}
                helperText={errObj.passMsg}
              />
            </Grid>
            {!isEmpty(password) && (
              <Grid item xs={11} sm={10} md={9} mt={-5}>
                <PassValidation
                  password={password}
                  name={location?.state?.personal_info?.firstname || ""}
                  handleValid={(value) => {
                    setPassValid(value);
                  }}
                />
              </Grid>
            )}
            <Grid item xs={11} sm={10} md={9}>
              <TextField
                fullWidth
                label="Confirm Password"
                placeholder="Enter confirm password"
                type={showCpass ? "text" : "password"}
                value={cPassword}
                onChange={(e) => {
                  setCpassword(e.target.value);
                  setErrObj({ ...errObj, cPassErr: false, cPassMsg: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !disable) {
                    e.preventDefault();
                    validation();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      style={{ marginRight: -5 }}
                      position="start"
                    >
                      <Password
                        fill={errObj.cPassErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowCpass(!showCpass)}
                    >
                      {showCpass ? (
                        <VisibilityOutlinedIcon
                          style={{
                            color: color.primary,
                          }}
                        />
                      ) : (
                        <VisibilityOffOutlinedIcon />
                      )}
                    </InputAdornment>
                  ),
                }}
                error={errObj.cPassErr}
                helperText={errObj.cPassMsg}
              />
            </Grid>
            <Grid item xs={11} sm={10} md={9}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => validation()}
                disabled={btnLoad || disable || !passValid}
              >
                {btnLoad ? <CircularProgress size={26} /> : "Reset Password"}
              </Button>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <Grid>
                <Link
                  to={"/login"}
                  style={{ textDecoration: "none", outline: "none" }}
                >
                  <Typography
                    style={{
                      color: color.primary,
                      fontSize: "16px !important",
                      textAlign: "center",
                      cursor: "pointer",
                    }}
                  >
                    Back to Login
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography variant="title" marginTop={5} textAlign={"center"}>
            {checkExpiredToken?.message}
          </Typography>
        )
      }
    />
  );
}
