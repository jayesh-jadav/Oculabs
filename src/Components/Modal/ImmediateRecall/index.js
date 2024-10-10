import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isArray, isEmpty } from "lodash";
import { toast } from "react-toastify";
import styles from "./style";
import theme, { color } from "../../../Config/theme";
import { CheckCircle, CircleOutlined } from "@mui/icons-material";

export default function ImmediateRecall(props) {
  const { data = {}, visible = false, handleModal = () => null } = props;
  const className = styles();
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const initialChecks = [[], [], []];

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [changeVal, setChangeVal] = useState(1);
  const [answers, setAnswers] = useState([]);
  const [checkedStates, setCheckedStates] = useState(initialChecks);

  // media query state
  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (visible) {
      getPatientQuestions();
    }
  }, [visible]);

  function getAnswers(tick, index, trial) {
    const newCheckedStates = [...checkedStates];
    newCheckedStates[trial - 1][index] = tick;

    const tickCount = newCheckedStates[trial - 1]?.filter(Boolean).length;

    setCheckedStates(newCheckedStates);

    setAnswers((prevAns) => {
      const updateAns = [...prevAns];
      updateAns[trial - 1] = {
        trial: `web_trial_${trial}`,
        score: tickCount,
      };
      return updateAns;
    });
  }

  // get patients questions function
  async function getPatientQuestions() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${6}&list=a`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
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

  async function createImmediateRecallApi() {
    setBtnLoad(true);
    const ans = {
      patient_id: data?.details?.patient_id || "",
      event_id: data?.details?.event_id || "",
      assessment_id: data?.details?.id || "",
      created_from: "web",
      word_set_id: questionsList[1]?.word_set_id,
      answers: JSON.stringify(answers),
    };

    try {
      const response = await getApiData(
        Setting.endpoints.createImmediateRecall,
        "POST",
        ans
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
    <CModal
      visible={visible}
      handleModal={() => {
        handleModal("close");
      }}
      title={"Immediate Recall"}
      maxWidth={"50vw"}
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
              className={className.scrollbar}
              container
              justifyContent={"center"}
              mb={10}
            >
              <Grid item xs={12} mb={10}>
                <Typography variant="tableTitle">
                  {questionsList[0]?.question}
                </Typography>
              </Grid>
              {questionsList[1]?.options.map((item, index) => {
                let lastInd = questionsList[1]?.options?.length - 1;
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
                      }}
                    >
                      {index === 0 && (
                        <Typography
                          variant="tableTitle"
                          style={{ margin: "-40px 0 20px" }}
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
                      marginTop={"2px"}
                    >
                      {[1, 2, 3].map((trial) => {
                        return (
                          <React.Fragment key={trial}>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                              }}
                            >
                              {index === 0 && (
                                <Typography
                                  variant="tableTitle"
                                  style={{
                                    margin: "-40px 0 20px",
                                  }}
                                >
                                  Trial {trial}
                                </Typography>
                              )}
                              <Checkbox
                                {...label}
                                checked={checkedStates[trial - 1][index]}
                                onChange={() =>
                                  getAnswers(
                                    !checkedStates[trial - 1][index],
                                    index,
                                    trial
                                  )
                                }
                                icon={<CircleOutlined />}
                                checkedIcon={<CheckCircle />}
                                sx={{
                                  "& .MuiSvgIcon-root": {
                                    fontSize: 28,
                                    color: checkedStates[trial - 1][index]
                                      ? color.green
                                      : color.disable,
                                  },
                                }}
                              />
                            </div>
                            {trial !== 3 && (
                              <div
                                style={{
                                  backgroundColor: color.disable,
                                  height: index === lastInd ? "50%" : "100%",
                                }}
                              >
                                <Divider orientation="vertical" flexItem />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <div
              style={{
                height: "50vh",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography>No Data</Typography>
            </div>
          )}
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
              disabled={btnLoad}
              onClick={() =>
                changeVal === 1 ? setChangeVal(2) : createImmediateRecallApi()
              }
            >
              {btnLoad ? <CircularProgress size={20} /> : "Next"}
            </Button>
          </Grid>
        </>
      }
    />
  );
}
