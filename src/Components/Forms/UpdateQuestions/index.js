import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { TitleOutlined } from "@mui/icons-material";
import styles from "./styles";
import { color } from "../../../Config/theme";
import { CTypography } from "../../CTypography";
import { isEmpty, isNull } from "lodash";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import BackBtn from "../../BackBtn";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import MainLoader from "../../Loader/MainLoader";
import { isTablet } from "react-device-detect";

const errorObj = {
  QuestoinErr: false,
  QuestionMsg: "",
  patientQueErr: false,
  patientQueMsg: "",
};

export default function UpdateQuestions(props) {
  const { handleClick = () => null } = props;
  const className = styles();

  const [searchParams, setSearchParams] = useSearchParams();

  const [errObj, setErrObj] = useState(errorObj);
  const [qData, setQdata] = useState([]);
  const [question, setQuestion] = useState("");
  const [event_type, setEventType] = useState("");
  const [patient_question, setPatientQuestion] = useState("");
  const [meta_name, setMetaName] = useState("");
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    setQuestion(qData?.question);
    setPatientQuestion(qData?.patient_question);
    setMetaName(qData?.meta_name);
    getEventType(qData?.event_type);
  }, [qData]);

  const getEventType = (type) => {
    let eventType;
    switch (type) {
      case "1":
        eventType = "Med History";
        break;
      case "2":
        eventType = "Immediate Post Injury Screening";
        break;
      case "3":
        eventType = "Potential Concussive Event Information";
        break;
      case "4":
        eventType = "Treatment Info";
        break;
      case "5":
        eventType = "Symptom Inventory";
        break;
      case "6":
        eventType = "Immediate Recall";
        break;
      case "7":
        eventType = "Digit Recall";
        break;
      default:
        eventType = "";
    }
    setEventType(eventType);
    return eventType;
  };

  useEffect(() => {
    if (searchParams.has("id")) {
      getQuestionByIdApi(Number(EncDctFn(searchParams.get("id"), "decrypt")));
    }
  }, [searchParams]);

  async function getQuestionByIdApi(id) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.questionById}?id=${id}`,
        "GET"
      );

      if (response?.status) {
        setQdata(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (err) {
      setLoader(false);
      toast.error(err.toString());
      console.log("🚀 ~ file: index.js:85 ~ err======>>>>>>>", err);
    }
  }

  function validation() {
    let error = { ...errObj };
    let valid = true;

    if (isNull(question) || isEmpty(question.trim())) {
      valid = false;
      error.QuestoinErr = true;
      error.QuestionMsg = "Please enter question";
    }

    if (isNull(patient_question) || isEmpty(patient_question.trim())) {
      valid = false;
      error.patientQueErr = true;
      error.patientQueMsg = "Please enter patient question";
    }

    setErrObj(error);

    if (valid) {
      updateQuestion();
    }
  }

  async function updateQuestion() {
    setBtnLoad(true);
    const data = {
      question: question,
      patient_question: patient_question,
    };

    try {
      const response = await getApiData(
        Setting?.endpoints?.updateQuestion + "?id=" + qData?.id,
        "PATCH",
        data,
        true
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
      console.log("err=====>>>>>", err);
    }
  }

  return (
    <div className={className.container}>
      <Grid container marginBottom={"30px"} className={className.gridContainer}>
        <Grid container alignItems={"center"}>
          <BackBtn handleClick={() => handleClick("cancel")} />
          <Typography variant="title" style={{ color: color.primary }}>
            Edit Question
          </Typography>
        </Grid>

        {loader ? (
          <Grid container justifyContent={"center"} alignItems={"center"}>
            <MainLoader />
          </Grid>
        ) : (
          <Grid
            container
            style={{ margin: 16, justifyContent: "space-between", gap: 10 }}
          >
            {/*  question field */}
            <Grid item xs={12} sm={!isTablet && 5.8} id="question">
              <Grid item xs={12}>
                <CTypography required title={"Proctor Question"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Proctor Question"
                  value={question}
                  onChange={(e) => {
                    setQuestion(e.target.value);
                    setErrObj({
                      ...errObj,
                      QuestoinErr: false,
                      QuestionMsg: "",
                    });
                  }}
                  inputProps={{ maxLength: 100 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleOutlined
                          style={{
                            color: errObj.QuestoinErr
                              ? color.error
                              : color.primary,
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.QuestoinErr}
                  helperText={errObj.QuestionMsg}
                />
              </Grid>
            </Grid>
            {/* patient_question field */}
            <Grid item xs={12} sm={!isTablet && 5.8} id="lname">
              <Grid item xs={12}>
                <CTypography required title={"Patient Question"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder="Patient Question"
                  value={patient_question}
                  onChange={(e) => {
                    setPatientQuestion(e.target.value);
                    setErrObj({
                      ...errObj,
                      patientQueErr: false,
                      patientQueMsg: "",
                    });
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleOutlined
                          style={{
                            color: errObj.patientQueErr
                              ? color.error
                              : color.primary,
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  error={errObj.patientQueErr}
                  helperText={errObj.patientQueMsg}
                />
              </Grid>
            </Grid>

            {/* meta_name field*/}
            <Grid item xs={12} sm={5.8} id="meta_name">
              <Grid item xs={12}>
                <CTypography required title={"Metric Name"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={true}
                  fullWidth
                  placeholder="Metric Name"
                  value={meta_name}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdOutlineAlternateEmail
                          style={{
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {/* event_type field*/}
            <Grid item xs={12} sm={5.8} id="event_type">
              <Grid item xs={12}>
                <CTypography required title={"Event Type"} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  disabled={true}
                  fullWidth
                  placeholder="Event Type"
                  value={event_type}
                  inputProps={{ maxLength: 10 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MdOutlineAlternateEmail
                          style={{
                            paddingRight: 5,
                            fontSize: "22px",
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        )}

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
              {btnLoad ? <CircularProgress size={22} /> : "Update"}
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
      </Grid>
    </div>
  );
}
