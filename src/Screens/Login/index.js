import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isEmpty, isObject } from "lodash";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../Redux/reducers/auth/actions";
import { color } from "../../Config/theme";
import useStyles from "./styles";
import LoginComponent from "../../Components/LoginComponent";
import MainLoader from "../../Components/Loader/MainLoader";
import Email from "../../Components/CustomIcon/Global/Email";
import Password from "../../Components/CustomIcon/Global/Password";

const errorObj = {
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
  passErr: false,
  passMsg: "",
};

export default function Login() {
  const classes = useStyles();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    setUserData,
    setUserToken,
    setIsSuperAdmin,
    setRefreshTokenExpired,
    setCaptcha,
    setLoginImage,
  } = authActions;

  const { useruuid, captcha } = useSelector((state) => state.auth);

  // email regex
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [errObj, setErrObj] = useState(errorObj);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [hasOrg, setHasOrg] = useState({});
  const [pageLoad, setPageLoad] = useState(true);

  const [disable, setDisable] = useState(false);

  const nextRef = useRef();

  useEffect(() => {
    checkOrganizationApi();
  }, []);

  useEffect(() => {
    if (captcha > 2) {
      setDisable(true);
    }
  }, [captcha]);

  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (isEmpty(email)) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter email address";
    } else if (!email_Regex.test(email)) {
      valid = false;
      error.emailErr = true;
      error.emailMsg = "Please enter valid email";
    }

    if (isEmpty(password)) {
      valid = false;
      error.passErr = true;
      error.passMsg = "Please enter password";
    }

    setErrObj(error);

    if (valid) {
      loginApiCall();
    }
  }

  async function checkOrganizationApi() {
    setPageLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.check, "POST", {
        domain: Setting?.domain,
      });
      if (response?.status) {
        setHasOrg({
          status: response?.status,
          message: response?.message,
        });
        if (!isEmpty(response?.data?.screenshot)) {
          dispatch(setLoginImage(response?.data?.screenshot));
        }
      } else {
        navigate("/page-not-found", {
          state: { from: "login" },
        });
      }
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setPageLoad(false);
    }
  }

  async function loginApiCall() {
    setBtnLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.login, "POST", {
        email: email,
        password: password,
        domain: Setting?.domain,
        platform: "web",
        uuid: useruuid,
      });
      if (response?.status) {
        toast.success(response?.message);
        if (
          !isEmpty(response?.data) &&
          isObject(response?.data) &&
          !isEmpty(response?.data?.userData) &&
          isObject(response?.data?.userData)
        ) {
          if (response?.data?.enable_2fa) {
            navigate("/2fa", {
              state: { otp: "tfa", email: email },
            });
          } else if (
            response?.data?.userData?.personal_info?.role_slug === "super_admin"
          ) {
            dispatch(setIsSuperAdmin(true));
            dispatch(setUserToken(response?.data?.auth_token));
            dispatch(
              setRefreshTokenExpired(response?.data?.refresh_token_expired_at)
            );
            dispatch(setUserData(response?.data?.userData));
            navigate("/admin", { replace: true });
          } else {
            dispatch(setUserToken(response?.data?.auth_token));
            dispatch(
              setRefreshTokenExpired(response?.data?.refresh_token_expired_at)
            );
            dispatch(setUserData(response?.data?.userData));
            navigate("/home", { replace: true });
          }
        }

        dispatch({ type: "socket/connect" }); // connect
      } else {
        captcha > 2 && window.location.reload();
        dispatch(setCaptcha(captcha + 1));
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
    } finally {
      setBtnLoad(false);
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
        ) : hasOrg.status ? (
          <>
            <Grid item xs={11} sm={10} md={9}>
              <TextField
                fullWidth
                label="Email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => {
                  const value = e.target.value.trim();
                  setEmail(value);
                  setErrObj({ ...errObj, emailErr: false, emailMsg: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    nextRef.current.focus();
                  }
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
            <Grid item xs={11} sm={10} md={9}>
              <TextField
                fullWidth
                label="Password"
                placeholder="Enter password"
                type={showPass ? "text" : "password"}
                value={password}
                inputRef={nextRef}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrObj({ ...errObj, passErr: false, passMsg: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !disable) {
                    e.preventDefault();
                    loginApiCall();
                  }
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
            <Grid item xs={11} sm={10} md={9}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => validation()}
                disabled={btnLoad || disable}
              >
                {btnLoad ? <CircularProgress size={26} /> : "Login"}
              </Button>
            </Grid>
            <Grid item xs={12} display="flex" justifyContent={"center"}>
              <Grid>
                <Link
                  to="/forgot-password"
                  style={{ textDecoration: "none", outline: "none" }}
                >
                  <Typography className={classes.forgot}>
                    Forgot Password?
                  </Typography>
                </Link>
              </Grid>
            </Grid>
          </>
        ) : (
          <Typography variant="title" marginTop={5} textAlign={"center"}>
            {hasOrg?.message ||
              "We're experiencing some technical difficulties right now. Please try again later."}
          </Typography>
        )
      }
    />
  );
}
