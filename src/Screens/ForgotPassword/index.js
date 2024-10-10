import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { isEmpty, isObject } from "lodash";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import theme, { color } from "../../Config/theme";
import OTPInput from "react-otp-input";
import LoginComponent from "../../Components/LoginComponent";
import { isMobile, isTablet } from "react-device-detect";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../Redux/reducers/auth/actions";
import Email from "../../Components/CustomIcon/Global/Email";
import Phone from "../../Components/CustomIcon/Global/Phone";
import MainLoader from "../../Components/Loader/MainLoader";

const errorObj = {
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
  passErr: false,
  passMsg: "",
};

export default function ForgotPassword(props) {
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const { setUserToken, setUserData, setCaptcha } = authActions;
  const { useruuid, captcha } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [errObj, setErrObj] = useState(errorObj);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(null);
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);
  const [verifyOtpLoad, setVerifyBtnLoad] = useState(false);
  const [backgroundTimer, setBackGroundTimer] = useState(0);
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [otpBool, setOtpBool] = useState(false);
  const [hasOrg, setHasOrg] = useState({});
  const [pageLoad, setPageLoad] = useState(false);

  const [disable, setDisable] = useState(false);

  useEffect(() => {
    if (otp.length > 5) {
      verifyOtp();
    }
  }, [otp]);

  useEffect(() => {
    if (captcha > 2) {
      setDisable(true);
    }
  }, [captcha]);

  useEffect(() => {
    if (location?.state?.otp === "tfa" && !isEmpty(email)) {
      generateOtp();
    }
  }, [email]);

  useEffect(() => {
    let intervalId;
    if (!backgroundTimer) {
      return;
    }
    if (location?.state?.otp === "tfa" || backgroundTimer !== 0) {
      intervalId = setInterval(() => {
        setBackGroundTimer(backgroundTimer - 1);
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [backgroundTimer]);

  useEffect(() => {
    if (location?.state?.otp === "tfa") {
      setOtpSuccess(true);
    }
    if (!isEmpty(location?.state?.email)) {
      setEmail(location?.state?.email);
    }
  }, [location]);

  useEffect(() => {
    checkOrganizationApi();
  }, []);

  function validation(type) {
    let valid = true;
    let error = { ...errObj };

    if (otpBool) {
      if (isEmpty(phone)) {
        valid = false;
        error.phoneErr = true;
        error.phoneMsg = "Please enter phone no.";
      } else if (phone.length < 10) {
        valid = false;
        error.phoneErr = true;
        error.phoneMsg = "Please enter valid phone no.";
      }
    } else {
      if (isEmpty(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter email address";
      } else if (!email_Regex.test(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter valid email";
      }
    }

    setErrObj(error);

    if (valid) {
      !otpSuccess ? generateOtp() : type ? generateOtp("resend") : verifyOtp();
    }
  }

  async function generateOtp() {
    setBtnLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.generateOtp, "POST", {
        value: otpBool ? phone : email,
        type: otpBool ? "phone" : "email",
        domain: Setting?.domain,
      });
      if (response?.status) {
        if (response?.data?.otp) {
          toast.success(response?.data?.otp);
        }
        setOtpSuccess(true);
        setBackGroundTimer(60);
      } else {
        captcha > 2 && window.location.reload();
        dispatch(setCaptcha(captcha + 1));
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      console.log("ERROR=====>>>>>", err);
      toast.error(err);
    }
  }

  async function verifyOtp() {
    setVerifyBtnLoad(true);
    setOtp("");
    try {
      const response = await getApiData(Setting.endpoints.verifyOtp, "POST", {
        // phone_number: phone,
        value: otpBool ? phone : email,
        type: location?.state?.otp === "tfa" ? "tfa" : "forgot-password",
        otp: otp,
        parameterType: otpBool ? "phone" : "email",
        platform: "web",
        uuid: useruuid,
      });
      if (response?.status) {
        toast.success(response?.message);
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          if (location?.state?.otp === "tfa") {
            dispatch(setUserToken(response?.data?.auth_token));
            dispatch(setUserData(response?.data));
            if (
              response?.data?.personal_info?.role_slug === "super_admin" ||
              response?.data?.personal_info?.role_slug === "org_admin" ||
              response?.data?.personal_info?.role_slug === "ops_admin"
            ) {
              navigate("/admin");
            } else {
              navigate("/home");
            }
          } else {
            navigate("/reset-password", { state: response?.data || "" });
          }
        }
      } else {
        toast.error(response?.message);
      }
      setVerifyBtnLoad(false);
    } catch (err) {
      console.log("ERROR=====>>>>>", err);
      toast.error(err);
      setVerifyBtnLoad(false);
    }
  }

  // this function is used to check organization
  async function checkOrganizationApi() {
    setPageLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.check, "POST", {
        domain: Setting?.domain,
      });
      if (response?.status) {
        setPageLoad(false);
        setHasOrg({
          ...hasOrg,
          status: response?.status,
          message: response?.message,
        });
      } else {
        setHasOrg({
          ...hasOrg,
          status: response?.status,
          message: response?.message,
        });
      }
      setPageLoad(false);
    } catch (er) {
      setPageLoad(false);
      console.log("ERROR=====>>>>>", er);
      toast.error(er.toString());
    }
    setPageLoad(false);
  }

  return (
    <LoginComponent
      pageLoad={pageLoad}
      otpSuccess={otpSuccess}
      handleCaptcha={(e) => {
        setDisable(e);
      }}
      child={
        pageLoad ? (
          <MainLoader />
        ) : hasOrg.status ? (
          <>
            <Grid item xs={11} sm={10} md={9}>
              {location?.state?.otp === "tfa" ? (
                <Grid
                  textAlign="center"
                  display={"flex"}
                  flexDirection={"column"}
                >
                  <Typography variant="title">
                    Two Factor Authentication
                  </Typography>
                  <Typography variant="subTitle">
                    OTP was sent to your {otpBool ? "phone" : "email"} address.
                  </Typography>
                </Grid>
              ) : (
                <>
                  {otpBool ? (
                    <TextField
                      label="Phone"
                      fullWidth
                      placeholder="Enter phone no."
                      value={phone}
                      onChange={(e) => {
                        setPhone(
                          e.target.value.replace(
                            Setting.JS_Regex.numberRegex,
                            ""
                          )
                        );
                        setErrObj({ ...errObj, phoneErr: false, phoneMsg: "" });
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
                  ) : (
                    <TextField
                      fullWidth
                      label="Email"
                      placeholder="Enter email address"
                      value={email}
                      disabled={otpSuccess}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrObj({ ...errObj, emailErr: false, emailMsg: "" });
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
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !disable) {
                          e.preventDefault();
                          validation();
                        }
                      }}
                      error={errObj.emailErr}
                      helperText={errObj.emailMsg}
                    />
                  )}
                  {!otpSuccess ? (
                    <Grid item xs={12} display="flex" justifyContent={"center"}>
                      <Grid>
                        <Typography
                          style={{
                            color: color.primary,
                            fontSize: "16px !important",
                            textAlign: "center",
                            cursor: "pointer",
                            marginTop: 10,
                          }}
                          onClick={() => {
                            setOtpBool(!otpBool);
                            setErrObj(errorObj);
                          }}
                        >
                          Send OTP via {!otpBool ? "Phone" : "Email"}
                        </Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    ""
                  )}
                </>
              )}
            </Grid>

            {otpSuccess ? (
              <>
                <Grid item xs={10} sm={9} md={9} lg={7}>
                  <OTPInput
                    value={otp}
                    onChange={(val) =>
                      setOtp(!Number.isNaN(Number(val)) ? val : otp)
                    }
                    numInputs={6}
                    renderInput={(props) => (
                      <input
                        readOnly={!otpSuccess}
                        style={{ fontSize: 50 }}
                        {...props}
                      />
                    )}
                    containerStyle={{
                      justifyContent: "space-between",
                      gap: 1,
                    }}
                    inputStyle={{
                      width: sm ? 30 : 35,
                      height: sm ? 30 : 35,
                      border: `1px solid ${color.primary}`,
                      borderRadius: 8,
                    }}
                  />
                </Grid>
                <Grid
                  item
                  container
                  xs={isMobile && !isTablet ? 12 : 10}
                  md={9}
                  lg={8}
                  gap={2}
                  justifyContent={"center"}
                >
                  <Grid item xs={5.5}>
                    <Button
                      fullWidth
                      variant="outlined"
                      style={{ color: color.primary }}
                      onClick={() => backgroundTimer === 0 && generateOtp()}
                      disabled={btnLoad}
                    >
                      {btnLoad ? (
                        <CircularProgress size={26} />
                      ) : backgroundTimer === 0 ? (
                        "Resend OTP"
                      ) : (
                        ` 00:${
                          backgroundTimer < 10
                            ? `0${backgroundTimer}`
                            : backgroundTimer
                        }`
                      )}
                    </Button>
                  </Grid>
                  <Grid item xs={5.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => validation()}
                      disabled={verifyOtpLoad}
                    >
                      {verifyOtpLoad ? (
                        <CircularProgress size={26} />
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                  </Grid>
                </Grid>
              </>
            ) : (
              <Grid item xs={11} sm={10} md={9}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => validation()}
                  disabled={btnLoad || disable}
                >
                  {btnLoad ? <CircularProgress size={26} /> : "Get OTP"}
                </Button>
              </Grid>
            )}

            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <Grid>
                <Typography
                  style={{
                    color: color.primary,
                    fontSize: "16px !important",
                    textAlign: "center",
                    cursor: "pointer",
                  }}
                  onClick={() => navigate(-1)}
                >
                  Back to Login
                </Typography>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography variant="title" marginTop={5} textAlign={"center"}>
            {hasOrg?.message}
          </Typography>
        )
      }
    />
  );
}
