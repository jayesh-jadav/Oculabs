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
  Radio,
  RadioGroup,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { color } from "../../../Config/theme";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isArray, isEmpty, isNull, isUndefined } from "lodash";
import { toast } from "react-toastify";
import styles from "./style";
import { CTypography } from "../../CTypography";
import CSlider from "../../CSlider";
import NoData from "../../NoData";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../../Redux/reducers/auth/actions";
import ActiveDot from "../../ActiveDot";
import MainLoader from "../../Loader/MainLoader/index";
import Symptom from "../../CustomIcon/Assessment/Symptom";

const errorObj = {
  treatmentErr: false,
  treatmentMsg: "",
  descriptionErr: false,
  descriptionMsg: "",
};

export default function TreatmentInfo(props) {
  const { data = {}, visible = "", handleModal = () => null } = props;
  const className = styles();
  const initialChecks = [[], [], []];

  const dispatch = useDispatch();
  const { checkList } = useSelector((state) => state.auth);
  const list = checkList?.[data?.details?.id];

  const { setCheckList, clearCheckList } = authActions;
  const sm = useMediaQuery("(max-width:768px)");

  const [changeTab, setChangeTab] = useState(0);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [other, setOther] = useState("");
  const [errObj, setErrObj] = useState(errorObj);

  ///treatment info Que-answers
  const [treatmentQue, setTreatmentQue] = useState([]);
  const [treatmentAns, setTreatmentAns] = useState({});
  const [err, setErr] = useState("");

  ///symptoms Que-answers
  const [symptomQue, setSymptomQue] = useState([]);
  const [scoreChanges, setScoreChanges] = useState([]);

  ///immediate recall Que-answers
  const [immediateQue, setImmediateQue] = useState([]);
  const [checkedStates, setCheckedStates] = useState(initialChecks);
  const [irAnswers, setIrAnswers] = useState([
    { trial: "trial_1", score: 0 },
    { trial: "trial_2", score: 0 },
    { trial: "trial_3", score: 0 },
  ]);

  ///digit recall Que-answers
  const [digitQue, setDigitQue] = useState([]);
  const [drAnswers, setDrAnswers] = useState([]);
  const [staticArr, setStaticArr] = useState([]);
  const [open, setOpen] = useState(true);
  const [incorrect, setIncorrect] = useState(0);
  const [error, setError] = useState(false);

  // addComment modal state
  const [comment, setComment] = useState("");
  const [commentOpen, setCommentOpen] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = ""; // This is necessary for some browsers

      return ""; // For other browsers
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (data?.details?.treatment_info === 0) {
      setChangeTab(0);
      // getPatientQuestions(4);
    } else if (data?.details?.symptom_inventory === 0) {
      setChangeTab(1);
      // getPatientQuestions(5);
    } else if (data?.details?.immediate_recall === 0) {
      setChangeTab(2);
      // getPatientQuestions(6, "a");
    } else if (data?.details?.digit_recall === 0) {
      setChangeTab(3);
      // getPatientQuestions(7);
    }
    setOther("");
  }, [data]);

  useEffect(() => {
    setIncorrect(0);
    setOpen(true);
    getPatientQuestions(
      changeTab === 0
        ? 4
        : changeTab === 1
        ? 5
        : changeTab === 2
        ? 6
        : changeTab === 3
        ? 7
        : "",
      changeTab === 2 ? "a" : ""
    );
    if (!isEmpty(list)) {
      // Initialize checkedStates and irAnswers based on pre-existing data
      const initialCheckedStates = [...list];
      const initialIrAnswers = list?.map((trialData, trialIndex) => ({
        trial: `trial_${trialIndex + 1}`,
        score: trialData.filter(Boolean).length,
      }));
      setCheckedStates(initialCheckedStates);
      setIrAnswers(initialIrAnswers);
    }
  }, [changeTab, visible]);

  // get patients questions function
  async function getPatientQuestions(type, list) {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${type}&list=${
          list || ""
        }&patient_id=${data?.details?.patient_id || ""}&event_id=${
          data?.details?.event_id || ""
        }&assessment_id=${data?.details?.id || ""}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          if (type === 4) {
            setTreatmentQue(response?.data);
            response?.data.forEach((que) => {
              if (que?.type === "8") {
                treatmentAns[que?.meta_name] = que?.answer;
                if (que?.meta_name.toLowerCase() === "add_other_ther") {
                  treatmentAns["add_other_ther"] = isEmpty(que?.answer)
                    ? false
                    : true;
                  setOther(!isEmpty(que?.answer) ? que?.answer : "");
                }
                if (
                  que?.meta_name.toLowerCase() === "add_none_ther" &&
                  !que?.answer
                ) {
                  treatmentAns["add_ther_comm"] =
                    que?.related_questions[0].answer || null;
                }
              }
            });
            setLoader(false);
          } else if (type === 5) {
            const questionsWithErrors = response?.data.map((question) => {
              if (question.type === "4") {
                return {
                  ...question,
                  error: false,
                  answer: question?.answer || 0,
                };
              } else {
                return { ...question, error: false };
              }
            });
            setSymptomQue(questionsWithErrors);
            initialValue(questionsWithErrors);
            setLoader(false);
          } else if (type === 6) {
            setImmediateQue(response?.data);
            setLoader(false);
          } else if (type === 7) {
            setDigitQue(response?.data);
            let arr = [];
            response?.data[1]?.options.map((item) => {
              let obj = {};
              obj["digit"] = item;
              obj["score"] = null;
              return arr.push(obj);
            });
            setDrAnswers(arr);
            setStaticArr([response?.data[1]?.options[0]]);
            setLoader(false);
          }
        }
      } else {
        toast.error(response?.message);
        setLoader(false);
      }
    } catch (error) {
      setLoader(false);
      console.log("error =======>>>", error);
    }
  }

  /////////////////////////////////////////// Treatment Info //////////////////////////////////////////////

  function getAnswerTreatmentInfo(
    mainAnswer,
    questionIndex,
    relatedQuestions,
    relatedInd,
    relatedAns
  ) {
    setTreatmentQue((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];

      // for type === "8"
      if (
        mainAnswer &&
        updatedQuestions[questionIndex]?.meta_name.toLowerCase() ===
          "add_none_ther"
      ) {
        // Uncheck "add_none_ther" checkbox when others are checked
        updatedQuestions.forEach((que) => {
          if (que?.type === "8") {
            treatmentAns[que?.meta_name] = false; // Uncheck other checkboxes
          }
        });
        treatmentAns["add_none_ther"] = mainAnswer || false;
        treatmentAns["add_ther_comm"] = null;
      } else {
        if (mainAnswer) {
          // Uncheck "add_none_ther" when other checkboxes are checked
          updatedQuestions.forEach((que) => {
            if (que?.type === "8" && (questionIndex === 6 || !que?.answer)) {
              treatmentAns[que?.meta_name] = false; // Uncheck other checkboxes
            } else {
              treatmentAns["add_none_ther"] = false;
            }
          });
          treatmentAns[updatedQuestions[questionIndex]?.meta_name] = mainAnswer;
        } else {
          treatmentAns[updatedQuestions[questionIndex]?.meta_name] = mainAnswer;
          if (
            updatedQuestions[questionIndex]?.meta_name.toLowerCase() ===
            "add_other_ther"
          ) {
            setOther("");
          }
          if (!mainAnswer && !isUndefined(relatedQuestions)) {
            let key =
              relatedQuestions[relatedInd]?.metric_name ||
              relatedQuestions[relatedInd]?.meta_name;
            treatmentAns[key] = relatedAns;
          }
        }
      }

      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        answer: mainAnswer,
        error: false,
      };
      return updatedQuestions;
    });
  }

  function treatmentInfoValidation() {
    const error = { ...errObj };
    let valid = treatmentQue?.some((question) => {
      if (
        question?.type === "8" &&
        (question?.answer || !isEmpty(question?.answer))
      ) {
        return true;
      }
      return false;
    });

    if (!valid) {
      setErr("Please select at least one treatment");
    }

    if (treatmentAns["add_other_ther"] && isEmpty(other)) {
      valid = false;
      error.treatmentErr = true;
      error.treatmentMsg = "Please enter other mechanism of injury";
    }

    if (
      treatmentAns["add_none_ther"] !== true &&
      !treatmentAns["add_ther_comm"]
    ) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = "Please enter description";
    }

    setErrObj(error);

    if (valid) {
      createTreatmentInfo();
    }
  }

  async function createTreatmentInfo() {
    setBtnLoad(true);
    treatmentAns["patient_id"] = data?.details?.patient_id || "";
    treatmentAns["event_id"] = data?.details?.event_id || "";
    treatmentAns["assessment_id"] = data?.details?.id || "";
    treatmentAns["created_from"] = "web";
    treatmentAns["add_other_ther"] = !isEmpty(other) ? other : false;

    try {
      const response = await getApiData(
        Setting.endpoints.createTreatmentInfo,
        "POST",
        treatmentAns
      );
      if (response?.status) {
        toast.success(response?.message);
        setChangeTab(1);
        getPatientQuestions(5);
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

  function treatmentInfo() {
    return (
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
        ) : !isEmpty(treatmentQue) ? (
          <Grid container justifyContent={"space-between"}>
            {treatmentQue?.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <Grid
                    item
                    xs={item?.type === "5" || item?.type === "8" ? 5.4 : 12}
                    md={item?.type === "8" ? 4 : 12}
                  >
                    <Grid
                      item
                      marginTop={item?.type === "6" && 2}
                      marginBottom={2}
                    >
                      {item?.type === "8" ? (
                        <FormControl>
                          <FormControlLabel
                            label={
                              <Typography variant="subTitle">
                                {item?.question}
                              </Typography>
                            }
                            value={"end"}
                            labelPlacement="end"
                            control={
                              <Checkbox
                                checked={treatmentAns[item?.meta_name] || false}
                                onChange={() => {
                                  getAnswerTreatmentInfo(
                                    isUndefined(item?.answer) ||
                                      !treatmentAns[item?.meta_name] ||
                                      treatmentAns[item?.meta_name] === "false"
                                      ? true
                                      : false,
                                    index
                                  );
                                  setErr("");
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
                    <Grid container rowGap={2}>
                      {item?.type === "3" ? (
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            placeholder={"Enter your response here"}
                            value={item?.answer}
                            onChange={(e) =>
                              getAnswerTreatmentInfo(e.target.value, index)
                            }
                          />
                        </Grid>
                      ) : item?.type === "5" ? (
                        ["Yes", "No"].map((it1, ind1) => {
                          return (
                            <React.Fragment key={ind1}>
                              <Grid item xs={4} marginRight={2}>
                                <Button
                                  fullWidth
                                  onClick={() => {
                                    getAnswerTreatmentInfo(
                                      ind1 === 0 ? true : false,
                                      index
                                    );
                                  }}
                                  variant={
                                    item?.answer === (ind1 === 0 ? true : false)
                                      ? "contained"
                                      : "outlined"
                                  }
                                  style={{
                                    backgroundColor:
                                      item?.answer ===
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
                    {item?.type !== "6" && item?.error ? (
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

                  {item?.meta_name.toLowerCase() === "add_none_ther" &&
                  !isEmpty(err) ? (
                    <FormHelperText
                      style={{
                        color: color.error,
                        marginTop: -10,
                      }}
                    >
                      {err}
                    </FormHelperText>
                  ) : (
                    ""
                  )}

                  {item?.meta_name.toLowerCase() === "add_none_ther" &&
                    treatmentAns["add_other_ther"] && (
                      <Grid item xs={12}>
                        <CTypography
                          variant={"subTitle"}
                          title="Other treatment"
                          required
                        />
                        <TextField
                          style={{ marginTop: 8 }}
                          fullWidth
                          placeholder="Please enter other mechanism of injury"
                          value={other}
                          onChange={(e) => {
                            setOther(e.target.value);
                            setErrObj({
                              ...errObj,
                              treatmentErr: false,
                              treatmentMsg: "",
                            });
                          }}
                          error={errObj.treatmentErr}
                          helperText={errObj.treatmentMsg}
                        />
                      </Grid>
                    )}
                  {!isNull(item?.related_questions) &&
                    !isUndefined(item?.related_questions) &&
                    !isEmpty(item?.related_questions) &&
                    item?.related_questions?.map((it, ind) => {
                      if (!treatmentAns[item?.meta_name]) {
                        return (
                          <React.Fragment key={ind}>
                            <Grid item xs={12} mt={1}>
                              <CTypography
                                required
                                title={it?.question}
                                variant="subTitle"
                              />
                              <TextField
                                style={{ marginTop: 10 }}
                                fullWidth
                                multiline
                                rows={4}
                                maxRows={4}
                                placeholder={"Please enter description"}
                                value={treatmentAns[it?.meta_name]}
                                onChange={(e) => {
                                  getAnswerTreatmentInfo(
                                    item?.type === "8"
                                      ? treatmentAns[item?.meta_name] || false
                                      : item?.answer,
                                    index,
                                    item?.related_questions,
                                    ind,
                                    e.target.value
                                  );
                                  setErrObj({
                                    ...errObj,
                                    descriptionErr: false,
                                    descriptionMsg: "",
                                  });
                                }}
                                error={errObj.descriptionErr}
                                helperText={errObj.descriptionMsg}
                              />
                            </Grid>
                          </React.Fragment>
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
      </>
    );
  }

  /////////////////////////////////////////// symptom inventory //////////////////////////////////////////////

  function initialValue(item) {
    const change = [];
    if (!isEmpty(item) && isArray(item)) {
      item?.map((value, index) => {
        if (value?.type === "4") {
          change.push({
            symptom: value.meta_name,
            initial_score: 0,
            score_chng: 0,
            final_score: value?.answer || 0,
          });
        } else if (value?.type === "5" || value?.type === "7") {
          change.push({
            symptom: value.meta_name,
            initial_score: value?.answer,
            score_chng: 0,
            final_score: value?.answer,
          });
        }
      });
    }
    setScoreChanges(change);
  }

  function getAnswerSymptoms(ans, questionIndex) {
    setSymptomQue((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const question = updatedQuestions[questionIndex];
      const prevAns = question.answer || ans;

      // Store the initial score if not already stored
      if (!("initial_score" in question)) {
        question.initial_score = prevAns;
      }

      // Update the answer and final score
      question.answer = ans;
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

  function symptomsValidation() {
    const valid = symptomQue.every(
      (item) => item?.type === "6" || item?.answer !== undefined
    );
    if (valid) {
      createSymptomInventory();
    } else {
      setSymptomQue((prevQuestions) => {
        return prevQuestions.map((item) => ({
          ...item,
          error: item?.answer === undefined,
        }));
      });
    }
  }

  async function createSymptomInventory() {
    setBtnLoad(true);
    let symptomAnswers = {};
    symptomAnswers["patient_id"] = data?.details?.patient_id || "";
    symptomAnswers["event_id"] = data?.details?.event_id || "";
    symptomAnswers["assessment_id"] = data?.details?.id || "";
    symptomAnswers["created_from"] = "web";
    symptomAnswers["answers"] = JSON.stringify(scoreChanges);

    try {
      const response = await getApiData(
        Setting.endpoints.createSymptomInventory,
        "POST",
        symptomAnswers
      );
      if (response?.status) {
        toast.success(response?.message);
        if (data?.details?.immediate_recall === 0) {
          setChangeTab(2);
          getPatientQuestions(6, "a");
        } else if (data?.details?.digit_recall === 0) {
          setChangeTab(3);
          getPatientQuestions(7, "a");
        } else {
          handleModal("success", true);
          setCommentOpen(true);
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

  function symptom() {
    return (
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
        ) : !isEmpty(symptomQue) ? (
          <Grid
            container
            className={className.scrollbar}
            justifyContent={"space-between"}
          >
            {symptomQue?.map((item, index) => {
              if (item?.type === "6") {
                if (
                  isNull(data?.details?.treatment_info) &&
                  +data?.details?.event_type === 1 &&
                  item?.meta_name.toLowerCase() === "sys_inve_bln"
                ) {
                  return (
                    <Grid key={index} item xs={12} marginBottom={"25px"}>
                      <Grid>
                        <Typography variant={"tableTitle"}>
                          {item?.question}
                        </Typography>
                      </Grid>
                      {/* prev and curr note design */}
                      <Grid item xs={12} display="flex" gap={5}>
                        {["Previous Assessment", "Current Assessment"]?.map(
                          (it, ind) => {
                            return (
                              <Grid
                                key={ind}
                                item
                                style={{
                                  marginTop: 5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <ActiveDot
                                  color={
                                    ind === 0 ? color.green : color.primary
                                  }
                                />
                                <Typography>{it}</Typography>
                              </Grid>
                            );
                          }
                        )}
                      </Grid>
                    </Grid>
                  );
                } else if (
                  +data?.details?.event_type !== 1 &&
                  isNull(data?.details?.digit_recall) &&
                  isNull(data?.details?.immediate_recall) &&
                  item?.meta_name.toLowerCase() === "sys_inve_sub"
                ) {
                  return (
                    <Grid key={index} item xs={12} marginBottom={"25px"}>
                      <Grid>
                        <Typography variant={"tableTitle"}>
                          {item?.question}
                        </Typography>
                      </Grid>
                      {/* prev and curr note design */}
                      <Grid item xs={12} display="flex" gap={5}>
                        {["Previous Assessment", "Current Assessment"]?.map(
                          (it, ind) => {
                            return (
                              <Grid
                                key={ind}
                                item
                                style={{
                                  marginTop: 5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <ActiveDot
                                  color={
                                    ind === 0 ? color.green : color.primary
                                  }
                                />
                                <Typography>{it}</Typography>
                              </Grid>
                            );
                          }
                        )}
                      </Grid>
                    </Grid>
                  );
                } else if (
                  +data?.details?.event_type !== 1 &&
                  !isNull(data?.details?.treatment_info) &&
                  !isNull(data?.details?.immediate_recall) &&
                  item?.meta_name.toLowerCase() === "sys_inve_inj"
                ) {
                  return (
                    <Grid key={index} item xs={12} marginBottom={"25px"}>
                      <Grid>
                        <Typography variant={"tableTitle"}>
                          {item?.question}
                        </Typography>
                      </Grid>
                      {/* prev and curr note design */}
                      <Grid item xs={12} display="flex" gap={5}>
                        {["Previous Assessment", "Current Assessment"]?.map(
                          (it, ind) => {
                            return (
                              <Grid
                                key={ind}
                                item
                                style={{
                                  marginTop: 5,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <ActiveDot
                                  color={
                                    ind === 0 ? color.green : color.primary
                                  }
                                />
                                <Typography>{it}</Typography>
                              </Grid>
                            );
                          }
                        )}
                      </Grid>
                    </Grid>
                  );
                }
              } else {
                return (
                  <React.Fragment key={index}>
                    <Grid item xs={5.3} marginBottom={item?.error ? 0 : "25px"}>
                      <Grid
                        item
                        marginBottom={1}
                        display="flex"
                        alignItems={"center"}
                      >
                        <Symptom
                          fill={color.primary}
                          meta_key={item?.meta_name}
                        />
                        {item?.type === "5" || item?.type === "7" ? (
                          <CTypography
                            title={item?.question}
                            required
                            variant={"subTitle"}
                          />
                        ) : (
                          <Typography variant={"subTitle"} marginLeft={"10px"}>
                            {item?.question}
                          </Typography>
                        )}
                      </Grid>

                      <Grid container rowGap={2}>
                        {item?.type === "7" ? (
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              placeholder={"Enter your response here"}
                              value={item?.answer}
                              type="number"
                              inputProps={{ maxLength: 3 }}
                              onChange={(e) => {
                                if (e.target.value <= 100) {
                                  let ans = !Number.isNaN(
                                    Number(e.target.value)
                                  )
                                    ? e.target.value.replace(
                                        Setting.JS_Regex.numberRegex
                                      )
                                    : item?.answer;
                                  getAnswerSymptoms(ans, index);
                                }
                              }}
                              onKeyDown={(e) => {
                                if (
                                  e.key === "e" ||
                                  e.key === "E" ||
                                  e.key === "-" ||
                                  e.code === "NumpadSubtract"
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            />
                          </Grid>
                        ) : item?.type === "4" ? (
                          <CSlider
                            value={item?.answer}
                            prevVal={item?.prev_key}
                            handleChange={(e, v) => {
                              getAnswerSymptoms(v, index);
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
                                      getAnswerSymptoms(
                                        ind1 === 0 ? true : false,
                                        index
                                      );
                                    }}
                                    variant={
                                      item?.answer ===
                                      (ind1 === 0 ? true : false)
                                        ? "contained"
                                        : "outlined"
                                    }
                                    style={{
                                      backgroundColor:
                                        item?.answer ===
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
                      item?.related_questions?.map((it, ind) => {
                        if (it !== null) {
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
              }
            })}
          </Grid>
        ) : (
          <NoData />
        )}
      </>
    );
  }

  /////////////////////////////////////////// Immediate Recall //////////////////////////////////////////////

  function getAnswersIrcall(tick, index, trial) {
    const newCheckedStates = [...checkedStates];
    newCheckedStates[trial - 1][index] = tick;

    const tickCount = newCheckedStates[trial - 1]?.filter(Boolean).length;

    setCheckedStates(newCheckedStates);

    setIrAnswers((item) => {
      const updateAns = [...item];
      updateAns[trial - 1] = {
        trial: `trial_${trial}`,
        score: tickCount,
      };
      return updateAns;
    });
  }

  async function createImmediateRecallApi() {
    dispatch(setCheckList(checkedStates, data?.details?.id));
    setBtnLoad(true);
    const ans = {
      patient_id: data?.details?.patient_id || "",
      event_id: data?.details?.event_id || "",
      assessment_id: data?.details?.id || "",
      created_from: "web",
      word_set_id: immediateQue[1]?.word_set_id || "",
      answers: JSON.stringify(irAnswers),
    };

    try {
      const response = await getApiData(
        Setting.endpoints.createImmediateRecall,
        "POST",
        ans
      );
      if (response?.status) {
        toast.success(response?.message);
        if (data?.details?.digit_recall === 0) {
          setChangeTab(3);
          getPatientQuestions(7);
        } else {
          handleModal("success", true);
          setCommentOpen(true);
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

  function immediateRecall() {
    return (
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
        ) : !isEmpty(immediateQue) && isArray(immediateQue) ? (
          <Grid
            className={className.scrollbar}
            container
            justifyContent={"center"}
            mb={10}
          >
            <Grid item xs={12} mb={10}>
              <Typography variant="tableTitle">
                {immediateQue[0]?.question}
              </Typography>
            </Grid>
            {immediateQue[1]?.options?.map((item, index) => {
              return (
                <Grid
                  key={index}
                  item
                  xs={12}
                  display="flex"
                  justifyContent={"center"}
                >
                  <Grid
                    item
                    xs={4}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {index === 0 && (
                      <Typography
                        variant="tableTitle"
                        style={{ margin: "-60px 0 20px", paddingBottom: 10 }}
                      >
                        Words
                      </Typography>
                    )}
                    <Typography variant="title">{item}</Typography>
                  </Grid>

                  <Grid
                    item
                    xs={8}
                    display={"flex"}
                    justifyContent={"space-around"}
                    // marginTop={"2px"}
                  >
                    {[1, 2, 3].map((trial) => {
                      return (
                        <React.Fragment key={trial}>
                          <Grid
                            item
                            fullWidth
                            xs={12}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRight:
                                trial !== 3 && `1px solid ${color.disable}`,
                            }}
                          >
                            {index === 0 && (
                              <Typography
                                variant="tableTitle"
                                style={{
                                  margin: "-60px 0 20px",
                                  paddingBottom: 10,
                                }}
                              >
                                Trial {trial}
                              </Typography>
                            )}
                            <Checkbox
                              checked={checkedStates[trial - 1][index]}
                              onChange={() =>
                                getAnswersIrcall(
                                  !checkedStates[trial - 1][index],
                                  index,
                                  trial
                                )
                              }
                              // icon={<CircleOutlined />}
                              // checkedIcon={<CheckCircle />}
                              sx={{
                                "& .MuiSvgIcon-root": {
                                  fontSize: 28,
                                  color: checkedStates[trial - 1][index]
                                    ? color.green
                                    : color.disable,
                                },
                              }}
                            />
                          </Grid>
                        </React.Fragment>
                      );
                    })}
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <NoData />
        )}
      </>
    );
  }

  /////////////////////////////////////////// Digit Recall //////////////////////////////////////////////

  function getAnswer(digit, ans) {
    setIncorrect(ans === 1 ? 0 : incorrect + 1);

    const findInd = digitQue[1]?.options.indexOf(digit);

    setOpen((findInd === 6 && ans === 0) || findInd === 7 ? false : open);

    if (open) {
      if (
        findInd !== -1 &&
        (findInd === 6 && ans === 0 ? findInd !== 7 : findInd !== 6) &&
        findInd < digitQue[1]?.options.length - 1
      ) {
        if (ans === 1) {
          staticArr.push(
            digitQue[1]?.options[findInd % 2 !== 0 ? findInd + 1 : findInd + 2]
          );
        } else {
          if (incorrect < 1) {
            staticArr.push(digitQue[1]?.options[findInd + 1]);
          }
        }
      }
    }

    setDrAnswers((prevData) => {
      const updateAns = [...prevData];
      updateAns[findInd] = {
        digit: digit,
        score: ans,
      };
      return updateAns;
    });
  }

  function digitValidation() {
    let last = staticArr[staticArr.length - 1];
    let valid = drAnswers.find((item) => item?.digit === last);
    if (isNull(valid?.score)) {
      setError(true);
    } else {
      createDigitRecallApi();
    }
  }

  async function createDigitRecallApi() {
    dispatch(setCheckList(checkedStates, data?.details?.id));
    setBtnLoad(true);
    let item = {};
    item["patient_id"] = data?.details?.patient_id || "";
    item["event_id"] = data?.details?.event_id || "";
    item["assessment_id"] = data?.details?.id || "";
    item["created_from"] = "web";
    item["answers"] = JSON.stringify(drAnswers);
    try {
      const response = await getApiData(
        Setting.endpoints.createDigitRecall,
        "POST",
        item
      );
      if (response?.status) {
        toast.success(response?.message);
        handleModal("success", true);
        dispatch(clearCheckList());
        setCommentOpen(true);
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

  function digitRecall() {
    return (
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
        ) : !isEmpty(digitQue) ? (
          <Grid item xs={12} className={className.scrollbar}>
            <Grid item xs={12}>
              <Typography variant="tableTitle">
                {digitQue[0]?.question}
              </Typography>
            </Grid>
            <Grid
              container
              flexDirection={"column"}
              alignItems="center"
              style={{ marginTop: 20 }}
            >
              {!isEmpty(digitQue[1]?.options) && (
                <Grid display={"flex"} gap={"30px"} alignItems="center">
                  <Grid
                    item
                    display={"flex"}
                    justifyContent={"center"}
                    style={{ width: 150 }}
                  >
                    <Typography variant="subTitle">Number</Typography>
                  </Grid>
                  <Grid
                    item
                    display="flex"
                    justifyContent={"space-between"}
                    style={{ width: 150 }}
                  >
                    <Typography variant="subTitle">Correct</Typography>
                    <Typography variant="subTitle">Incorrect</Typography>
                  </Grid>
                </Grid>
              )}

              {staticArr?.map((item, index) => {
                const lInd = staticArr.length - 1;
                return (
                  <Grid key={index} display={"flex"} gap={"30px"}>
                    <Grid
                      item
                      display={"flex"}
                      justifyContent={"center"}
                      style={{ width: 150 }}
                      marginTop={"10px"}
                    >
                      <Typography variant="tableTitle">{item}</Typography>
                    </Grid>
                    <Grid item display="flex" style={{ width: 150 }}>
                      <FormControl fullWidth disabled={index !== lInd}>
                        <RadioGroup
                          row
                          onChange={(e, value) => {
                            getAnswer(item, value === "true" ? 1 : 0);
                            setError(false);
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <FormControlLabel
                            style={{ marginLeft: "3px" }}
                            value={true}
                            control={<Radio />}
                          />
                          <FormControlLabel
                            style={{ marginRight: "10px" }}
                            value={false}
                            control={<Radio />}
                          />
                        </RadioGroup>
                        {index === lInd && error && (
                          <FormHelperText
                            variant="subTitle"
                            style={{ color: color.error }}
                          >
                            * Response is required
                          </FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        ) : (
          <NoData />
        )}
      </>
    );
  }

  /////////////////////////////////////// Add Comment ////////////////////////////////////////////////////

  // this function is used for display addComment modal design
  function commentModal() {
    return (
      <Grid container>
        <CTypography required title={"Comment"} />
        <TextField
          placeholder="Please enter comment"
          fullWidth
          minRows={4}
          multiline
          value={comment}
          onChange={(e) => {
            setErr("");
            setComment(e.target.value);
          }}
          helperText={!isEmpty(err) ? err : ""}
          error={!isEmpty(err)}
        />
      </Grid>
    );
  }
  async function addComment() {
    setBtnLoad(true);
    const item = {};
    item["assessment_id"] = data?.details?.id;
    item["comment"] = comment;
    item["created_from"] = "web";
    try {
      const response = await getApiData(
        `${Setting.endpoints.addComment}`,
        "POST",
        item
      );
      if (response.status) {
        toast.success(response?.message);
        setCommentOpen(false);
        handleModal("success", true);
        setComment("");
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

  // addComment validation function
  function commentValidation() {
    let valid = true;
    if (isEmpty(comment)) {
      valid = false;
      setErr("Please enter comment");
    }
    if (valid) {
      addComment();
    }
  }

  return (
    <>
      <CModal
        visible={visible}
        handleModal={() => {
          handleModal("close");
          setErr("");
          setOther("");
          setIncorrect(0);
          setOpen(true);
          setStaticArr([]);
        }}
        title={
          changeTab === 0
            ? "Treatment Information"
            : changeTab === 1
            ? "Symptom Presence Check"
            : changeTab === 2
            ? "Immediate Recall"
            : changeTab === 3
            ? "Digit Recall"
            : null
        }
        children={
          <>
            {changeTab === 0
              ? treatmentInfo()
              : changeTab === 1
              ? symptom()
              : changeTab === 2
              ? immediateRecall()
              : changeTab === 3
              ? digitRecall()
              : null}
            <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
              {changeTab !== 4 ? (
                <Button
                  variant="outlined"
                  style={{ width: "10rem", marginRight: 20 }}
                  onClick={() => {
                    changeTab === 0 ||
                    (changeTab === 1 && data?.details?.treatment_info === null)
                      ? handleModal("close")
                      : setChangeTab(changeTab - 1);
                  }}
                >
                  {changeTab === 0 ||
                  (changeTab === 1 && data?.details?.treatment_info === null)
                    ? "Cancel"
                    : "Back"}
                </Button>
              ) : null}
              <Button
                variant="contained"
                style={{ width: "10rem" }}
                onClick={() =>
                  changeTab === 0
                    ? treatmentInfoValidation()
                    : changeTab === 1
                    ? symptomsValidation()
                    : changeTab === 2
                    ? createImmediateRecallApi()
                    : changeTab === 3
                    ? digitValidation()
                    : null
                }
                // onClick={() => changeTab < 3 && setChangeTab(changeTab + 1)}
                disabled={btnLoad}
              >
                {btnLoad ? (
                  <CircularProgress size={20} />
                ) : changeTab === 3 ||
                  (changeTab === 1 &&
                    (data?.details?.immediate_recall === null ||
                      data?.details?.digit_recall === null)) ? (
                  "Submit"
                ) : (
                  "Next"
                )}
              </Button>
            </Grid>
          </>
        }
      />

      {/* add comment modal */}
      <CModal
        visible={commentOpen}
        handleModal={() => {
          setCommentOpen(false);
          setErr("");
          setComment("");
        }}
        title={"Add Comment"}
        children={
          <>
            {commentModal()}
            <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
              <Button
                variant="contained"
                style={{ width: "10rem" }}
                onClick={() => commentValidation()}
                disabled={btnLoad}
              >
                {btnLoad ? <CircularProgress size={20} /> : "Submit"}
              </Button>
            </Grid>
          </>
        }
      />
    </>
  );
}
