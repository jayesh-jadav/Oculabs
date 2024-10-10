import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  CircularProgress,
  TextField,
  FormHelperText,
} from "@mui/material";
import styles from "./styles";
import { color } from "../../../Config/theme";
import { isArray, isEmpty, isNull, isUndefined } from "lodash";
import CSlider from "../../CSlider";
import { toast } from "react-toastify";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import CModal from "../CModal";
import NoData from "../../NoData";

export default function Symptom(props) {
  const { visible = false, handleModal = () => null, data = {} } = props;
  const className = styles();

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [answers, setAnswers] = useState({});
  const [scoreChanges, setScoreChanges] = useState([]);

  useEffect(() => {
    if (visible) {
      getPatientQuestions();
    }
  }, [visible]);

  // get patients questions function
  async function getPatientQuestions() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${5}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          const questionsWithErrors = response?.data.map((question) => {
            if (question.type === "4") {
              return { ...question, error: false, ans: 0 };
            } else {
              return { ...question, error: false };
            }
          });
          setQuestionsList(questionsWithErrors);
          intialValue(questionsWithErrors);
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

  function intialValue(item) {
    const change = [];
    if (!isEmpty(item) && isArray(item)) {
      item?.map((value, index) => {
        if (value?.type === "4") {
          change.push({
            symptom: value.meta_name,
            initial_score: 0,
            score_chng: 0,
            final_score: 0,
          });
        }
      });
    }
    setScoreChanges(change);
  }

  function getAnswer(ans, questionIndex) {
    setQuestionsList((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions[questionIndex];
      const prevAns = question.ans || ans;

      // Store the initial score if not already stored
      if (!("initial_score" in question)) {
        question.initial_score = prevAns;
      }

      // Update the answer and final score
      question.ans = ans;
      question.final_score = ans || 0;

      // Store the change count
      if (!("changeCount" in question)) {
        question.changeCount = 1;
      } else {
        if (ans !== prevAns) {
          question.changeCount += 1;
        }
      }

      // Store the final score if it has changed from the initial score
      const change = {
        symptom: question.meta_name,
        initial_score: question.initial_score,
        score_chng: question.changeCount,
        final_score: question.final_score,
      };

      // Update the scoreChanges state
      setScoreChanges((prevScoreChanges) => [
        ...prevScoreChanges.filter(
          (change) => change.symptom !== question.meta_name
        ),
        change,
      ]);

      return updatedQuestions;
    });
  }

  function validation() {
    const valid = questionsList.every(
      (item) => item?.type === "6" || item?.ans !== undefined
    );
    if (valid) {
      createSymptomInventory();
    } else {
      setQuestionsList((prevQuestions) => {
        return prevQuestions.map((item) => ({
          ...item,
          error: item?.ans === undefined,
        }));
      });
    }
  }

  async function createSymptomInventory() {
    setBtnLoad(true);
    answers["patient_id"] = data?.details?.patient_id || "";
    answers["event_id"] = data?.details?.event_id || "";
    answers["assessment_id"] = data?.details?.id || "";
    answers["created_from"] = "web";
    answers["answers"] = JSON.stringify(scoreChanges);

    try {
      const response = await getApiData(
        Setting.endpoints.createSymptomInventory,
        "POST",
        answers
      );
      if (response?.status) {
        toast.success(response?.message);
        handleModal("success");
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

  return (
    <>
      <CModal
        visible={visible}
        handleModal={() => {
          handleModal("close");
        }}
        title={"Symptom Presence Check"}
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
                <CircularProgress size={30} />
              </div>
            ) : !isEmpty(questionsList) ? (
              <Grid
                container
                className={className.scrollbar}
                justifyContent={"space-between"}
              >
                {/* <Button variant="contained" onClick={() => setAll(!all)}>
                  Set All answers
                </Button> */}
                {questionsList.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Grid
                        item
                        xs={item?.type !== "6" ? 5.3 : 12}
                        marginBottom={
                          item?.error
                            ? item?.type === "6"
                              ? "25px"
                              : 0
                            : "25px"
                        }
                      >
                        <Grid
                          marginTop={item?.type === "6" && 2}
                          marginBottom={item?.type !== "6" && 2}
                        >
                          <Typography
                            variant={
                              item?.type === "6" ? "tableTitle" : "subTitle"
                            }
                          >
                            {item?.question}
                          </Typography>
                        </Grid>
                        <Grid container rowGap={2}>
                          {item?.type === "7" ? (
                            <Grid item xs={12}>
                              <TextField
                                fullWidth
                                placeholder={"Enter your response here"}
                                value={item?.ans}
                                type="number"
                                inputProps={{ maxLength: 3 }}
                                onChange={(e) => {
                                  if (e.target.value <= 100) {
                                    let ans = !Number.isNaN(
                                      Number(e.target.value)
                                    )
                                      ? e.target.value.replace(
                                          Setting.JS_Regex.numberRegex,
                                          ""
                                        )
                                      : item?.ans;
                                    getAnswer(ans, index);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "e" ||
                                    e.key === "E" ||
                                    e.key === "-" ||
                                    e.code === "NumpadSubtract" ||
                                    e.code === "NumpadDecimal"
                                  ) {
                                    e.preventDefault();
                                  }
                                }}
                              />
                            </Grid>
                          ) : item?.type === "4" ? (
                            <CSlider
                              value={item?.ans}
                              handleChange={(e, v) => {
                                getAnswer(v, index);
                              }}
                            />
                          ) : item?.type === "5" ? (
                            ["Yes", "No"].map((it1, ind1) => {
                              return (
                                <React.Fragment key={ind1}>
                                  <Grid item xs={4} marginRight={2}>
                                    <Button
                                      fullWidth
                                      onClick={() => {
                                        getAnswer(
                                          ind1 === 0 ? true : false,
                                          index
                                        );
                                      }}
                                      variant={
                                        item?.ans ===
                                        (ind1 === 0 ? true : false)
                                          ? "contained"
                                          : "outlined"
                                      }
                                      style={{
                                        backgroundColor:
                                          item?.ans ===
                                          (ind1 === 0 ? true : false)
                                            ? color.green
                                            : "",
                                        borderColor: color.borderColor,
                                        marginRight: 20,
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
                        {item?.type !== "6" &&
                        item?.type !== "4" &&
                        item?.error ? (
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
              </Grid>
            ) : (
              <NoData />
            )}
            <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
              <Button
                variant="outlined"
                style={{ width: "10rem", marginRight: 20 }}
                onClick={() => handleModal("close")}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                style={{ width: "10rem" }}
                onClick={() => validation(questionsList)}
                disabled={btnLoad}
              >
                {btnLoad ? <CircularProgress size={20} /> : "Next"}
              </Button>
            </Grid>
          </>
        }
      />
    </>
  );
}
