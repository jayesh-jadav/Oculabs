import React, { useState } from "react";
import {
  Typography,
  Backdrop,
  Fade,
  Box,
  Modal,
  Button,
  CircularProgress,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import useStyles from "./styles";
import { useSelector } from "react-redux";
import { isMobile, isTablet } from "react-device-detect";
import { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { CloseOutlined } from "@mui/icons-material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import { isEmpty } from "lodash";
import { Setting } from "../../../Utils/Setting";
import { getApiData } from "../../../Utils/APIHelper";
import { toast } from "react-toastify";
import Password from "../../CustomIcon/Global/Password";

const errorObj = {
  currentErr: false,
  currentMsg: "",
  newPassErr: false,
  newPassMsg: "",
  confPassErr: false,
  confPassMsg: "",
};

function SetPasswordModal(props) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "75vw" : isTablet ? "60vw" : 500,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
  };
  const { isOnline } = useSelector((state) => state.auth);
  const { visible = false, handleClick = () => null, email = "" } = props;
  const classes = useStyles();

  const [currentPass, setCurrentPass] = useState("");
  const [currentShowPass, setCurrentShowPass] = useState(false);
  const [errObj, setErrObj] = useState(errorObj);
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [confPass, setConfPassword] = useState("");
  const [showConfPass, setShowConfPass] = useState("");
  const [btnLoad, setBtnLoad] = useState(false);

  // validation
  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (isEmpty(currentPass)) {
      valid = false;
      error.currentErr = true;
      error.currentMsg = "Please enter current password";
    } else if (currentPass.length < 6 || currentPass.length > 15) {
      valid = false;
      error.currentErr = true;
      error.currentMsg = "The password length must Between 6 to 15 Character";
    }

    if (isEmpty(newPass)) {
      valid = false;
      error.newPassErr = true;
      error.newPassMsg = "Please enter new password";
    } else if (newPass.length < 6 || newPass.length > 15) {
      valid = false;
      error.newPassErr = true;
      error.newPassMsg = "The password length must between 6 to 15 character";
    }
    if (isEmpty(confPass)) {
      valid = false;
      error.confPassErr = true;
      error.confPassMsg = "Please enter confirm password";
    } else if (newPass !== confPass) {
      valid = false;
      error.confPassErr = true;
      error.confPassMsg = "New password and confirm password must be same";
    }

    setErrObj(error);

    if (valid) {
      setPassword();
    }
  }

  // set password api call
  async function setPassword() {
    setBtnLoad(true);
    try {
      const response = await getApiData(Setting.endpoints.setPassword, "POST", {
        email: email,
        current_password: currentPass,
        new_password: newPass,
        confirm_password: confPass,
      });
      if (response.status) {
        toast.success(response.message);
        handleClick("success");
      } else {
        toast.error(response.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
    }
  }

  return (
    <Modal
      open={visible}
      onClose={() => {
        return null;
      }}
      closeAfterTransition
      disableAutoFocus
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={visible}>
        <Box sx={style}>
          <Grid container alignItems={"center"} justifyContent={"center"}>
            <Typography variant="title" className={classes.modalTitle}>
              Set Password
            </Typography>
          </Grid>

          {/* close  */}
          <IconButton
            style={{
              position: "absolute",
              top: 0,
              right: 0,
            }}
            onClick={() => handleClick("close")}
          >
            <CloseOutlined />
          </IconButton>
          {/* current password field */}
          <Grid
            item
            container
            display={"flex"}
            alignItems={"center"}
            style={{ marginBottom: 20 }}
            id="newPass"
          >
            <Grid item xs={12}>
              <CTypography required title={"Current password"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter current password"
                value={currentPass}
                type={currentShowPass ? "text" : "password"}
                onChange={(e) => {
                  setCurrentPass(e.target.value);
                  setErrObj({ ...errObj, currentErr: false, currentMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      style={{ marginRight: -5 }}
                      position="start"
                    >
                      <Password
                        fill={errObj.currentErr ? color.error : color.primary}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment
                      position="end"
                      style={{ cursor: "pointer" }}
                      onClick={() => setCurrentShowPass(!currentShowPass)}
                    >
                      {currentShowPass ? (
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
                error={errObj.currentErr}
                helperText={errObj.currentMsg}
              />
            </Grid>
          </Grid>
          {/* new password field */}
          <Grid
            item
            container
            display={"flex"}
            alignItems={"center"}
            style={{ marginBottom: 20 }}
            id="newPass"
          >
            <Grid item xs={12}>
              <CTypography required title={"New password"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter new password"
                value={newPass}
                type={showPass ? "text" : "password"}
                onChange={(e) => {
                  setNewPass(e.target.value);
                  setErrObj({ ...errObj, newPassErr: false, newPassMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      style={{ marginRight: -5 }}
                      position="start"
                    >
                      <Password
                        fill={errObj.newPassErr ? color.error : color.primary}
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
                error={errObj.newPassErr}
                helperText={errObj.newPassMsg}
              />
            </Grid>
          </Grid>
          {/* confirm password field */}
          <Grid
            item
            container
            display={"flex"}
            alignItems={"center"}
            style={{ marginBottom: 20 }}
            id="newPass"
          >
            <Grid item xs={12}>
              <CTypography required title={"Confirm password"} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                placeholder="Enter confirm password"
                value={confPass}
                type={showConfPass ? "text" : "password"}
                onChange={(e) => {
                  setConfPassword(e.target.value);
                  setErrObj({ ...errObj, confPassErr: false, confPassMsg: "" });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      style={{ marginRight: -5 }}
                      position="start"
                    >
                      <Password
                        fill={errObj.confPassErr ? color.error : color.primary}
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
                error={errObj.confPassErr}
                helperText={errObj.confPassMsg}
              />
            </Grid>
          </Grid>

          <div className={classes.splitViewStyle}>
            <Button
              variant={"contained"}
              color="primary"
              className={classes.modalBtnStyle}
              fullWidth
              onClick={() => {
                validation();
              }}
              disabled={btnLoad || !isOnline}
              style={{ width: 200 }}
            >
              {btnLoad ? <CircularProgress size={22} /> : "Yes"}
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}

export default SetPasswordModal;
