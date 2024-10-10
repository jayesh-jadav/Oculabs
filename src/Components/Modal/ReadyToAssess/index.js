import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isEmpty, isNull, isObject } from "lodash";
import { toast } from "react-toastify";
import styles from "./styles";
import { useNavigate, useSearchParams } from "react-router-dom";
import { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { useDispatch, useSelector } from "react-redux";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Email from "../../CustomIcon/Global/Email";
import Phone from "../../CustomIcon/Global/Phone";
import authActions from "../../../Redux/reducers/auth/actions";

const errorObj = {
  phoneErr: false,
  phoneMsg: "",
  emailErr: false,
  emailMsg: "",
  preferErr: false,
  preferMsg: "",
};

export default function ReadyToAssess(props) {
  const {
    visible = false,
    handleModal = () => null,
    patientData = {},
    patientId = "",
    eventId,
    from,
    newType = "",
  } = props;

  const { userData, userType } = useSelector((state) => state.auth);
  const { setEventID } = authActions;
  const dispatch = useDispatch();

  const className = styles();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [type, setType] = useState("phone");
  const [check, setCheck] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const email_Regex = Setting.JS_Regex.email_Regex;
  const [errObj, setErrObj] = useState(errorObj);
  const [eyeTracking, setEyeTracking] = useState(false);
  const [digitRecall, setDigitRecall] = useState(false);
  const [wordRecall, setWordRecall] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    resetData();
    if (userType === "org_admin" && !isEmpty(userData)) {
      getOranizationdata(userData?.personal_info?.tenant_id);
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(data)) {
      if (data?.eye_tracking === 1) {
        setEyeTracking(true);
      } else {
        setEyeTracking(false);
      }
      if (data?.digit_recall === 1) {
        setDigitRecall(true);
      } else {
        setDigitRecall(false);
      }
      if (data?.word_recall === 1) {
        setWordRecall(true);
      } else {
        setWordRecall(false);
      }
    }
  }, [data, visible]);

  useEffect(() => {
    if (!isNull(patientData?.phone) || !isEmpty(patientData?.phone)) {
      setPhone(patientData?.phone);
    }
    if (!isNull(patientData?.email) || !isEmpty(patientData?.email)) {
      setEmail(patientData?.email);
    }
  }, [patientData]);

  // this function is used for get a org data by id
  async function getOranizationdata(id) {
    try {
      const response = await getApiData(
        `${Setting.endpoints.getOrgByID}?tenant_id=${id}`,
        "GET"
      );
      if (response.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setData(response?.data);
        }
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  // get patients questions function
  async function getInvitation() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.appInvitation}`,
        "POST",
        {
          patient_id:
            patientData?.id ||
            Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          type: type,
          value: type === "phone" ? phone : email,
          event_id:
            eventId ||
            Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          eye_tracking: eyeTracking ? 1 : 0,
          digit_recall: digitRecall ? 1 : 0,
          word_recall: wordRecall ? 1 : 0,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        delete queryParams.event_id;
        setSearchParams({ ...queryParams }, { replace: true });
        if (check) {
          navigate(
            `/patient/details?patient_id=${EncDctFn(
              patientData?.id,
              "encrypt"
            )}`,
            {
              state:
                from === "patient"
                  ? { data: patientData }
                  : { type: "event", data: patientData },
            }
          );
        }
        handleModal("close");
        dispatch(setEventID(""));
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  // radio change
  const handleChange = (event) => {
    setType(event.target.value);
  };

  const validation = () => {
    let valid = true;
    let error = { ...errorObj };

    if (type === "phone") {
      if (isEmpty(phone)) {
        valid = false;
        error.phoneErr = true;
        error.phoneMsg = "Please enter phone no.";
      }
    } else {
      if (isEmpty(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter email";
      } else if (!email_Regex.test(email)) {
        valid = false;
        error.emailErr = true;
        error.emailMsg = "Please enter valid email";
      }
    }
    setErrObj(error);
    if (valid) {
      getInvitation();
    }
  };

  // reset data
  function resetData() {
    setCheck(false);
    setType("phone");
    setBtnLoad(false);
  }

  return (
    <CModal
      visible={visible}
      handleModal={() => {
        dispatch(setEventID(""));
        handleModal("close");
      }}
      title={"Ready To Assess"}
      children={
        <>
          <Grid container className={className.scrollbar}>
            <Grid item xs={12} textAlign="center">
              <Typography variant="tableTitle">
                Assessments Preferences
              </Typography>
              <Typography>Assessments completed with Oculabs App</Typography>
              <Typography>Send Invitation to Oculabs</Typography>
            </Grid>
            {/* patient id */}
            <Grid item xs={12}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <Typography style={{ marginRight: 5 }}>
                  Patient ID :{" "}
                </Typography>
                <Typography>
                  {!isNull(patientId) && !isEmpty(patientId) ? patientId : "-"}
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Typography style={{ marginRight: 5 }}>
                  Patient Name :
                </Typography>
                <div
                  style={{
                    maxWidth: 200,
                    overflow: "hidden",
                  }}
                >
                  <Typography
                    style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}
                  >
                    {(!isEmpty(patientData?.firstname) &&
                      patientData?.firstname) +
                      " " +
                      (!isEmpty(patientData?.lastname) &&
                        patientData?.lastname)}
                  </Typography>
                </div>
              </div>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue="phone"
                name="radio-buttons-group"
                value={type}
                onChange={handleChange}
                style={{ width: "100%", marginTop: 10 }}
              >
                <Grid item xs={12} style={{ display: "flex" }}>
                  <Grid item style={{ minWidth: 150 }}>
                    <FormControlLabel
                      value="phone"
                      control={<Radio />}
                      label={`Invite by phone : `}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Phone no"
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
                  </Grid>
                </Grid>
                <Grid item xs={12} style={{ display: "flex", marginTop: 10 }}>
                  <Grid item style={{ minWidth: 150 }}>
                    <FormControlLabel
                      value="email"
                      control={<Radio />}
                      label={`Invite by email :`}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      placeholder="Email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value.trim());
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
                      error={errObj.emailErr}
                      helperText={errObj.emailMsg}
                    />
                  </Grid>
                </Grid>
              </RadioGroup>
            </Grid>

            <Grid item xs={12} display="flex" alignItems={"center"} gap={1}>
              {newType !== "Baseline" && data?.eye_tracking === 1 && (
                <Grid
                  item
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CTypography
                    title="Eye-Tracking"
                    style={{ marginBottom: 0, marginRight: 20 }}
                  />
                  <Switch
                    checked={eyeTracking}
                    onChange={() => setEyeTracking(!eyeTracking)}
                  />
                </Grid>
              )}
              {data?.digit_recall === 1 && (
                <Grid
                  item
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CTypography
                    title="Digit Recall"
                    style={{ marginBottom: 0, marginRight: 20 }}
                  />
                  <Switch
                    checked={digitRecall}
                    onChange={() => setDigitRecall(!digitRecall)}
                  />
                </Grid>
              )}
              {data?.word_recall === 1 && (
                <Grid
                  item
                  style={{
                    marginTop: 10,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CTypography
                    title="Immediate Recall"
                    style={{ marginBottom: 0, marginRight: 20 }}
                  />
                  <Switch
                    checked={wordRecall}
                    onChange={() => setWordRecall(!wordRecall)}
                  />
                </Grid>
              )}
            </Grid>

            <Grid item xs={12} style={{ marginTop: 10 }}>
              <FormControlLabel
                control={<Checkbox onChange={() => setCheck(true)} />}
                label="Proctor Initial Assessment"
              />
            </Grid>
          </Grid>

          <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
            <Button
              variant="outlined"
              style={{ width: "10rem", marginRight: 20 }}
              onClick={() => handleModal("back")}
            >
              Back
            </Button>
            <Button
              variant="contained"
              style={{ width: "10rem" }}
              onClick={() => validation()}
              disabled={btnLoad}
            >
              {btnLoad ? <CircularProgress size={22} /> : "Continue"}
            </Button>
          </Grid>
        </>
      }
    />
  );
}
