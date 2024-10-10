import React, { useEffect, useState } from "react";
import CModal from "../CModal";
import {
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { isArray, isEmpty } from "lodash";
import { toast } from "react-toastify";
import styles from "./style";
import NoData from "../../NoData";

export default function DigitRecall(props) {
  const { data = {}, visible = false, handleModal = () => null } = props;
  const className = styles();

  const [loader, setLoader] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [questionsList, setQuestionsList] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [time, setTime] = useState(0);
  const [displayTime, setDisplayTime] = useState(null);

  useEffect(() => {
    getPatientQuestions();
  }, []);

  function getAnswer(digit, ans, questionIndex) {
    if (displayTime !== null) {
      const currentTime = Date.now();
      const timeDifference = currentTime - displayTime;
      setDisplayTime(null); // Reset the display time
      setTime(timeDifference);
    }

    setAnswers((prevData) => {
      const updateAns = [...prevData];
      updateAns[questionIndex] = {
        digit: digit,
        dur_screen: time, // Store the calculated time in sureScreen
        score: ans,
      };
      return updateAns;
    });
  }

  // get patients questions function
  async function getPatientQuestions() {
    setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.patientQuestions}?event_type=${7}`,
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

  async function createDigitRecallApi() {
    setBtnLoad(true);
    let item = {};
    item["patient_id"] = data?.details?.patient_id || "";
    item["event_id"] = data?.details?.event_id || "";
    item["assessment_id"] = data?.details?.id || "";
    item["created_from"] = "web";
    item["answers"] = JSON.stringify(answers);
    try {
      const response = await getApiData(
        Setting.endpoints.createDigitRecall,
        "POST",
        item
      );
      if (response?.status) {
        toast.success(response?.message);
        handleModal("close");
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
      title={"Digit Recall"}
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
              <Grid item xs={12} mb={5}>
                <Typography variant="tableTitle">
                  {questionsList[0]?.question}
                </Typography>
              </Grid>
              <Grid container justifyContent={"center"}>
                <Grid item xs={1.8} md={1.8}></Grid>
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
              {questionsList[1]?.options.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    container
                    justifyContent={"center"}
                    marginBottom={index % 2 !== 0 ? 1 : -1.7}
                  >
                    <Grid
                      item
                      xs={2}
                      md={2}
                      display={"flex"}
                      alignItems={"center"}
                    >
                      <Typography variant="tableTitle">{item}</Typography>
                    </Grid>
                    <Grid
                      item
                      display="flex"
                      justifyContent={"space-between"}
                      style={{ width: 150 }}
                    >
                      <FormControl fullWidth>
                        <RadioGroup
                          row
                          onChange={(e, value) => {
                            getAnswer(item, value === "true" ? 1 : 0, index);
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <FormControlLabel value={true} control={<Radio />} />
                          <FormControlLabel value={false} control={<Radio />} />
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                  </Grid>
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
              onClick={() => handleModal("back")}
            >
              Back
            </Button>
            <Button
              variant="contained"
              style={{ width: "10rem" }}
              disabled={btnLoad}
              onClick={() => {
                createDigitRecallApi();
              }}
            >
              {btnLoad ? <CircularProgress size={20} /> : "Next"}
            </Button>
          </Grid>
        </>
      }
    />
  );
}
