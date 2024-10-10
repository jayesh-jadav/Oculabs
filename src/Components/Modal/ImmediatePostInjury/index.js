import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  CircularProgress,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { color } from "../../../Config/theme";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isArray, isEmpty, isNull, isUndefined } from "lodash";
import { toast } from "react-toastify";
import styles from "./style";
import { CTypography } from "../../CTypography";
import moment from "moment/moment";
import NoData from "../../NoData";
import MainLoader from "../../Loader/MainLoader";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useDispatch } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";

export default function ImmediatePostInjury(props) {
  const {
    data = {},
    visible = false,
    handleModal = () => null,
    from = "",
    note = "",
    cancelBtn,
  } = props;

  const className = styles();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setEventID } = authActions;
  const dispatch = useDispatch();

  const eyeResponse = [
    "No eye opening",
    "Eye opening in response to pain",
    "Eye opening to speech",
    "Eye opening spontaneously",
  ];

  const verbalResponse = [
    "Incomprehensible sounds",
    "Inappropriate sounds",
    "Inappropriate words",
    "Confused",
    "Oriented",
  ];

  const motorResponse = [
    "No motor response",
    "Extension to pain",
    "Abnormal flexion to pain",
    "Flexion / Withdrawal to pain",
    "Localizes to pain",
    "Obeys commands",
  ];
  const yesNo = ["Yes", "No"];
  const correctIncorrect = ["Correct", "Incorrect"];

  const [loader, setLoader] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);

  const [answers, setAnswers] = useState({});
  const [btnLoad, setBtnLoad] = useState(false);

  useEffect(() => {
    if (visible || from === "IPIInfo" || searchParams.has("patient_id")) {
      getPatientQuestions();
    }
  }, [visible, from, searchParams]);

  useEffect(() => {
    if (!isEmpty(questionsList) && isArray(questionsList)) {
      questionsList?.map((item, index) => {
        if (!isUndefined(item?.answer) && item?.type != 6) {
          answers[item?.meta_name] = item?.answer;
        }
      });
    }
  }, [questionsList]);

  const formatDate = (date) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const month = months[date.getMonth()];
    const day = days[date.getDay()];
    const numericDate =
      date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    const time = moment(date).format("hh:mm A");

    return (
      <Typography variant="tableTitle">{`${month} ${numericDate} ${date.getFullYear()} ${day} ${time}`}</Typography>
    );
  };

  // get patients questions function
  async function getPatientQuestions() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${2}&patient_id=${
          data?.patientId ||
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt")) ||
          ""
        }&event_id=${data?.eventId || ""}&list=event`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          const questionsWithErrors = response?.data.map((question) => ({
            ...question,
            error: false,
          }));
          setQuestionsList(questionsWithErrors);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.log("error =======>>>", error);
    }
  }

  function getIpiAnswer(answer, questionIndex, displayAns) {
    setQuestionsList((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer,
        error: false,
        displayAns,
      };
      answers[updatedQuestions[questionIndex]?.meta_name] = answer;

      return updatedQuestions;
    });
  }

  function validation() {
    const valid = questionsList.every(
      (item) =>
        item?.meta_name.toLowerCase() === "gcs" ||
        item?.meta_name.toLowerCase() === "rf" ||
        item?.meta_name.toLowerCase() === "orient" ||
        item?.answer !== undefined
    );
    if (valid) {
      createIpiApi();
    } else {
      setQuestionsList((prevQuestions) => {
        return prevQuestions.map((item) => ({
          ...item,
          error:
            (item?.meta_name.toLowerCase() !== "gcs" ||
              item?.meta_name.toLowerCase() !== "rf" ||
              item?.meta_name.toLowerCase() !== "orient") &&
            item?.answer === undefined,
        }));
      });
    }
  }

  async function createIpiApi() {
    setBtnLoad(true);
    answers["patient_id"] =
      data?.patientId ||
      Number(EncDctFn(searchParams.get("patient_id"), "decrypt"));
    answers["event_id"] =
      data?.eventId ||
      Number(EncDctFn(searchParams.get("event_id"), "decrypt"));
    answers["created_from"] = "web";

    try {
      const response = await getApiData(
        Setting.endpoints.createIpi,
        "POST",
        answers
      );
      if (response?.status) {
        toast.success(response?.message);
        if (!isEmpty(response?.data)) {
          let data = { ...response?.data, responses: questionsList };
          handleModal("success", data);
        }
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (er) {
      setBtnLoad(false);
      console.log("ERROR=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  // render questions list
  function renderIPI() {
    let sum = 0;
    let red_flag = 0;
    return (
      <Grid
        container
        className={className.scrollbar}
        justifyContent={"space-between"}
        style={{ height: visible ? "65vh" : "100%" }}
      >
        {questionsList.map((item, index) => {
          if (
            item.meta_name == "er" ||
            item.meta_name == "vr" ||
            item.meta_name == "mr"
          ) {
            if (item.answer) {
              sum = sum + parseInt(item.answer);
            }
          }
          if (
            item.meta_name == "flag_det_loc" ||
            item.meta_name == "flag_dv" ||
            item.meta_name == "flag_agitate" ||
            item.meta_name == "flag_rep_vomit" ||
            item.meta_name == "flag_scan_results" ||
            item.meta_name == "flag_seizures" ||
            item.meta_name == "flag_ting" ||
            item.meta_name == "flag_worse_ha"
          ) {
            if (item.answer && item.answer == true) {
              red_flag = red_flag + 1;
            }
          }
        })}
        {questionsList.map((item, index) => {
          const optionArr =
            item?.meta_name.toLowerCase() === "er"
              ? eyeResponse
              : item?.meta_name.toLowerCase() === "vr"
              ? verbalResponse
              : item?.meta_name.toLowerCase() === "mr"
              ? motorResponse
              : item?.sub_event_type === "2"
              ? yesNo
              : item?.sub_event_type === "3"
              ? correctIncorrect
              : ["No Option Available"];
          return (
            <React.Fragment key={index}>
              <Grid
                item
                xs={item?.type === "5" ? 5.4 : 12}
                marginBottom={
                  item?.error ? (item?.type === "6" ? "25px" : 0) : "25px"
                }
              >
                <Grid
                  container
                  justifyContent={"space-between"}
                  marginTop={item?.type === "6" && 2}
                  marginBottom={item?.type !== "6" && 1}
                >
                  {item?.type === "6" ? (
                    <Grid
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                        borderBottom: `1px solid ${color.primary}`,
                      }}
                    >
                      <Typography variant={"title"} fontSize={20}>
                        {item?.question}{" "}
                        {item?.meta_name === "gcs" && sum > 0
                          ? ": " + sum
                          : item?.meta_name === "rf" && red_flag > 0
                          ? ": " + red_flag
                          : null}
                      </Typography>
                      {item?.meta_name.toLowerCase() === "orient" &&
                        from !== "IPIInfo" &&
                        formatDate(new Date())}
                    </Grid>
                  ) : (
                    <CTypography
                      required
                      title={item?.question}
                      variant="subTitle"
                    />
                  )}
                </Grid>
                <Grid
                  container
                  rowGap={2}
                  wrap={item?.sub_event_type === "3" ? "nowrap" : "wrap"}
                >
                  {item?.type === "1" ? (
                    optionArr.map((it1, ind1) => {
                      return (
                        <Grid key={ind1}>
                          <Button
                            variant={"outlined"}
                            onClick={() => {
                              if (from === "IPIInfo") {
                                return null;
                              } else {
                                getIpiAnswer(ind1 + 1, index, it1);
                              }
                            }}
                            style={{
                              backgroundColor:
                                item?.answer == ind1 + 1 ? color.green : "",
                              color:
                                item?.answer == ind1 + 1 ? color.white : "",
                              border: "none",
                              marginRight: 20,
                            }}
                          >
                            {it1}
                          </Button>
                        </Grid>
                      );
                    })
                  ) : item?.type === "2" ? (
                    <Grid item>
                      <TextField
                        fullWidth
                        placeholder={"Enter your response here"}
                        value={""}
                        // onChange={(e) => {
                        //   setEmergencyPhone(
                        //     !Number.isNaN(Number(e.target.value))
                        //       ? e.target.value
                        //       : emergencyPhone
                        //   );
                        // }}
                      />
                    </Grid>
                  ) : item?.type === "3" ? (
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        placeholder={"Enter your response here"}
                        value={""}
                      />
                    </Grid>
                  ) : item?.type === "4" ? (
                    <Grid item>Scale</Grid>
                  ) : item?.type === "5" ? (
                    optionArr.map((it1, ind1) => {
                      return (
                        <React.Fragment key={ind1}>
                          <Grid item marginRight={2}>
                            <Button
                              fullWidth
                              onClick={() => {
                                if (from === "IPIInfo") {
                                  return null;
                                } else {
                                  getIpiAnswer(
                                    ind1 === 0 ? true : false,
                                    index,
                                    it1
                                  );
                                }
                              }}
                              variant={"outlined"}
                              style={{
                                backgroundColor:
                                  item?.answer === (ind1 === 0 ? true : false)
                                    ? color.green
                                    : "",
                                color:
                                  item?.answer === (ind1 === 0 ? true : false)
                                    ? color.white
                                    : "",
                                border: "none",
                                marginRight: 40,
                              }}
                            >
                              {it1}
                            </Button>
                          </Grid>
                        </React.Fragment>
                      );
                    })
                  ) : (
                    ""
                  )}
                </Grid>
                {item?.type !== "6" && item?.error ? (
                  <FormHelperText
                    style={{
                      color: color.error,
                      marginBottom: 15,
                    }}
                  >
                    This question is mandatory
                  </FormHelperText>
                ) : (
                  ""
                )}
              </Grid>
              {!isNull(item?.related_questions) &&
                !isUndefined(item?.related_questions) &&
                !isEmpty(item?.related_questions) &&
                item?.related_questions.map((it, ind) => {
                  if (it === null) {
                    return null;
                  } else {
                    return (
                      <Grid key={ind} marginBottom={1} marginLeft={4}>
                        <Typography variant="subTitle">
                          {it?.question}
                        </Typography>
                      </Grid>
                    );
                  }
                })}
            </React.Fragment>
          );
        })}

        {from === "IPIInfo" && !visible && (
          <>
            <Grid
              style={{
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                borderBottom: `1px solid ${color.primary}`,
              }}
            >
              <Typography variant={"title"} fontSize={20}>
                Provider Notes
              </Typography>
            </Grid>
            <Grid marginTop={3} marginBottom={5}>
              <Typography variant="subTitle">{note || "-"}</Typography>
            </Grid>
          </>
        )}
      </Grid>
    );
  }
  return (
    <>
      {from === "IPIInfo" ? (
        loader ? (
          <Grid
            item
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MainLoader />
          </Grid>
        ) : !isEmpty(questionsList) ? (
          renderIPI()
        ) : (
          <Grid
            item
            style={{
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NoData />
          </Grid>
        )
      ) : null}
      <CModal
        visible={visible}
        handleModal={() => {
          dispatch(setEventID(""));
          handleModal("close");
        }}
        title={"Immediate Post Injury"}
        children={
          <>
            {loader ? (
              <div
                style={{
                  height: "50vh",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MainLoader />
              </div>
            ) : !isEmpty(questionsList) ? (
              renderIPI()
            ) : (
              <NoData />
            )}
            <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
              <Button
                variant="outlined"
                style={{ width: "10rem", marginRight: 20 }}
                onClick={() => handleModal("back")}
              >
                {cancelBtn ? cancelBtn : "Back"}
              </Button>
              <Button
                variant="contained"
                style={{ width: from ? "10rem" : "22rem" }}
                onClick={() => validation(questionsList)}
                disabled={btnLoad}
              >
                {btnLoad ? (
                  <CircularProgress size={22} />
                ) : from ? (
                  "Submit"
                ) : (
                  "Continue to potential concussive event information"
                )}
              </Button>
            </Grid>
          </>
        }
      />
    </>
  );
}
