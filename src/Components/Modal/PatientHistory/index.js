import React, { useEffect, useState } from "react";
import {
  Grid,
  Typography,
  Button,
  TextField,
  CircularProgress,
  FormHelperText,
  FormControl,
  FormControlLabel,
  Checkbox,
  IconButton,
  Select,
  MenuItem,
} from "@mui/material";
import styles from "./styles";
import { color } from "../../../Config/theme";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import {
  isArray,
  isBoolean,
  isEmpty,
  isNull,
  isNumber,
  isUndefined,
} from "lodash";
import CModal from "../CModal";
import { CTypography } from "../../CTypography";
import { useSelector } from "react-redux";
import NoData from "../../NoData";
import MainLoader from "../../Loader/MainLoader/index";
import { Add, Remove } from "@mui/icons-material";
import { medicineUnits } from "../../../Config/Static_Data";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";

export default function PatientHistory(props) {
  const {
    visible = false,
    handleModal = () => null,
    patientId = "",
    editData,
    medicalData,
    from = "",
    activeIndex,
  } = props;
  const className = styles();
  const { userType } = useSelector((state) => state.auth);

  const optionList = [
    { id: 1, label: "Yes" },
    { id: 0, label: "No" },
    { id: 2, label: "Undiagnosed" },
  ];
  const recoveryArr = [
    "7 to 10 days",
    "2 weeks to 1 month",
    "1 to 6 months",
    "greater than 6 months",
    "Still recovering",
  ];

  const [searchParams, setSearchParams] = useSearchParams();

  const [questionsList, setQuestionsList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [data, setData] = useState({});
  const [edit, setEdit] = useState(false);
  const [other, setOther] = useState("");
  const [error, setError] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  //medication states
  const [medError, setMedError] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [answers, setAnswers] = useState([
    {
      medication: "",
      dose: "",
      dose_unit: "",
      frequency: "",
    },
  ]);

  useEffect(() => {
    let isMounted = true; // track if component is mounted
    if (userType !== "super_admin" && (visible || from === "patient")) {
      async function getPatientQuestions() {
        setLoader(true);
        try {
          const response = await getApiData(
            `${Setting.endpoints.patientQuestions}?event_type=${1}&patient_id=${
              patientId ||
              Number(EncDctFn(searchParams.get("patient_id"), "decrypt"))
            }`,
            "GET",
            {}
          );
          if (!isMounted) return; // exit if component is not mounted

          if (response?.status) {
            let Questions;
            if (!isEmpty(response?.data) && isArray(response?.data)) {
              Questions = response.data.map((item) => ({
                ...item,
                mainAnswer: item?.type === "8" ? false : undefined,
              }));

              setQuestionsList(Questions);
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
      getPatientQuestions();
      setOther("");
      return () => {
        isMounted = false; // set it to false when the component unmounts
      };
    }
  }, [visible, from]);

  useEffect(() => {
    if (!isEmpty(editData) && isArray(editData)) {
      updateHistory(editData);
    }

    if (!isEmpty(medicalData) && isArray(medicalData)) {
      setRowCount(medicalData?.length);
      setAnswers(medicalData);
    } else {
      setRowCount(0);
      setAnswers([
        {
          medication: "",
          dose: "",
          dose_unit: "",
          frequency: "",
        },
      ]);
    }
    if (from === "patient") {
      setEdit(true);
    }
  }, [loader, editData]);

  function updateHistory(arr) {
    const dummyArr = [...questionsList];
    dummyArr?.map((it1, ind1) => {
      const mainQuestion = questionsList[ind1];
      arr?.map((item, index) => {
        if (item?.type != 5) {
          if (item?.meta_name.toLowerCase() == it1?.meta_name.toLowerCase()) {
            if (
              !isEmpty(it1?.related_questions) &&
              isArray(it1?.related_questions)
            ) {
              it1?.related_questions?.map((it2, ind2) => {
                arr?.map((ans) => {
                  if (ans?.meta_name.toLowerCase() === "other_ther") {
                    setOther(ans?.answer === 0 ? "" : ans?.answer);
                  }
                  if (
                    ans?.meta_name.toLowerCase() ==
                    it2?.metric_name.toLowerCase()
                  ) {
                    const related = mainQuestion.related_questions[ind2];
                    related.relatedAns = ans?.answer;
                    mainQuestion.relatedAns = related;
                    data[ans?.meta_name] = ans.answer;
                  }
                });
              });
            }
            mainQuestion.mainAnswer = item?.answer;
            data[item?.meta_name] = item?.answer;
          }
        } else {
          if (item?.meta_name.toLowerCase() == it1?.meta_name.toLowerCase()) {
            if (
              !isEmpty(it1?.related_questions) &&
              isArray(it1?.related_questions)
            ) {
              it1?.related_questions?.map((it2, ind2) => {
                arr?.map((ans) => {
                  if (
                    ans?.meta_name.toLowerCase() ==
                    it2?.metric_name.toLowerCase()
                  ) {
                    const related = mainQuestion.related_questions[ind2];
                    related.relatedAns = ans?.answer;
                    mainQuestion.relatedAns = related;
                    data[ans?.meta_name] = ans.answer;
                  }
                });
              });
            }
            if (item?.answer === 1) {
              mainQuestion.mainAnswer = true;
              data[item?.meta_name] = true;
            } else if (item?.answer === 0) {
              mainQuestion.mainAnswer = false;
              data[item?.meta_name] = false;
            }
          }
        }
      });
    });
    setQuestionsList(dummyArr);
  }

  function getAnswer(
    ans,
    questionIndex,
    relatedQuestions,
    relatedAns,
    relatedInd
  ) {
    if (isEdit || isEmpty(from)) {
      setIsChanged(true);
      setQuestionsList((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];
        const mainQuestion = updatedQuestions[questionIndex];
        data[updatedQuestions[questionIndex]?.meta_name] = ans;

        // If the question has related questions
        if (relatedQuestions && relatedQuestions.length > 0) {
          // Update the main question's answer separately
          mainQuestion.mainAnswer = ans;

          if (!isUndefined(relatedInd) && !isUndefined(relatedAns)) {
            data[relatedQuestions[relatedInd]?.metric_name] = relatedAns;
          }

          relatedQuestions.forEach((relatedQuestion) => {
            const relatedQuestionIndex = updatedQuestions.findIndex(
              (q) => q.meta_name === relatedQuestion?.parent_meta_name
            );
            if (relatedQuestionIndex !== -1) {
              if (!isNull(relatedQuestions) && !isUndefined(relatedInd)) {
                // Update the answer for the related question
                updatedQuestions[relatedQuestionIndex].related_questions[
                  relatedInd
                ].relatedAns = relatedAns;
              }
            }
          });
        } else {
          // If there are no related questions, update the main question's answer only
          mainQuestion.mainAnswer = ans;
        }

        // Log the updated questions for debugging purposes
        return updatedQuestions;
      });
    }
  }

  function getAnswerFromCheckbox(
    ans,
    questionIndex,
    relatedQuestions,
    relatedInd,
    relatedAns
  ) {
    if (isEdit || isEmpty(from)) {
      setIsChanged(true);
      setQuestionsList((prevQuestions) => {
        const updatedQuestions = [...prevQuestions];
        // for type === "8"
        if (
          ans &&
          updatedQuestions[questionIndex]?.meta_name.toLowerCase() ===
            "none_ther"
        ) {
          // Uncheck "add_none_ther" checkbox when others are checked
          updatedQuestions.forEach((que) => {
            if (que?.type === "8") {
              data[que?.meta_name] = false; // Uncheck other checkboxes
            }
          });
          data["none_ther"] = ans || false;
          data["prev_ther_comm"] = "";
        } else {
          if (ans) {
            // Uncheck "add_none_ther" when other checkboxes are checked
            updatedQuestions.forEach((que) => {
              if (que?.meta_name.toLowerCase() === "none_ther") {
                que.mainAnswer = false;
              }
              if (
                que?.type === "8" &&
                (questionIndex === 11 || !que?.mainAnswer)
              ) {
                data[que?.meta_name] = false; // Uncheck other checkboxes
              } else {
                data["none_ther"] = false;
              }
            });
            data[updatedQuestions[questionIndex]?.meta_name] = ans;
          } else {
            data[updatedQuestions[questionIndex]?.meta_name] = ans;
            if (!ans && !isUndefined(relatedQuestions)) {
              data[relatedQuestions[relatedInd]?.metric_name] = relatedAns;
            }
          }
        }

        updatedQuestions[questionIndex] = {
          ...updatedQuestions[questionIndex],
          mainAnswer: ans,
          error: false,
        };

        return updatedQuestions;
      });
    }
  }

  function validation() {
    let valid = true;
    let checkBoxErr = false;

    const updatedQuestions = questionsList.map((question) => {
      let mainQuestionError = false;

      // Check if main answer is not selected
      if (isUndefined(question?.mainAnswer) || isEmpty(question?.mainAnswer)) {
        if (
          question?.type === "6" ||
          question?.type === "8" ||
          question?.meta_name.toLowerCase() === "none_ther" ||
          isBoolean(question?.mainAnswer) ||
          isNumber(question?.mainAnswer)
        ) {
          mainQuestionError = false;
        } else {
          mainQuestionError = true;
          valid = false; // Set valid to false if any main question has an error
        }
      }
      if (data["other_ther"] === true && isEmpty(other)) {
        valid = false;
      }
      // Validate related questions if any
      if (question.related_questions && question.related_questions.length > 0) {
        const updatedRelatedQuestions = question.related_questions.map(
          (relatedQuestion) => {
            if (!relatedQuestion.relatedAns) {
              return { ...relatedQuestion, error: true };
            }
            return { ...relatedQuestion, error: false };
          }
        );

        // If any related question has an error, set mainQuestionError to true
        if (
          question?.mainAnswer === "Yes" || question?.meta_name === "none_ther"
            ? !question?.mainAnswer
            : question?.mainAnswer
        ) {
          if (updatedRelatedQuestions.some((q) => q.error)) {
            valid = false; // Set valid to false if any related question has an error
          }
        }

        return {
          ...question,
          error: mainQuestionError,
          related_questions: updatedRelatedQuestions,
        };
      }

      return { ...question, error: mainQuestionError };
    });

    setQuestionsList(updatedQuestions);

    checkBoxErr = questionsList.some((item) => {
      if (item?.type === "8") {
        return item?.mainAnswer;
      }
    });

    const medValid = rowCount === 0 ? true : handleValidation();

    if (valid && medValid) {
      if (checkBoxErr) {
        savePatientHistory();
        setError("");
      } else {
        setError("Please select at least one checkbox");
      }
    }
  }

  // save patients
  async function savePatientHistory() {
    setBtnLoad(true);
    data["other_ther"] = !isEmpty(other) ? other : "";
    try {
      const response = await getApiData(Setting.endpoints.savePatient, "POST", {
        patientId: patientId,
        created_from: "web",
        answers: JSON.stringify([data]),
        medication_data: rowCount === 0 ? "" : JSON.stringify(answers),
      });
      if (response?.status) {
        handleModal("success");
        toast.success(response?.message);
        setIsChanged(false);
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
      // handleModal("close");
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
    }
  }

  function GetMedicationData(answer, index, type) {
    if (isEdit || isEmpty(from)) {
      setIsChanged(true);
      const values = [...answers];
      values[index][type] =
        type === "dose" ? (answer == 0 ? "" : Number(answer)) : answer;

      setAnswers(values);
    }
  }

  const handleValidation = () => {
    // Check if any field is empty
    const hasEmptyField = answers?.some((answer) =>
      Object.values(answer).some((value) => value === "" || value === null)
    );

    if (hasEmptyField) {
      // Set error for each empty field
      const newError = answers?.map((answer) =>
        Object.values(answer).some((value) => value === "" || value === null)
      );
      setMedError(newError);
      return false;
    } else {
      const newError = answers?.map((answer) =>
        Object.values(answer).some((value) => value === "")
      );
      setMedError(newError);
      return true;
    }
  };

  //mediation function
  function Medication() {
    return (
      <Grid container marginBottom={2} gap={1}>
        <Grid
          item
          xs={12}
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <CTypography variant={"subTitle"} title={"Medications"} isDot />
          {edit
            ? rowCount === 0 &&
              activeIndex == 0 && (
                <IconButton
                  onClick={() => {
                    setRowCount((prevCount) => prevCount + 1);
                  }}
                >
                  <Add />
                </IconButton>
              )
            : rowCount === 0 && (
                <IconButton
                  onClick={() => {
                    setRowCount((prevCount) => prevCount + 1);
                  }}
                >
                  <Add />
                </IconButton>
              )}
        </Grid>

        {Array.from({ length: rowCount }).map((_, index) => (
          <>
            <Grid item container gap={1} wrap="nowrap">
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  placeholder="Medicine name"
                  value={answers[index]?.medication}
                  onChange={(e) => {
                    GetMedicationData(e.target.value, index, "medication");
                  }}
                />
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  placeholder="Dose"
                  value={answers[index]?.dose}
                  onChange={(e) => {
                    const num =
                      e.target.value == 0
                        ? ""
                        : e.target.value.replace(/[^0-9]/g, "");
                    GetMedicationData(num, index, "dose");
                  }}
                />
              </Grid>
              <Grid item xs={4}>
                <Select
                  fullWidth
                  value={answers[index]?.dose_unit}
                  onChange={(e) => {
                    GetMedicationData(e.target.value, index, "dose_unit");
                  }}
                  displayEmpty
                  style={{
                    color: answers[index]?.dose_unit ? "" : color.placeholder,
                  }}
                >
                  <MenuItem value={""} hidden selected disabled>
                    Select Unit
                  </MenuItem>
                  {medicineUnits.map((item) => {
                    return <MenuItem value={item?.unit}>{item?.name}</MenuItem>;
                  })}
                </Select>
              </Grid>
              <Grid item xs={2}>
                <TextField
                  fullWidth
                  placeholder="Frequency"
                  value={answers[index]?.frequency}
                  onChange={(e) =>
                    GetMedicationData(e.target.value, index, "frequency")
                  }
                />
              </Grid>
              <Grid item xs={1} display={"flex"} justifyContent={"end"}>
                {edit
                  ? activeIndex == 0 &&
                    index === rowCount - 1 &&
                    rowCount < 10 && (
                      <IconButton
                        onClick={() => {
                          setRowCount((prevCount) => prevCount + 1);
                          if (rowCount > 0) {
                            setAnswers([
                              ...answers,
                              {
                                medication: "",
                                dose: "",
                                dose_unit: "",
                                frequency: "",
                              },
                            ]);
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    )
                  : index === rowCount - 1 &&
                    rowCount < 10 && (
                      <IconButton
                        onClick={() => {
                          setRowCount((prevCount) => prevCount + 1);
                          if (rowCount > 0) {
                            setAnswers([
                              ...answers,
                              {
                                medication: "",
                                dose: "",
                                dose_unit: "",
                                frequency: "",
                              },
                            ]);
                          }
                        }}
                      >
                        <Add />
                      </IconButton>
                    )}
                {edit
                  ? activeIndex == 0 &&
                    index >= 0 && (
                      <IconButton
                        onClick={() => {
                          setRowCount((prevCount) => prevCount - 1);
                          medError?.splice(index, 1);
                          if (rowCount > 1) {
                            answers?.splice(index, 1);
                          }
                        }}
                      >
                        <Remove />
                      </IconButton>
                    )
                  : index >= 0 && (
                      <IconButton
                        onClick={() => {
                          setRowCount((prevCount) => prevCount - 1);
                          medError?.splice(index, 1);
                          if (rowCount > 1) {
                            answers?.splice(index, 1);
                          }
                        }}
                      >
                        <Remove />
                      </IconButton>
                    )}
              </Grid>
            </Grid>

            {medError[index] ? (
              <FormHelperText style={{ color: color.error, marginTop: -5 }}>
                Please fill all the fields
              </FormHelperText>
            ) : null}
          </>
        ))}
      </Grid>
    );
  }

  return edit ? (
    <>
      {loader ? (
        <Grid
          container
          alignItems={"center"}
          justifyContent={"center"}
          style={{ width: 300, height: "100%" }}
        >
          <MainLoader />
        </Grid>
      ) : (
        <>
          <Grid
            item
            xs={12}
            className={className.scrollbar}
            style={{ height: "calc(100% - 20px)" }}
          >
            <Grid item xs={12} marginBottom={3}>
              <Typography variant="tableTitle">
                Personal/Family Medical History
              </Typography>
            </Grid>
            <Grid container justifyContent={"space-between"}>
              {!isEmpty(questionsList) && isArray(questionsList) ? (
                questionsList?.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <Grid
                        item
                        xs={item?.type === "8" ? 5.4 : 12}
                        md={item?.type === "8" ? 4 : 12}
                        marginBottom={item.error ? 0 : "20px"}
                      >
                        <Grid marginBottom={2}>
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
                                    checked={
                                      data[item?.meta_name] ? true : false
                                    }
                                    onChange={() => {
                                      if (data["other_ther"] == false) {
                                        setOther("");
                                      }
                                      getAnswerFromCheckbox(
                                        isUndefined(data[item?.meta_name]) ||
                                          !data[item?.meta_name]
                                          ? true
                                          : false,
                                        index
                                      );
                                    }}
                                  />
                                }
                              />
                            </FormControl>
                          ) : (
                            <CTypography
                              variant={"subTitle"}
                              title={item?.question}
                              required
                              isDot
                            />
                          )}
                        </Grid>
                        <Grid container rowGap={2}>
                          {item?.type === "1" ? (
                            optionList.map((it1, ind1) => {
                              if (
                                item?.meta_name.toLowerCase() === "hist_hi" &&
                                ind1 === 2
                              ) {
                                return (
                                  <Grid key={ind1} marginRight={1.5}>
                                    <Button
                                      fullWidth
                                      variant={"outlined"}
                                      onClick={() => {
                                        getAnswer(
                                          it1?.id,
                                          index,
                                          item?.related_questions
                                        );
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.mainAnswer === it1?.id
                                            ? color.green
                                            : "",
                                        color:
                                          item?.mainAnswer === it1?.id
                                            ? color.white
                                            : "",
                                        border: "none",
                                        marginRight: 40,
                                      }}
                                    >
                                      Unknown
                                    </Button>
                                  </Grid>
                                );
                              } else {
                                return (
                                  <Grid key={ind1} marginRight={1.5}>
                                    <Button
                                      fullWidth
                                      variant={"outlined"}
                                      onClick={() => {
                                        getAnswer(
                                          it1?.id,
                                          index,
                                          item?.related_questions
                                        );
                                      }}
                                      style={{
                                        backgroundColor:
                                          item?.mainAnswer === it1?.id
                                            ? color.green
                                            : "",
                                        color:
                                          item?.mainAnswer === it1?.id
                                            ? color.white
                                            : "",
                                        border: "none",
                                        marginRight: 40,
                                      }}
                                    >
                                      {it1.label}
                                    </Button>
                                  </Grid>
                                );
                              }
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
                                value={item?.mainAnswer || ""}
                                onChange={(e) =>
                                  getAnswer(
                                    e.target.value,
                                    index,
                                    item?.related_questions
                                  )
                                }
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
                                    variant={"outlined"}
                                    onClick={() => {
                                      getAnswer(
                                        ind2 === 0 ? true : false,
                                        index,
                                        item?.related_questions
                                      );
                                    }}
                                    style={{
                                      backgroundColor:
                                        item?.mainAnswer ===
                                        (ind2 === 0 ? true : false)
                                          ? color.green
                                          : "",
                                      color:
                                        item?.mainAnswer ===
                                        (ind2 === 0 ? true : false)
                                          ? color.white
                                          : "",
                                      border: "none",
                                      marginRight: 40,
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
                        {item?.error ? (
                          <FormHelperText
                            style={{ color: color.error, marginBottom: 15 }}
                          >
                            This question is mandatory
                          </FormHelperText>
                        ) : null}
                      </Grid>

                      {!isEmpty(error) &&
                        item?.meta_name.toLowerCase() === "none_ther" && (
                          <FormHelperText
                            style={{
                              color: color.error,
                              marginTop: -30,
                              marginBottom: 10,
                            }}
                          >
                            {error}
                          </FormHelperText>
                        )}

                      {item?.meta_name.toLowerCase() === "none_ther" &&
                      data["other_ther"] ? (
                        <Grid item xs={12} mb={2}>
                          <CTypography
                            variant={"subTitle"}
                            title="Enter other treatment"
                            required
                          />
                          <TextField
                            style={{ marginTop: 8 }}
                            fullWidth
                            placeholder="Enter your response here"
                            value={other}
                            onChange={(e) => setOther(e.target.value)}
                            helperText={
                              isEmpty(!isNull(other) && other.toString()) &&
                              "This response is required"
                            }
                            error={isEmpty(!isNull(other) && other.toString())}
                          />
                        </Grid>
                      ) : (
                        ""
                      )}
                      {!isUndefined(item?.mainAnswer) &&
                      (item?.meta_name.toLowerCase() === "none_ther"
                        ? !item?.mainAnswer
                        : item?.mainAnswer || item?.mainAnswer === 1)
                        ? item?.related_questions?.map((it3, ind3) => {
                            return (
                              <React.Fragment key={ind3}>
                                <Grid
                                  item
                                  xs={12}
                                  marginBottom={it3?.error ? 0 : "20px"}
                                >
                                  <Grid marginBottom={1}>
                                    <CTypography
                                      variant="subTitle"
                                      title={it3?.question}
                                      required
                                      isDot
                                    />
                                  </Grid>
                                  <Grid marginBottom={2}>
                                    {ind3 === 0 ? (
                                      <TextField
                                        fullWidth
                                        multiline={
                                          it3?.metric_name.toLowerCase() ===
                                          "prev_ther_comm"
                                        }
                                        rows={4}
                                        maxRows={4}
                                        placeholder="Enter your response here"
                                        value={it3?.relatedAns || ""}
                                        onChange={(e) =>
                                          getAnswer(
                                            item?.mainAnswer,
                                            index,
                                            item?.related_questions,
                                            item?.meta_name.toLowerCase() ===
                                              "hist_hi"
                                              ? e.target.value.replace(
                                                  /[^0-9]/g,
                                                  ""
                                                )
                                              : e.target.value,
                                            ind3
                                          )
                                        }
                                      />
                                    ) : (
                                      <Grid container rowGap={2}>
                                        {recoveryArr.map((it4, ind4) => {
                                          return (
                                            <Grid key={ind4} marginRight={1.5}>
                                              <Button
                                                fullWidth
                                                variant={"outlined"}
                                                onClick={() => {
                                                  getAnswer(
                                                    item?.mainAnswer,
                                                    index,
                                                    item?.related_questions,
                                                    ind4 + 1,
                                                    ind3
                                                  );
                                                }}
                                                style={{
                                                  backgroundColor:
                                                    it3?.relatedAns === ind4 + 1
                                                      ? color.green
                                                      : "",
                                                  color:
                                                    it3?.relatedAns === ind4 + 1
                                                      ? color.white
                                                      : "",
                                                  border: "none",
                                                  marginRight: 40,
                                                }}
                                              >
                                                {it4}
                                              </Button>
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                    )}
                                  </Grid>
                                </Grid>
                                {it3?.error ? (
                                  <FormHelperText
                                    style={{
                                      color: color.error,
                                      marginBottom: 15,
                                    }}
                                  >
                                    This question is mandatory
                                  </FormHelperText>
                                ) : null}
                              </React.Fragment>
                            );
                          })
                        : null}
                    </React.Fragment>
                  );
                })
              ) : (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: 500,
                    width: "100%",
                  }}
                >
                  <Typography variant="subTitle">No Data</Typography>
                </div>
              )}

              {Medication()}
            </Grid>
          </Grid>
          <Grid container display={"flex"} justifyContent={"flex-end"} gap={2}>
            <Grid item xs={1.5} style={{ display: "flex" }}>
              <Button
                variant="outlined"
                fullWidth
                style={{
                  minWidth: 120,
                  marginTop: 10,
                }}
                onClick={() => handleModal()}
              >
                Cancel
              </Button>
            </Grid>
            <Grid item xs={1.5} style={{ display: "flex" }}>
              {isEdit ? (
                <Button
                  variant="contained"
                  fullWidth
                  style={{
                    minWidth: 120,
                    marginTop: 10,
                  }}
                  disabled={!isChanged || btnLoad || activeIndex != 0}
                  onClick={() => validation()}
                >
                  {btnLoad ? <CircularProgress size={22} /> : "Save"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  style={{
                    minWidth: 120,
                    marginTop: 10,
                  }}
                  onClick={() => setIsEdit(true)}
                >
                  Edit
                </Button>
              )}
            </Grid>
          </Grid>
        </>
      )}
    </>
  ) : (
    <CModal
      visible={visible}
      title={"Patient History"}
      handleModal={() => {
        handleModal("close");
      }}
      children={
        <>
          {loader ? (
            <Grid
              container
              alignItems={"center"}
              justifyContent={"center"}
              style={{ width: 300, height: 300 }}
            >
              <MainLoader />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} className={className.scrollbar}>
                <Grid item xs={12} marginBottom={3}>
                  <Typography variant="tableTitle">
                    Personal/Family Medical History
                  </Typography>
                </Grid>
                <Grid container justifyContent={"space-between"}>
                  {!isEmpty(questionsList) && isArray(questionsList) ? (
                    questionsList?.map((item, index) => {
                      return (
                        <React.Fragment key={index}>
                          <Grid
                            item
                            xs={item?.type === "8" ? 5.4 : 12}
                            md={item?.type === "8" ? 4 : 12}
                            marginBottom={item.error ? 0 : "20px"}
                          >
                            <Grid marginBottom={2}>
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
                                        checked={
                                          data[item?.meta_name] ? true : false
                                        }
                                        onChange={() => {
                                          if (data["other_ther"] == false) {
                                            setOther("");
                                          }
                                          getAnswerFromCheckbox(
                                            isUndefined(
                                              data[item?.meta_name]
                                            ) || !data[item?.meta_name]
                                              ? true
                                              : false,
                                            index
                                          );
                                        }}
                                      />
                                    }
                                  />
                                </FormControl>
                              ) : (
                                <CTypography
                                  variant={"subTitle"}
                                  title={item?.question}
                                  required
                                  isDot
                                />
                              )}
                            </Grid>
                            <Grid container rowGap={2}>
                              {item?.type === "1" ? (
                                optionList.map((it1, ind1) => {
                                  if (
                                    item?.meta_name.toLowerCase() ===
                                      "hist_hi" &&
                                    ind1 === 2
                                  ) {
                                    return (
                                      <Grid key={ind1} marginRight={1.5}>
                                        <Button
                                          fullWidth
                                          variant={"outlined"}
                                          onClick={() => {
                                            getAnswer(
                                              it1?.id,
                                              index,
                                              item?.related_questions
                                            );
                                          }}
                                          style={{
                                            backgroundColor:
                                              item?.mainAnswer === it1?.id
                                                ? color.green
                                                : "",
                                            color:
                                              item?.mainAnswer === it1?.id
                                                ? color.white
                                                : "",
                                            border: "none",
                                            marginRight: 40,
                                          }}
                                        >
                                          Unknown
                                        </Button>
                                      </Grid>
                                    );
                                  } else {
                                    return (
                                      <Grid key={ind1} marginRight={1.5}>
                                        <Button
                                          fullWidth
                                          variant={"outlined"}
                                          onClick={() => {
                                            getAnswer(
                                              it1?.id,
                                              index,
                                              item?.related_questions
                                            );
                                          }}
                                          style={{
                                            backgroundColor:
                                              item?.mainAnswer === it1?.id
                                                ? color.green
                                                : "",
                                            color:
                                              item?.mainAnswer === it1?.id
                                                ? color.white
                                                : "",
                                            border: "none",
                                            marginRight: 40,
                                          }}
                                        >
                                          {it1.label}
                                        </Button>
                                      </Grid>
                                    );
                                  }
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
                                    value={item?.mainAnswer || ""}
                                    onChange={(e) =>
                                      getAnswer(
                                        e.target.value,
                                        index,
                                        item?.related_questions
                                      )
                                    }
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
                                        variant={"outlined"}
                                        onClick={() => {
                                          getAnswer(
                                            ind2 === 0 ? true : false,
                                            index,
                                            item?.related_questions
                                          );
                                        }}
                                        style={{
                                          backgroundColor:
                                            item?.mainAnswer ===
                                            (ind2 === 0 ? true : false)
                                              ? color.green
                                              : "",
                                          color:
                                            item?.mainAnswer ===
                                            (ind2 === 0 ? true : false)
                                              ? color.white
                                              : "",
                                          border: "none",
                                          marginRight: 40,
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
                            {item?.error ? (
                              <FormHelperText
                                style={{ color: color.error, marginBottom: 15 }}
                              >
                                This question is mandatory
                              </FormHelperText>
                            ) : null}
                          </Grid>

                          {!isEmpty(error) &&
                            item?.meta_name.toLowerCase() === "none_ther" && (
                              <FormHelperText
                                style={{
                                  color: color.error,
                                  marginTop: -30,
                                  marginBottom: 10,
                                }}
                              >
                                {error}
                              </FormHelperText>
                            )}

                          {item?.meta_name.toLowerCase() === "none_ther" &&
                            data["other_ther"] && (
                              <Grid item xs={12} mb={2}>
                                <CTypography
                                  variant={"subTitle"}
                                  title="Enter other treatment"
                                />
                                <TextField
                                  style={{ marginTop: 8 }}
                                  fullWidth
                                  placeholder="Enter response"
                                  value={other}
                                  onChange={(e) => setOther(e.target.value)}
                                  helperText={
                                    isEmpty(other) &&
                                    "This response is required"
                                  }
                                  error={isEmpty(other)}
                                />
                              </Grid>
                            )}
                          {!isUndefined(item?.mainAnswer) &&
                          (item?.meta_name.toLowerCase() === "none_ther"
                            ? !item?.mainAnswer
                            : item?.mainAnswer || item?.mainAnswer === 1)
                            ? item?.related_questions?.map((it3, ind3) => {
                                return (
                                  <React.Fragment key={ind3}>
                                    <Grid
                                      item
                                      xs={12}
                                      marginBottom={it3?.error ? 0 : "20px"}
                                    >
                                      <Grid marginBottom={1}>
                                        <Typography variant="subTitle">
                                          {it3?.question}
                                        </Typography>
                                      </Grid>
                                      <Grid marginBottom={2}>
                                        {ind3 === 0 ? (
                                          <TextField
                                            fullWidth
                                            multiline={
                                              it3?.metric_name ===
                                              "prev_ther_comm"
                                            }
                                            rows={4}
                                            maxRows={4}
                                            placeholder="Enter response"
                                            value={it3?.relatedAns || ""}
                                            onChange={(e) =>
                                              getAnswer(
                                                item?.mainAnswer,
                                                index,
                                                item?.related_questions,
                                                item?.meta_name.toLowerCase() ===
                                                  "hist_hi"
                                                  ? e.target.value.replace(
                                                      /[^0-9]/g,
                                                      ""
                                                    )
                                                  : e.target.value,
                                                ind3
                                              )
                                            }
                                          />
                                        ) : (
                                          <Grid container rowGap={2}>
                                            {recoveryArr.map((it4, ind4) => {
                                              return (
                                                <Grid
                                                  key={ind4}
                                                  marginRight={1.5}
                                                >
                                                  <Button
                                                    fullWidth
                                                    variant={"outlined"}
                                                    onClick={() => {
                                                      getAnswer(
                                                        item?.mainAnswer,
                                                        index,
                                                        item?.related_questions,
                                                        ind4 + 1,
                                                        ind3
                                                      );
                                                    }}
                                                    style={{
                                                      backgroundColor:
                                                        it3?.relatedAns ===
                                                        ind4 + 1
                                                          ? color.green
                                                          : "",
                                                      color:
                                                        it3?.relatedAns ===
                                                        ind4 + 1
                                                          ? color.white
                                                          : "",
                                                      border: "none",
                                                      marginRight: 40,
                                                    }}
                                                  >
                                                    {it4}
                                                  </Button>
                                                </Grid>
                                              );
                                            })}
                                          </Grid>
                                        )}
                                      </Grid>
                                    </Grid>
                                    {it3?.error ? (
                                      <FormHelperText
                                        style={{
                                          color: color.error,
                                          marginBottom: 15,
                                        }}
                                      >
                                        This question is mandatory
                                      </FormHelperText>
                                    ) : null}
                                  </React.Fragment>
                                );
                              })
                            : null}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <NoData />
                  )}

                  {Medication()}
                </Grid>
              </Grid>
            </>
          )}
          <Grid container justifyContent={"flex-end"} padding={"20px 0 10px"}>
            <Button
              variant="contained"
              style={{ width: "10rem" }}
              onClick={() => validation()}
              disabled={btnLoad}
            >
              {btnLoad ? <CircularProgress size={24} /> : "Create"}
            </Button>
          </Grid>
        </>
      }
    />
  );
}
