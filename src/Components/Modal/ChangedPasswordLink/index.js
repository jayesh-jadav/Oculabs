import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import CModal from "../CModal";
import { color } from "../../../Config/theme";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isEmpty } from "lodash";
import Send from "../../CustomIcon/Global/Send";
import Password from "../../CustomIcon/Global/Password";
import PassValidation from "../../PasswordValidation";

const errorObj = {
  cPassErr: false,
  cPassMsg: "",
  passErr: false,
  passMsg: "",
};

export default function ChangedPasswordLink(props) {
  const { handleModal = () => null, visible, data, from, model } = props;
  const [btnLoad, setBtnLoad] = useState(false);
  const [type, setType] = useState("phone");
  const [errObj, setErrObj] = useState({});
  const [password, setPassword] = useState("");
  const [cPassword, setCpassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showCpass, setShowCpass] = useState(false);
  const [passValid, setPassValid] = useState(false);
  const fullName = data?.middlename
    ? data?.firstname + " " + data?.middlename + " " + data?.lastname
    : data?.firstname + " " + data?.lastname;

  useEffect(() => {
    if (visible) {
      setErrObj(errorObj);
    }
  }, [visible]);

  // send changed password link api call function
  async function sendPassLink(id) {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        from === "superAdmin"
          ? Setting.endpoints.changePasswordLink
          : Setting.endpoints.sendUserChangePasswordLink,
        "post",
        {
          user_id: id,
          sent_to: type,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        handleModal("close");
        setType("phone");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      console.log("err =======>>>", err);
      toast.error(err.toString());
      setBtnLoad(false);
    }
  }

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
      changePassword();
    }
  }

  async function changePassword() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.forceChangePassword,
        "POST",
        {
          user_id: from === "provider" ? data?.provider_uid : data?.id || "",
          newPassword: password,
          confirmPassword: cPassword,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        clear();
        handleModal("close");
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      console.log("ERROR=====>>>>>", err);
      toast.error(err);
      setBtnLoad(false);
    }
  }

  function clear() {
    setPassword("");
    setCpassword("");
  }

  return (
    <CModal
      title={
        model === "sendLink"
          ? "Send password reset instructions"
          : "Change password"
      }
      visible={visible}
      handleModal={() => {
        handleModal("close");
        setType("phone");
        clear();
      }}
      maxWidth={500}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      children={
        model === "sendLink" ? (
          <Grid container>
            <Grid item xs={12}>
              <Typography variant="subTitle">Name: {fullName}</Typography>
            </Grid>
            <RadioGroup
              aria-labelledby="demo-radio-buttons-group-label"
              defaultValue="phone"
              name="radio-buttons-group"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ width: "100%", marginTop: 10 }}
            >
              <FormControlLabel
                value="phone"
                control={<Radio />}
                label={`Invite by phone : ${data?.phone}`}
              />
              <FormControlLabel
                value="email"
                control={<Radio />}
                label={`Invite by email : ${data?.email}`}
              />
            </RadioGroup>
            <Grid
              item
              xs={4}
              style={{ marginLeft: "auto", marginTop: 10, marginBottom: 10 }}
            >
              <Button
                fullWidth
                variant="contained"
                endIcon={!btnLoad && <Send fill={color.white} />}
                onClick={() => {
                  if (from === "provider") {
                    sendPassLink(data?.provider_uid);
                  } else {
                    sendPassLink(data?.id);
                  }
                }}
                disabled={btnLoad}
              >
                {btnLoad ? <CircularProgress size={22} /> : "Send"}
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Grid container padding={1} rowGap={2} justifyContent={"center"}>
            <Grid item xs={12} style={{ marginBottom: 10 }}>
              <Typography variant="subTitle">Name: {fullName}</Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                placeholder="Enter new password"
                type={showPass ? "text" : "password"}
                value={password}
                autoComplete="new-password"
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
              <Grid item xs={12} mt={-2}>
                <PassValidation
                  password={password}
                  name={data?.firstname}
                  handleValid={(value) => {
                    setPassValid(value);
                  }}
                />
              </Grid>
            )}

            <Grid item xs={12} mt={2}>
              <TextField
                fullWidth
                label="Confirm Password"
                placeholder="Enter confirm password"
                type={showCpass ? "text" : "password"}
                value={cPassword}
                autoComplete="new-password"
                onChange={(e) => {
                  setCpassword(e.target.value);
                  setErrObj({ ...errObj, cPassErr: false, cPassMsg: "" });
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
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
            <Grid
              item
              xs={4}
              style={{ marginLeft: "auto", marginTop: 10, marginBottom: 5 }}
            >
              <Button
                fullWidth
                variant="contained"
                onClick={() => {
                  validation();
                }}
                disabled={btnLoad || !passValid}
              >
                {btnLoad ? <CircularProgress size={22} /> : "Submit"}
              </Button>
            </Grid>
          </Grid>
        )
      }
    />
  );
}
