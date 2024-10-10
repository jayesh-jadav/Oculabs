import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { color } from "../../../Config/theme";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import {
  isArray,
  isBoolean,
  isEmpty,
  isNull,
  isNumber,
  isUndefined,
} from "lodash";
import { toast } from "react-toastify";
import styles from "./style";
import NoData from "../../NoData";
import { CTypography } from "../../CTypography";
import MainLoader from "../../Loader/MainLoader";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import { useDispatch } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";

const errorObj = {
  other1Err: false,
  other1Msg: "",
  descriptionErr: false,
  descriptionMsg: "",
  commentErr: false,
  commentMsg: "",
  other2Err: false,
  other2Msg: "",
};

export default function InitialVisit(props) {
  const {
    visible = false,
    data = {},
    from = "",
    handleModal = () => null,
    btnTitle,
    cancelBtn,
  } = props;
  const className = styles();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setEventID } = authActions;
  const dispatch = useDispatch();

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [answers, setAnswers] = useState({});
  const [other, setOther] = useState("");
  const [err, setErr] = useState("");
  const [err1, setErr1] = useState("");
  const [errObj, setErrObj] = useState(errorObj);

  useEffect(() => {
    if (visible || from === "IVInfo") {
      getPatientQuestions();
    }
    setOther("");
  }, [visible, from]);

  useEffect(() => {
    if (!isEmpty(questionsList) && isArray(questionsList)) {
      questionsList?.map((item, index) => {
        if (
          !isUndefined(item?.answer) &&
          !isNull(item?.answer) &&
          item?.type != 6
        ) {
          if (item?.meta_name.toLowerCase() === "moi_other") {
            setOther(item?.answer);
          }
          answers[item?.meta_name] = item?.answer;
        } else if (
          item?.meta_name.toLowerCase() === "sx_other" ||
          item?.meta_name.toLowerCase() === "moi_other"
        ) {
          answers[item?.meta_name] = false;
        }
      });
    }
  }, []);

  // get patients questions function
  async function getPatientQuestions() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${3}&patient_id=${
          data?.patientId ||
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt")) ||
          ""
        }&event_id=${data?.eventId || ""}&list=event`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          response?.data?.map((item, index) => {
            if (
              !isUndefined(item?.answer) &&
              !isNull(item?.answer) &&
              item?.type != 6
            ) {
              if (item?.meta_name.toLowerCase() === "moi_other") {
                setOther(item?.answer);
              }
              answers[item?.meta_name] = item?.answer;
            } else if (
              item?.meta_name.toLowerCase() === "sx_other" ||
              item?.meta_name.toLowerCase() === "moi_other"
            ) {
              answers[item?.meta_name] = false;
            }
          });
          setQuestionsList(response?.data);
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

  function getIVAnswer(
    answer,
    questionIndex,
    relatedQuestions,
    relatedInd,
    relatedAns
  ) {
    setQuestionsList((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      if (
        updatedQuestions[questionIndex]?.meta_name.toLowerCase() ===
          "moi_other" &&
        !answer
      ) {
        setOther("");
      }

      if (
        updatedQuestions[questionIndex]?.meta_name.toLowerCase() === "loc" &&
        !answer
      ) {
        answers["loc_comment"] = "";
      }

      updatedQuestions.forEach((que) => {
        if (que?.type === "8" && isUndefined(que?.answer)) {
          answers[que?.meta_name] = false;
        }
      });
      answers[updatedQuestions[questionIndex]?.meta_name] = answer;

      if (relatedQuestions && relatedQuestions.length > 0) {
        if (!isUndefined(relatedInd) && !isUndefined(relatedAns)) {
          const key =
            relatedQuestions[relatedInd]?.metric_name ||
            relatedQuestions[relatedInd]?.meta_name;
          if (key == "sx_other_text" && answer) {
            answers["sx_other"] = relatedAns;
            relatedQuestions[relatedInd].answer = relatedAns;
          } else {
            answers[key] = relatedAns;
          }
        }

        relatedQuestions.forEach((relatedQuestion) => {
          const relatedQuestionIndex = updatedQuestions.findIndex(
            (q) => q.meta_name === relatedQuestion?.parent_meta_name
          );
          if (relatedQuestionIndex !== -1) {
            if (!isNull(relatedQuestions) && !isUndefined(relatedInd)) {
              updatedQuestions[relatedQuestionIndex].related_questions[
                relatedInd
              ].answer = relatedAns;
            }
          }
        });
      }

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer,
        error: false,
      };
      return updatedQuestions;
    });
  }

  function validation() {
    let valid = true;
    let error = { errObj };

    const checkboxSelectedGroup1 = questionsList.some(
      (question) => question.sub_event_type === "4" && question.answer
    );

    // const checkboxSelectedGroup2 = questionsList.some(
    //   (question) =>
    //     question.sub_event_type === "5" &&
    //     question.type === "8" &&
    //     question.answer
    // );

    if (!checkboxSelectedGroup1) {
      setErr("Please select at least one checkbox");
      valid = false;
    } else {
      setErr(""); // Clear the error if checkbox is selected
    }

    // if (!checkboxSelectedGroup2) {
    //   setErr1("Please select at least one checkbox");
    //   valid = false;
    // } else {
    //   setErr1(""); // Clear the error if checkbox is selected
    // }

    if (answers["moi_other"] === true && isEmpty(other)) {
      valid = false;
      error.other1Err = true;
      error.other1Msg = "Please enter other mechanism of injury";
    }

    if (isEmpty(answers["moi_comment"])) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = "Please enter description";
    }

    if (answers["loc"] === true && isEmpty(answers["loc_comment"])) {
      valid = false;
      error.commentErr = true;
      error.commentMsg = "Please enter comment";
    }

    if (answers["sx_other"] !== false && isEmpty(answers["sx_other"])) {
      valid = false;
      error.other2Err = true;
      error.other2Msg = "Please enter description";
    }

    setErrObj(error);

    const updatedQuestions = questionsList.map((question) => {
      let mainQuestionError = false;

      // Check if main answer is not selected
      if (isUndefined(question?.answer) || isEmpty(question?.answer)) {
        if (
          question?.type === "6" ||
          question?.type === "8" ||
          isBoolean(question?.answer) ||
          isNumber(question?.answer)
        ) {
          mainQuestionError = false;
        } else {
          mainQuestionError = true;
          valid = false; // Set valid to false if any main question has an error
        }
      }

      return { ...question, error: mainQuestionError };
    });

    setQuestionsList(updatedQuestions);

    if (valid) {
      createIVevent();
    }
  }

  async function createIVevent() {
    setBtnLoad(true);
    answers["patient_id"] =
      data?.patientId ||
      Number(EncDctFn(searchParams.get("patient_id"), "decrypt"));
    answers["event_id"] =
      data?.eventId ||
      Number(EncDctFn(searchParams.get("event_id"), "decrypt"));
    answers["created_from"] = "web";
    answers["moi_other"] = !isEmpty(other) ? other : false;

    try {
      const response = await getApiData(
        Setting.endpoints.createPtce,
        "POST",
        answers
      );
      if (response?.status) {
        toast.success(response?.message);
        handleModal("success", response?.data);
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (er) {
      setBtnLoad(false);
      toast.error(er.toString());
      console.log("ERROR=====>>>>>", er);
    }
  }

  // render IV design
  function renderIV() {
    return (
      <Grid
        container
        className={className.scrollbar}
        style={{ height: visible ? "65vh" : "100%" }}
      >
        {["Injury Information", "After Injury"].map((a, b) => {
          return (
            <Grid container marginBottom={3} key={b}>
              <Grid
                item
                xs={12}
                marginBottom={2}
                borderBottom={`1px solid ${color.primary}`}
              >
                <Typography variant="title" fontSize={"20px"}>
                  {a}
                </Typography>
              </Grid>
              <Grid container>
                {questionsList.map((item, index) => {
                  if (b === 0 && item?.sub_event_type === "4") {
                    return (
                      <React.Fragment key={index}>
                        <Grid
                          item
                          xs={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? 6
                              : 5.4
                          }
                          sm={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? 4
                              : 5.4
                          }
                          md={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? 3
                              : 5.4
                          }
                        >
                          {item?.meta_name.toLowerCase() === "moi_comment" &&
                            answers["moi_other"] && (
                              <Grid
                                item
                                xs={6}
                                marginBottom={isEmpty(other) ? "5px" : "15px"}
                              >
                                <CTypography
                                  variant={"subTitle"}
                                  title="Other mechanism of injury"
                                  required
                                />
                                <TextField
                                  fullWidth
                                  sx={{ marginTop: "6px" }}
                                  placeholder="Please enter other mechanism of injury"
                                  value={other || ""}
                                  onChange={(e) => {
                                    setOther(e.target.value);
                                    setErrObj({
                                      ...errObj,
                                      other1Err: false,
                                      other1Msg: "",
                                    });
                                  }}
                                  error={errObj.other1Err}
                                  helperText={errObj.other1Msg}
                                />
                              </Grid>
                            )}

                          <Grid
                            marginBottom={
                              item?.type === "6"
                                ? 0
                                : item?.type === "8"
                                ? -2
                                : 1
                            }
                          >
                            {item?.type === "8" ? (
                              <FormControl>
                                <FormControlLabel
                                  label={
                                    <Typography>{item?.question}</Typography>
                                  }
                                  value={"end"}
                                  labelPlacement="end"
                                  control={
                                    <Checkbox
                                      checked={item?.answer}
                                      onChange={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(
                                            item?.answer === undefined ||
                                              !item?.answer
                                              ? true
                                              : false,
                                            index
                                          );
                                        }
                                      }}
                                    />
                                  }
                                />
                              </FormControl>
                            ) : (
                              <CTypography
                                variant="subTitle"
                                title={item?.question}
                                required
                              />
                            )}
                          </Grid>

                          <Grid container marginBottom={3}>
                            {item?.type === "1" ? (
                              ["Opt 1", "Opt 2"].map((it1, ind1) => {
                                return (
                                  <Grid key={ind1}>
                                    <Button
                                      variant={
                                        item?.answer === ind1 + 1
                                          ? "contained"
                                          : "outlined"
                                      }
                                      onClick={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(item, it1);
                                        }
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.answer === ind1 + 1
                                            ? color.green
                                            : "",
                                        borderColor: color.borderColor,
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
                                  multiline
                                  rows={4}
                                  maxRows={4}
                                  placeholder={"Enter your response here"}
                                  value={item?.answer}
                                  onChange={(e) => {
                                    if (from === "IVInfo") {
                                      return null;
                                    } else {
                                      getIVAnswer(e.target.value, index);
                                      setErrObj({
                                        ...errObj,
                                        descriptionErr: false,
                                        descriptionMsg: "",
                                      });
                                    }
                                  }}
                                  error={errObj.descriptionErr}
                                  helperText={errObj.descriptionMsg}
                                />
                              </Grid>
                            ) : item?.type === "4" ? (
                              <Grid item>Scale</Grid>
                            ) : item?.type === "5" ? (
                              ["Yes", "No"].map((it2, ind2) => {
                                return (
                                  <Grid key={ind2} marginRight={1.5}>
                                    <Button
                                      fullWidth
                                      variant={
                                        item?.answer ===
                                        (ind2 === 0 ? true : false)
                                          ? "contained"
                                          : "outlined"
                                      }
                                      onClick={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(
                                            ind2 === 0 ? true : false,
                                            index
                                          );
                                        }
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.answer ===
                                          (ind2 === 0 ? true : false)
                                            ? color.green
                                            : "",
                                        borderColor: color.borderColor,
                                        marginRight: 30,
                                      }}
                                    >
                                      {it2}
                                    </Button>
                                  </Grid>
                                );
                              })
                            ) : (
                              ""
                            )}
                          </Grid>

                          {!isNull(item?.related_questions) &&
                            !isUndefined(item?.related_questions) &&
                            !isEmpty(item?.related_questions) &&
                            item?.related_questions.map((it, ind) => {
                              if (it !== null && item?.answer) {
                                return (
                                  <React.Fragment key={ind}>
                                    <Grid mt={2} marginBottom={1}>
                                      <Typography variant="subTitle">
                                        {it?.question}
                                      </Typography>
                                    </Grid>
                                    <Grid marginBottom={2}>
                                      <TextField
                                        fullWidth
                                        placeholder={"Enter your response here"}
                                        value={it?.answer}
                                        onChange={(e) => {
                                          if (from === "IVInfo") {
                                            return null;
                                          } else {
                                            getIVAnswer(
                                              item?.type === "8"
                                                ? item?.answer
                                                  ? true
                                                  : false
                                                : item?.answer,
                                              index,
                                              item?.related_questions,
                                              ind,
                                              e.target.value
                                            );
                                          }
                                        }}
                                      />
                                      {isUndefined(it?.answer) ||
                                      isEmpty(it?.answer) ? (
                                        <FormHelperText
                                          style={{
                                            color: color.error,
                                          }}
                                        >
                                          This question is mandatory
                                        </FormHelperText>
                                      ) : (
                                        ""
                                      )}
                                    </Grid>
                                  </React.Fragment>
                                );
                              }
                            })}
                        </Grid>
                        {item?.meta_name.toLowerCase() === "moi_other" &&
                        !isEmpty(err) ? (
                          <FormHelperText
                            style={{
                              color: color.error,
                              marginBottom: 5,
                              marginTop: -5,
                            }}
                          >
                            {err}
                          </FormHelperText>
                        ) : (
                          ""
                        )}
                      </React.Fragment>
                    );
                  } else if (b === 1 && item?.sub_event_type === "5") {
                    return (
                      <React.Fragment key={index}>
                        <Grid
                          item
                          xs={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? item?.meta_name.toLowerCase() === "sx_other"
                                ? 12
                                : 6
                              : 6
                          }
                          sm={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? item?.meta_name.toLowerCase() === "sx_other"
                                ? 8
                                : 4
                              : 6
                          }
                          md={
                            item?.type === "6" || item?.type === "3"
                              ? 12
                              : item?.type === "8"
                              ? item?.meta_name.toLowerCase() === "sx_other"
                                ? 5.8
                                : 3
                              : 6
                          }
                          paddingRight={
                            item?.type === "5" && index % 2 === 0 && 2
                          }
                        >
                          <Grid
                            marginBottom={
                              item?.type === "6"
                                ? 0
                                : item?.type === "8"
                                ? -1
                                : 1
                            }
                          >
                            {item?.type === "8" ? (
                              <FormControl>
                                <FormControlLabel
                                  label={
                                    <Typography>{item?.question}</Typography>
                                  }
                                  value={"end"}
                                  labelPlacement="end"
                                  control={
                                    <Checkbox
                                      checked={item?.answer}
                                      onChange={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(
                                            item?.answer === undefined ||
                                              !item?.answer
                                              ? true
                                              : false,
                                            index
                                          );
                                        }
                                      }}
                                    />
                                  }
                                />
                              </FormControl>
                            ) : (
                              <CTypography
                                variant="subTitle"
                                title={item?.question}
                                required={item?.meta_name !== "sys_present"}
                              />
                            )}
                          </Grid>
                          <Grid
                            container
                            marginBottom={item?.type === "5" ? "30px" : 2}
                          >
                            {item?.type === "1" ? (
                              ["Opt 1", "Opt 2"].map((it1, ind1) => {
                                return (
                                  <Grid key={ind1}>
                                    <Button
                                      variant={
                                        item?.answer === ind1 + 1
                                          ? "contained"
                                          : "outlined"
                                      }
                                      onClick={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(item, it1);
                                        }
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.answer === ind1 + 1
                                            ? color.green
                                            : "",
                                        borderColor: color.borderColor,
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
                              ["Yes", "No"].map((it2, ind2) => {
                                return (
                                  <Grid key={ind2} marginRight={1.5}>
                                    <Button
                                      fullWidth
                                      variant={
                                        item?.answer ===
                                        (ind2 === 0 ? true : false)
                                          ? "contained"
                                          : "outlined"
                                      }
                                      onClick={() => {
                                        if (from === "IVInfo") {
                                          return null;
                                        } else {
                                          getIVAnswer(
                                            ind2 === 0 ? true : false,
                                            index
                                          );
                                        }
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.answer ===
                                          (ind2 === 0 ? true : false)
                                            ? color.green
                                            : "",
                                        borderColor: color.borderColor,
                                        marginRight: 30,
                                      }}
                                    >
                                      {it2}
                                    </Button>
                                  </Grid>
                                );
                              })
                            ) : (
                              ""
                            )}
                            {item?.type !== "6" && item?.error === true ? (
                              <Grid item xs={12}>
                                <FormHelperText
                                  style={{
                                    color: color.error,
                                  }}
                                >
                                  This question is mandatory
                                </FormHelperText>
                              </Grid>
                            ) : (
                              ""
                            )}
                          </Grid>
                          {!isNull(item?.related_questions) &&
                            !isUndefined(item?.related_questions) &&
                            !isEmpty(item?.related_questions) &&
                            item?.related_questions.map((it, ind) => {
                              if (it !== null && item?.answer) {
                                return (
                                  <React.Fragment key={ind}>
                                    <Grid marginBottom={1}>
                                      <CTypography
                                        variant="subTitle"
                                        title={it?.question}
                                        required
                                      />
                                    </Grid>
                                    <Grid marginBottom={2}>
                                      <TextField
                                        fullWidth
                                        placeholder={"Enter your response here"}
                                        value={it?.answer}
                                        onChange={(e) => {
                                          if (from === "IVInfo") {
                                            return null;
                                          } else {
                                            getIVAnswer(
                                              item?.type === "8"
                                                ? item?.answer
                                                  ? true
                                                  : false
                                                : item?.answer,
                                              index,
                                              item?.related_questions,
                                              ind,
                                              e.target.value
                                            );
                                            setErrObj(
                                              item?.meta_name.toLowerCase() ===
                                                "loc"
                                                ? {
                                                    ...errObj,
                                                    commentErr: false,
                                                    commentMsg: "",
                                                  }
                                                : {
                                                    ...errObj,
                                                    other2Err: false,
                                                    other2Msg: "",
                                                  }
                                            );
                                          }
                                        }}
                                        error={
                                          item?.meta_name.toLowerCase() ===
                                          "loc"
                                            ? errObj.commentErr
                                            : errObj.other2Err
                                        }
                                        helperText={
                                          item?.meta_name.toLowerCase() ===
                                          "loc"
                                            ? errObj.commentMsg
                                            : errObj.other2Msg
                                        }
                                      />
                                    </Grid>
                                  </React.Fragment>
                                );
                              }
                            })}
                        </Grid>
                        {item?.meta_name.toLowerCase() === "sx_other" &&
                        !isEmpty(err1) ? (
                          <FormHelperText
                            style={{
                              color: color.error,
                              marginBottom: 5,
                              marginTop: -5,
                            }}
                          >
                            {err1}
                          </FormHelperText>
                        ) : (
                          ""
                        )}
                      </React.Fragment>
                    );
                  }
                })}
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    );
  }
  return (
    <>
      {from === "IVInfo" ? (
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
          renderIV()
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
          setAnswers({});
          setOther("");
        }}
        title={
          from === "IPI"
            ? "Potential Concussive Event Information"
            : "Initial Visit"
        }
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
              renderIV()
            ) : (
              <NoData />
            )}
            <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
              <Button
                variant="outlined"
                style={{ width: "10rem", marginRight: 20 }}
                onClick={() => {
                  setErr("");
                  setErr1("");
                  handleModal("back");
                }}
              >
                {cancelBtn ? cancelBtn : "Back"}
              </Button>
              <Button
                variant="contained"
                style={{ width: "10rem" }}
                onClick={() => validation()}
                disabled={btnLoad}
              >
                {btnLoad ? (
                  <CircularProgress size={22} />
                ) : btnTitle ? (
                  btnTitle
                ) : (
                  "Next"
                )}
              </Button>
            </Grid>
          </>
        }
      />
    </>
  );
}
