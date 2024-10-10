import { KeyboardArrowDown } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  Fade,
  Grid,
  Grow,
  IconButton,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import RadioCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import _, { isArray, isEmpty, isNull, isObject, isUndefined } from "lodash";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { color } from "../../../../Config/theme";
import styles from "./styles";
import BackBtn from "../../../BackBtn";
import ProviderNotes from "../../Overview/ProviderNotes";
import {
  eyeTrackingQuestion,
  flagArr,
  symptomInventoryQ,
} from "../../../../Config/Static_Data";
import { toast } from "react-toastify";
import { getApiData } from "../../../../Utils/APIHelper";
import { Setting } from "../../../../Utils/Setting";
import NoData from "../../../NoData";
import MainLoader from "../../../Loader/MainLoader";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../../Utils/EncDctFn";
import moment from "moment";
import Symptom from "../../../CustomIcon/Assessment/Symptom";
import EyetrackingData from "../EyetractingData";
import FlagReview from "../../Overview/FlagReview";
import { store } from "../../../../Redux/store/configureStore";

export default function AssessmentsReview(props) {
  const { handleClick = () => {} } = props;
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const className = styles();
  const tabArr = [
    "Treatment Info",
    "Symptom Inventory",
    "Immediate Recall",
    "Digit Recall",
    "Comment",
  ];
  const subTabArr = ["Sequence", "Heat", "Playback"];
  const [data, setData] = useState([]);
  const [tabVal, setTabVal] = useState({
    subTab: 0,
  });

  const type =
    tabVal?.subTab === 0
      ? "sequence"
      : tabVal?.subTab === 1
      ? "heat"
      : "replay";
  const [assessmentList, setAssessmentList] = useState([]);
  const [eyeTrackingData, setEyeTrackingData] = useState({});
  const [pageLoad, setPageLoad] = useState(false);
  const [notAttempt, setNotAttempt] = useState(false);
  const [open, setOpen] = useState({ id: null, visible: false });
  const [btnLoad, setBtnLoad] = useState(false);
  const [activeData, setActiveData] = useState({});
  const [flagData, setFlagData] = useState([]);

  // get the progress container width and height
  const ref = useRef();
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    if (ref.current) {
      setWidth(ref.current.offsetWidth);
      const updateContainerWidth = () => {
        const container = document.getElementById("rightContainer");
        if (container) {
          const newContainerHeight = container.offsetHeight;
          setWidth(newContainerHeight);
        }
      };
      // Initial width calculation
      updateContainerWidth();
      // Add a resize event listener
      window.addEventListener("resize", updateContainerWidth);
      return () => {
        window.removeEventListener("resize", updateContainerWidth);
      };
    }
  }, []);

  useEffect(() => {
    if (searchParams.has("event_id")) {
      AssessmentListApi(
        Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
      );
    }

    setTabVal({ subTab: 0 });
  }, []);

  useEffect(() => {
    if (!searchParams.has("amtab") && data?.details) {
      if (isNull(data?.details?.treatment_info)) {
        setSearchParams({ ...queryParams, amtab: 5 }, { replace: true });
        setTabVal({ ...tabVal, mainTab: 5 });
      } else {
        setSearchParams({ ...queryParams, amtab: 4 }, { replace: true });
        setTabVal({ ...tabVal, mainTab: 4 });
      }
    }
  }, [data]);

  useEffect(() => {
    if (searchParams.get("amtab") == 8) {
      return null;
    } else {
      if (
        searchParams.has("patient_id") &&
        searchParams.has("event_id") &&
        searchParams.has("assessment_id") &&
        searchParams.has("amtab")
      ) {
        setAssessmentList([]);
        getAssessmentDetails(
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          Number(EncDctFn(searchParams.get("assessment_id"), "decrypt")),
          Number(searchParams.get("amtab"))
        );
      }
      if (
        searchParams.has("patient_id") &&
        searchParams.has("event_id") &&
        searchParams.has("amtab")
      ) {
        getFlagDataApi(
          Number(EncDctFn(searchParams.get("patient_id"), "decrypt")),
          Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          Number(EncDctFn(searchParams.get("assessment_id"), "decrypt")),
          Number(searchParams.get("amtab"))
        );
      }
    }

    setNotAttempt(false);
  }, [tabVal.mainTab]);

  async function AssessmentListApi(eventId) {
    setPageLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.eventDetails}?event_id=${eventId}`,
        "GET",
        {}
      );
      if (response.status) {
        if (!isEmpty(response?.data)) {
          const arr = response?.data?.assessments.filter(
            (item) =>
              Number(EncDctFn(searchParams.get("assessment_id"), "decrypt")) ==
              item?.details?.id
          );
          setData(arr[0]);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("ERROR=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setPageLoad(false);
    }
  }
  const CHUNK_SIZE = 1024 * 1024; // 1 MB chunk size
  const parseLargeJSON = (jsonString) => {
    return new Promise((resolve, reject) => {
      try {
        // Ensure jsonString is a string
        if (typeof jsonString !== "string") {
          return;
        }

        const totalSize = jsonString.length;
        let offset = 0;
        let parsedData = "";

        const parseNextChunk = () => {
          if (offset >= totalSize) {
            resolve(JSON.parse(parsedData));
            return;
          }

          const end = Math.min(offset + CHUNK_SIZE, totalSize);
          parsedData += jsonString.slice(offset, end);
          offset = end;

          setTimeout(parseNextChunk, 0); // Schedule the next chunk to be parsed
        };

        parseNextChunk();
      } catch (error) {
        reject(error);
      }
    });
  };

  async function getAssessmentDetails(
    patient_id,
    event_id,
    assessment_id,
    event_type
  ) {
    setPageLoad(true);
    setEyeTrackingData({});
    try {
      const response = await getApiData(
        `${Setting.endpoints.assessmentDetails}?event_id=${event_id}&event_type=${event_type}&patient_id=${patient_id}&assessment_id=${assessment_id}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setAssessmentList(response?.data);
          if (response.data.eye_tracking) {
            const parseData = await (response.data.eye_tracking.tracking_data
              ? parseLargeJSON(response.data.eye_tracking.tracking_data)
              : {});
            setEyeTrackingData(parseData);
          }
        }
      } else {
        if (!isEmpty(response?.data?.type)) {
          setNotAttempt(true);
        } else {
          setNotAttempt(false);
          toast.error(response?.message);
        }
      }
    } catch (error) {
      toast.error(error.toString());
      console.log("error =======>>>", error);
    } finally {
      setPageLoad(false);
    }
  }

  async function ExportAssessmentApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.exportAssessment,
        "POST",
        {
          assessment_id: Number(
            EncDctFn(searchParams.get("assessment_id"), "decrypt")
          ),
          event_id: Number(EncDctFn(searchParams.get("event_id"), "decrypt")),
          patient_id: Number(
            EncDctFn(searchParams.get("patient_id"), "decrypt")
          ),
        }
      );
      if (response?.status) {
        downloadFile(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ ExportAssessmentApi ~ err==========>>>>>>>>>>", err);
    } finally {
      setBtnLoad(false);
    }
  }

  async function downloadFile(url) {
    const fileName = url.split("/").pop();
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    link.setAttribute("target", "_blank");
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function getFlagDataApi(pid, eid, aid, event_type) {
    try {
      const response = await getApiData(
        `${
          Setting.endpoints.flagLogs
        }?patient_id=${pid}&event_id=${eid}&assessment_id=${aid}&type=${"assessment"}&event_type=${event_type}`,
        "GET",
        {}
      );

      if (response?.status) {
        setFlagData(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      console.log("🚀 ~ getFlagDataApi ~ err==========>>>>>>>>>>", err);
      toast.error(err.toString());
    }
  }

  // find unit key as per slug
  function findUnitKey(slug) {
    if (!isEmpty(flagData) && Array.isArray(flagData)) {
      return flagData.reduce((accumulator, item) => {
        if (slug === item?.unit_key && Array.isArray(item?.data)) {
          item.data.forEach((item1) => {
            const key = item1?.flag_type?.toLowerCase();
            if (key) {
              accumulator[key] = key;
            }
          });
        }
        return accumulator;
      }, {});
    }

    return {};
  }

  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  // assessment list view
  function assessmentListView(data, mainInd, amtab) {
    // let key;
    // if (amtab === 6 && data?.Meta_key) {
    //   key = data?.Meta_key.replace(/\s+/g, "_");
    // } else {
    //   key = data?.object?.question;
    // }
    let trackingData = [];
    let unitKey = findUnitKey(data?.Meta_key);
    const key = data?.object?.question;
    const doubleParsed = eyeTrackingData || null;
    const metaKeyToQuestionMap = {
      feel_perfect: "Question_2",
      mental_activity: "Question_1",
      physical_activity: "Question_0",
    };
    // ?? This operator is particularly useful in scenarios where you want to ensure a variable has a value, providing a fallback if it is null or undefined.
    const questionKey = metaKeyToQuestionMap[data?.Meta_key] ?? key;
    trackingData =
      eyeTrackingData?.eyeDataByScreen?.[questionKey]?.eyeData?.eyeDataOverTime;
    if (
      eyeTrackingData.eyeDataByScreen &&
      typeof eyeTrackingData.eyeDataByScreen === "object"
    ) {
      const eyeDataArray = Object.values(eyeTrackingData.eyeDataByScreen).map(
        (trail) => {
          return trail.eyeData.eyeDataOverTime;
        }
      );
      trackingData = eyeDataArray && eyeDataArray[mainInd];
    } else {
      console.error("eyeDataByScreen is not defined or is not an object");
    }

    return (
      <Accordion
        key={mainInd}
        style={{ padding: "0px", borderRadius: 4, boxShadow: color.shadow }}
        expanded={searchParams.get("syptm") == mainInd}
        onChange={() => {
          setTabVal({ ...tabVal, subTab: 0 });
          if (searchParams.get("syptm") == mainInd) {
            delete queryParams.syptm;
            setSearchParams({ ...queryParams }, { replace: true });
          } else {
            setSearchParams(
              {
                ...queryParams,
                syptm: mainInd,
              },
              { replace: true }
            );
          }
        }}
      >
        <AccordionSummary>
          <Grid item xs={12} display="flex" alignItems={"center"}>
            <Grid
              item
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingRight: 20,
                alignItems: "center",
                width: "100%",
              }}
            >
              <Grid
                item
                xs={12}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {searchParams.get("amtab") == 5 ? (
                  <Symptom
                    data={assessmentList?.symptom_inventory}
                    fill={color.primary}
                    meta_key={data?.Meta_key}
                  />
                ) : null}
                <Typography marginLeft={"10px"} variant="tableTitle">
                  {searchParams.get("amtab") == 6
                    ? data?.Meta_key
                    : data?.object?.question || data?.digit}
                  {" : " +
                    (!isUndefined(data?.object?.final_score)
                      ? data?.object?.final_score
                      : !isUndefined(data?.object?.score)
                      ? data?.object?.score
                      : data?.object?.result)}
                </Typography>
              </Grid>
              <Grid
                item
                style={{
                  border: `1px solid ${color.borderColor}`,
                  borderRadius: 12,
                  padding: "0px 10px",
                  minWidth: 350,
                }}
              >
                <Grid
                  item
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <Typography variant="subTitle">Flags:</Typography>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    {flagArr?.map((item, index) => {
                      const checked = unitKey[item];
                      return (
                        <div
                          key={index}
                          style={{ display: "flex", alignItems: "center" }}
                        >
                          <Checkbox
                            checked={checked ? true : false}
                            icon={<RadioUncheckedIcon />}
                            checkedIcon={
                              <RadioCheckedIcon
                                style={{
                                  color:
                                    item === "clinical"
                                      ? color.persianRed
                                      : item === "error"
                                      ? color.lightOrange
                                      : color.primary,
                                }}
                              />
                            }
                            onChange={() => null}
                            sx={{
                              color:
                                item === "clinical"
                                  ? color.persianRed
                                  : item === "error"
                                  ? color.lightOrange
                                  : color.primary,
                            }}
                          />
                          <Typography
                            style={{
                              color:
                                item === "clinical"
                                  ? color.persianRed
                                  : item === "error"
                                  ? color.lightOrange
                                  : color.primary,
                              textTransform: "capitalize",
                            }}
                          >
                            {item}
                          </Typography>
                        </div>
                      );
                    })}
                  </div>
                </Grid>
              </Grid>
            </Grid>
            <Grid item style={{ marginLeft: "auto" }}>
              <IconButton
                style={{
                  transition: "0.5s",
                  transform:
                    searchParams.get("syptm") == mainInd && "rotate(180deg)",
                }}
                onClick={() => {
                  if (searchParams.get("syptm") == mainInd) {
                    setSearchParams(
                      { ...queryParams, syptm: null },
                      { replace: true }
                    );
                  } else {
                    setSearchParams(
                      {
                        ...queryParams,
                        syptm: mainInd,
                      },
                      { replace: true }
                    );
                  }
                }}
              >
                <KeyboardArrowDown />
              </IconButton>
            </Grid>
          </Grid>
        </AccordionSummary>

        <AccordionDetails>
          <Grid
            container
            flexWrap={"nowrap"}
            gap={"20px"}
            style={{ paddingTop: 10 }}
          >
            {trackingData && searchParams.get("syptm") == mainInd && (
              <Grid
                item
                style={{
                  border: "1px solid #ccc",
                  borderRadius: 12,
                  height: 300,
                  transition: "transform 0.3s ease", // Smooth transition for transform
                  transform: "none",
                  zIndex: "auto",
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => {
                  const {
                    auth: { playButton },
                  } = store.getState();
                  if (type === "replay" && playButton) {
                    setIsHovered(true);
                    setOpen({
                      id: `${mainInd}`,
                      visible: true,
                    });
                  } else if (type !== "replay") {
                    setOpen({
                      id: `${mainInd}`,
                      visible: true,
                    });
                  }
                  setActiveData({
                    key: data?.object?.question,
                    doubleParse: doubleParsed,
                    tracking_data: trackingData,
                    screenshot: data?.screenshot,
                    aoiXY: doubleParsed?.aoiXY,
                  });
                }}
              >
                <EyetrackingData
                  open={open?.visible}
                  deviceBG={data?.screenshot}
                  type={type}
                  deviceData={assessmentList?.eye_tracking?.device_data}
                  aoiXY={doubleParsed?.aoiXY}
                  tracking_data={trackingData}
                  from="main"
                  isHovered={isHovered}
                />
              </Grid>
            )}
            <Grid item xs={12}>
              {trackingData && (
                <Grid
                  item
                  xs={12}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap="10px"
                >
                  <Grid
                    item
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: 5,
                    }}
                  >
                    {!isEmpty(subTabArr) &&
                      isArray(subTabArr) &&
                      subTabArr?.map((item, index) => {
                        const active = tabVal.subTab === index;
                        return (
                          <Button
                            key={index}
                            variant="square"
                            style={{
                              backgroundColor: active
                                ? color.primary
                                : color.lightBorder,
                              color: active ? color.white : color.textColor,
                              transition: "0.5s",
                              minWidth: 100,
                            }}
                            onClick={() =>
                              setTabVal({ ...tabVal, subTab: index })
                            }
                          >
                            {item}
                          </Button>
                        );
                      })}
                  </Grid>
                </Grid>
              )}
              <Grid
                item
                xs={12}
                style={{
                  display: "flex",
                  gap: "20px",
                }}
              >
                <Grid item xs={6} md={8}>
                  {searchParams.get("amtab") == 6 ? (
                    <Grid style={{ paddingBottom: 5 }}>
                      <Typography
                        variant="subTitle"
                        style={{ color: color.primary }}
                      >
                        {data?.object?.word_set}
                      </Typography>
                    </Grid>
                  ) : null}
                  <Grid item xs={12} display="flex" flexWrap={"wrap"}>
                    {symptomInventoryQ?.map((item, index) => {
                      if (!isEmpty(data?.object)) {
                        return Object.keys(data?.object)?.map((subItem) => {
                          if (
                            isEmpty(trackingData) &&
                            eyeTrackingQuestion?.includes(subItem)
                          ) {
                            return null;
                          } else if (item?.meta_key === subItem) {
                            return (
                              <Grid
                                item
                                key={index}
                                sm={6}
                                md={4}
                                style={{ marginBottom: 10 }}
                              >
                                <Grid>
                                  <Typography variant="subTitle">
                                    {item?.question}
                                  </Typography>
                                </Grid>
                                <Typography
                                  variant="subTitle"
                                  style={{ color: color.primary }}
                                >
                                  {!isNull(data?.object[subItem]) ||
                                  !isEmpty(data?.object[subItem])
                                    ? item?.meta_key === "dur_screen" ||
                                      item?.meta_key === "fix_dur_screen"
                                      ? (+data?.object[subItem] / 1000).toFixed(
                                          2
                                        )
                                      : item?.meta_key === "fix_dur_aoi" ||
                                        item?.meta_key === "total_fix_dur"
                                      ? (+data?.object[subItem] / 60).toFixed(2)
                                      : data?.object[subItem]
                                    : "-"}
                                </Typography>
                              </Grid>
                            );
                          }
                        });
                      }
                    })}
                  </Grid>
                </Grid>

                <Grid item xs={6} md={4}>
                  <FlagReview
                    from="assessment"
                    slug={data?.Meta_key}
                    flagData={flagData}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    );
  }

  // this function is used to convert ms to min & sec
  const convertToMMSS = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <Grid container wrap={"nowrap"} gap={"10px"}>
      <Grid
        style={{
          width: "100%",
          height: "100%",
          paddingRight: 5,
        }}
        className={className.scroll}
      >
        <Grid
          item
          xs={12}
          className={className.container}
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <BackBtn handleClick={() => handleClick()} />
          <Typography variant="title">Assessment</Typography>
          {data?.details?.date && (
            <Typography marginLeft={1} variant="tableTitle">
              ({moment(data?.details?.date).format("MMM DD")})
            </Typography>
          )}
          <Button
            style={{ minWidth: "90px", marginLeft: "auto" }}
            variant="contained"
            onClick={() => ExportAssessmentApi()}
            disabled={btnLoad}
          >
            {btnLoad ? <CircularProgress size={24} /> : "Export"}
          </Button>
        </Grid>
        <Grid
          item
          xs={12}
          display={"flex"}
          style={{
            paddingTop: 10,
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <Grid
            item
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: `calc(100% - ${width !== 0 ? width + 10 : width}px)`,
              overflow: "auto",
              padding: "0px 5px 5px 5px",
            }}
            className={className.tabScrollBar}
          >
            {!isEmpty(data) &&
              !isEmpty(tabArr) &&
              isArray(tabArr) &&
              tabArr?.map((item, index) => {
                const active = searchParams.get("amtab") == index + 4;
                if (
                  (isNull(data?.details?.treatment_info) && index === 0) ||
                  (isNull(data?.details?.immediate_recall) && index === 2) ||
                  (isNull(data?.details?.digit_recall) && index === 3)
                ) {
                  return null;
                } else {
                  return (
                    <div key={index}>
                      <Button
                        style={{
                          backgroundColor: active
                            ? color.primary
                            : color.lightBorder,
                          color: active ? color.white : color.textColor,
                          transition: "0.5s",
                          borderRadius: 50,
                          paddingInline: 15,
                        }}
                        onClick={() => {
                          if (searchParams.get("amtab") !== 5) {
                            delete queryParams.syptm;
                            setSearchParams(
                              { ...queryParams, amtab: index + 4 },
                              { replace: true }
                            );
                            setTabVal({ ...tabVal, mainTab: index + 4 });
                          } else {
                            setTabVal({ ...tabVal, mainTab: index + 4 });
                            setSearchParams(
                              { ...queryParams, amtab: index + 4 },
                              { replace: true }
                            );
                          }
                        }}
                      >
                        {item}
                      </Button>
                    </div>
                  );
                }
              })}
          </Grid>
          {searchParams.get("amtab") == 5 ? (
            <Grid
              id={"rightContainer"}
              ref={ref}
              item
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              {["Symptom Severity Score", "Symptom Duration"].map(
                (item, index) => {
                  return (
                    <Grid
                      key={index}
                      item
                      style={{
                        padding: "10px 20px",
                        border: `1px solid ${color.borderColor}`,
                        borderRadius: 12,
                        boxShadow: color.shadow,
                        backgroundColor: color.white,
                      }}
                    >
                      <Grid>
                        <Typography variant="subTitle">{item}</Typography>
                      </Grid>
                      <Typography
                        variant="tableTitle"
                        style={{ color: color.primary }}
                      >
                        {index == 0
                          ? assessmentList?.keys?.score
                            ? assessmentList?.keys?.score
                            : "0"
                          : assessmentList?.keys?.score_duration
                          ? convertToMMSS(assessmentList?.keys?.score_duration)
                          : "0"}
                      </Typography>
                    </Grid>
                  );
                }
              )}
            </Grid>
          ) : searchParams.get("amtab") == 6 ||
            searchParams.get("amtab") == 7 ? (
            <Grid
              id={"rightContainer"}
              ref={ref}
              item
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Grid
                item
                style={{
                  padding: "10px 20px",
                  border: `1px solid ${color.borderColor}`,
                  borderRadius: 12,
                  boxShadow: color.shadow,
                  backgroundColor: color.white,
                }}
              >
                <Grid>
                  <Typography variant="subTitle">
                    {searchParams.get("amtab") == 6
                      ? "Total memory score (0-15)"
                      : "Total score"}
                  </Typography>
                </Grid>
                <Typography
                  variant="tableTitle"
                  style={{ color: color.primary }}
                >
                  {assessmentList?.keys?.score
                    ? assessmentList?.keys?.score
                    : "0"}
                </Typography>
              </Grid>
            </Grid>
          ) : null}
        </Grid>
        {/* main container */}
        {pageLoad ? (
          <Grid
            style={{
              height: "90%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MainLoader />
          </Grid>
        ) : (
          searchParams.has("amtab") && (
            <>
              {searchParams.get("amtab") == 4 ? (
                !notAttempt ? (
                  !isEmpty(assessmentList?.treatment_info) &&
                  isArray(assessmentList?.treatment_info) ? (
                    <Grow
                      in={!!data}
                      style={{ transformOrigin: "0 0 0" }}
                      {...(data ? { timeout: 1000 } : {})}
                    >
                      <Grid
                        item
                        xs={12}
                        style={{
                          padding: "10px",
                          backgroundColor: color.white,
                          boxShadow: color.shadow,
                          margin: "10px 0px",
                          borderRadius: 12,
                        }}
                      >
                        <Grid
                          item
                          xs={12}
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "10px",
                          }}
                        >
                          {assessmentList?.treatment_info?.map(
                            (item, mainInd) => {
                              if (
                                item?.Meta_key.toLowerCase() === "add_ther_comm"
                              ) {
                                return (
                                  <Grid
                                    key={mainInd}
                                    item
                                    xs={12}
                                    display="flex"
                                    flexDirection="column"
                                  >
                                    <Typography variant="subTitle">
                                      {item?.object?.question}
                                    </Typography>
                                    <Typography
                                      variant="subTitle"
                                      style={{
                                        color: color.primary,
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {!isEmpty(
                                        item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score
                                      )
                                        ? item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score
                                        : "-"}
                                    </Typography>
                                  </Grid>
                                );
                              } else if (item?.Meta_key === "add_other_ther") {
                                return (
                                  <Grid
                                    key={mainInd}
                                    item
                                    xs={3}
                                    display="flex"
                                    flexDirection="column"
                                  >
                                    <Typography variant="subTitle">
                                      {item?.object?.question}
                                    </Typography>
                                    <Typography
                                      variant="subTitle"
                                      style={{
                                        color: color.primary,
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {(item?.object?.score === 0 ||
                                      item?.object?.value === 0 ||
                                      item?.object?.final_score === 0 ||
                                      isNull(
                                        item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score
                                      )
                                        ? "No"
                                        : item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score) || "-"}
                                    </Typography>
                                  </Grid>
                                );
                              } else {
                                return (
                                  <Grid
                                    key={mainInd}
                                    item
                                    xs={3}
                                    display="flex"
                                    flexDirection="column"
                                  >
                                    <Typography variant="subTitle">
                                      {item?.object?.question}
                                    </Typography>
                                    <Typography
                                      variant="subTitle"
                                      style={{
                                        color: color.primary,
                                        textTransform: "capitalize",
                                      }}
                                    >
                                      {!isNull(
                                        item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score === 0
                                      ) ||
                                      !isEmpty(
                                        item?.object?.score ||
                                          item?.object?.value ||
                                          item?.object?.final_score === 0
                                      )
                                        ? item?.object?.score === 1 ||
                                          item?.object?.value === 1 ||
                                          item?.object?.final_score === 1
                                          ? "Yes"
                                          : "No"
                                        : "-"}
                                    </Typography>
                                  </Grid>
                                );
                              }
                            }
                          )}
                        </Grid>
                      </Grid>
                    </Grow>
                  ) : (
                    <NoData />
                  )
                ) : (
                  <Grid
                    style={{
                      height: "55vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      variant="title"
                      style={{ color: color.primary }}
                    >
                      You have not attempted Treatment Information
                    </Typography>
                  </Grid>
                )
              ) : (
                <Grid
                  item
                  display="flex"
                  flexDirection="column"
                  style={{
                    width: "100%",
                    padding: "10px 0px",
                  }}
                  rowGap={"5px"}
                >
                  {searchParams.get("amtab") == 5 ? (
                    !notAttempt ? (
                      !isEmpty(assessmentList?.symptom_inventory) &&
                      isArray(assessmentList?.symptom_inventory) ? (
                        assessmentList?.symptom_inventory?.map(
                          (item, mainInd) => {
                            return assessmentListView(item, mainInd);
                          }
                        )
                      ) : (
                        <NoData />
                      )
                    ) : (
                      <Grid
                        style={{
                          height: "55vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="title"
                          style={{ color: color.primary }}
                        >
                          You have not attempted Symptom Inventory
                        </Typography>
                      </Grid>
                    )
                  ) : searchParams.get("amtab") == 6 ? (
                    !notAttempt ? (
                      !isEmpty(assessmentList?.immdiate_recall) &&
                      isArray(assessmentList?.immdiate_recall) ? (
                        assessmentList?.immdiate_recall?.map(
                          (item, mainInd) => {
                            return assessmentListView(item, mainInd, 6);
                          }
                        )
                      ) : (
                        <NoData />
                      )
                    ) : (
                      <Grid
                        style={{
                          height: "55vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="title"
                          style={{ color: color.primary }}
                        >
                          You have not attempted Immediate Recall
                        </Typography>
                      </Grid>
                    )
                  ) : searchParams.get("amtab") == 7 ? (
                    !notAttempt ? (
                      !isEmpty(assessmentList?.digit_recall) &&
                      isArray(assessmentList?.digit_recall) ? (
                        assessmentList?.digit_recall?.map((item, mainInd) => {
                          return assessmentListView(item, mainInd, 7);
                        })
                      ) : (
                        <NoData />
                      )
                    ) : (
                      <Grid
                        style={{
                          height: "55vh",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="title"
                          style={{ color: color.primary }}
                        >
                          You have not attempted Digit Recall
                        </Typography>
                      </Grid>
                    )
                  ) : !isEmpty(data?.details?.comment) ? (
                    <Grow
                      in={!!data}
                      style={{ transformOrigin: "0 0 0" }}
                      {...(data ? { timeout: 1000 } : {})}
                    >
                      <TextField
                        multiline
                        minRows={5}
                        value={data?.details?.comment}
                        InputProps={{
                          style: {
                            boxShadow: color.shadow,
                            backgroundColor: color.white,
                          },
                        }}
                      />
                    </Grow>
                  ) : (
                    <NoData />
                  )}
                </Grid>
              )}
            </>
          )
        )}
      </Grid>
      {/* side / notes container */}
      <ProviderNotes style={{ height: "100%" }} from={"assessment"} />

      <Modal
        open={open?.visible}
        onClose={() => {
          setOpen({ id: null, visible: false });
        }}
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open?.visible} timeout={500}>
          <Box
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              height: 500,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {activeData && (
              <EyetrackingData
                open={open?.visible}
                type={type}
                from={"modal"}
                deviceData={assessmentList?.eye_tracking?.device_data}
                aoiXY={activeData?.aoiXY}
                tracking_data={activeData?.tracking_data}
                deviceBG={activeData?.screenshot}
                isHovered={isHovered}
              />
            )}
          </Box>
        </Fade>
      </Modal>
    </Grid>
  );
}
