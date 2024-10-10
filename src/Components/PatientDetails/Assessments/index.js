import {
  Chip,
  Grid,
  Grow,
  IconButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import styles from "./styles";
import { color } from "../../../Config/theme";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ActiveDot from "../../ActiveDot";
import TreatmentInfo from "../../Modal/TreatmentInfo";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty } from "lodash";
import moment from "moment";
import AssessmentsReview from "./AssesmentsReview";
import { Add } from "@mui/icons-material";
import MainLoader from "../../Loader/MainLoader";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Images from "../../../Config/Images";
import {
  flagType,
  rtaDropdownArr,
  statusColor,
  statusText,
} from "../../../Config/Static_Data";

export default function Assessments(props) {
  const {
    handleTab = () => null,
    handleApi = () => null,
    activeEvent = {},
  } = props;
  const className = styles();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());

  const [assessmentList, setAssessmentList] = useState({});

  const [assessData, setAssessData] = useState([]);
  const [open, setOpen] = useState(false);
  const [pageLoad, setPageLoad] = useState(false);
  const [changeTab, setChangeTab] = useState("");

  const eventName =
    assessmentList?.event_details?.event_type === "1"
      ? "Baseline"
      : assessmentList?.event_details?.event_type === "2"
      ? "Immediate Post Injury"
      : assessmentList?.event_details?.event_type === "3"
      ? "Initial Visit"
      : "";

  useEffect(() => {
    if (searchParams.has("event_id")) {
      AssessmentListApi(
        Number(EncDctFn(searchParams.get("event_id"), "decrypt"))
      );
    }
  }, [changeTab]);

  useEffect(() => {
    if (searchParams.has("assessment_id")) {
      setChangeTab("assessmentReview");
      handleTab("assessmentReview");
    } else {
      setChangeTab("");
      handleTab("");
    }
  }, [searchParams]);

  useEffect(() => {
    if (searchParams.has("status") && !isEmpty(assessmentList?.assessments)) {
      setAssessData(assessmentList?.assessments[0]);
      searchParams.get("status") === "Pending" && setOpen(true);
    }
  }, [searchParams, assessmentList]);

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
          setAssessmentList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
      setPageLoad(false);
    } catch (er) {
      setPageLoad(false);
      console.log("ERROR=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  function getRTA(data) {
    if (data) {
      const rta = rtaDropdownArr.find((item) => item?.value == data);
      return rta?.label;
    }
  }

  return (
    <>
      {changeTab === "assessmentReview" ? (
        <AssessmentsReview
          activeEvent={activeEvent}
          handleClick={() => {
            delete queryParams.assessment_id;
            delete queryParams.amtab;
            setSearchParams({ ...queryParams }, { replace: true });
            setChangeTab("");
            handleTab("");
          }}
        />
      ) : (
        <Grid container wrap="nowrap" gap={"10px"}>
          <Grid item xs={12} className={className.scroll}>
            {pageLoad ? (
              <Grid
                item
                xs={12}
                style={{
                  height: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MainLoader />
              </Grid>
            ) : !isEmpty(assessmentList?.assessments) &&
              isArray(assessmentList?.assessments) ? (
              assessmentList?.assessments?.map((item, index) => {
                const status = statusColor.find(
                  (it) => it?.status === item?.details?.status
                );
                const assessDate = new Date(
                  item?.details.date
                ).toLocaleDateString("en-US");

                assessmentList?.rta_data?.forEach((it) => {
                  let rtaDate = new Date(it?.created_at).toLocaleDateString(
                    "en-US"
                  );

                  if (assessDate === rtaDate) {
                    item["details"]["rta"] = it?.state_code;
                  }
                });
                let filled = 0;
                let array = [
                  "treatment_info",
                  "symptom_inventory",
                  "digit_recall",
                  "immediate_recall",
                ];
                array.map((e) => {
                  if ([1, null].includes(item?.details[e])) {
                    filled += 1;
                  }
                });

                return (
                  <Grow
                    key={index}
                    in={!!item}
                    style={{ transformOrigin: "0 0 0" }}
                    {...(item ? { timeout: 1000 } : {})}
                  >
                    <Grid
                      container
                      className={className.container}
                      justifyContent={"space-between"}
                      rowGap={2}
                      wrap="nowrap"
                    >
                      <Grid
                        item
                        xs={12}
                        sm={7}
                        md={4}
                        lg={3}
                        xl={3}
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Grid item>
                          <Tooltip title={statusText[status?.status]} arrow>
                            <Grid item className={className.icon}>
                              {status?.status === "MISSED" ||
                              status?.status === "MISSED_DUE_TO_SCHEDULE" ? (
                                <img
                                  src={Images.AssessmentMissed}
                                  style={{
                                    height: 25,
                                    width: 25,
                                    marginLeft: 5,
                                  }}
                                  alt="missing"
                                />
                              ) : status?.status === "COMPLETE" ? (
                                <img
                                  src={Images.AssessmentCompleted}
                                  style={{
                                    height: 25,
                                    width: 25,
                                    marginLeft: 4,
                                  }}
                                  alt="completed"
                                />
                              ) : (
                                <img
                                  src={Images.AssessmentPending}
                                  style={{ height: 28, width: 28 }}
                                  alt="pending"
                                />
                              )}
                            </Grid>
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          style={{
                            marginLeft: 10,
                            gap: "5px",
                          }}
                        >
                          <Grid item xs={12} mb={1}>
                            <Typography variant="tableTitle">
                              Assessment{" "}
                              {assessmentList?.assessments.length - index}
                            </Typography>
                          </Grid>

                          <Grid
                            item
                            gap={"10px"}
                            display={"flex"}
                            alignItems={"center"}
                          >
                            <Grid
                              item
                              xs={12}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: color.chipColor,
                                borderRadius: 20,
                                boxShadow: color.chipShadow,
                              }}
                            >
                              <ActiveDot
                                marginLeft={10}
                                color={status?.color}
                              />
                              <Chip
                                label={statusText[item?.details?.status]}
                                style={{
                                  backgroundColor: color.chipColor,
                                  textTransform: "capitalize",
                                }}
                              />
                            </Grid>
                            <Grid item>
                              <Chip
                                label={
                                  !isEmpty(item?.details?.date)
                                    ? moment(item?.details?.date).format(
                                        "MMM DD"
                                      )
                                    : ""
                                }
                                style={{
                                  backgroundColor: color.chipColor,
                                  boxShadow: color.chipShadow,
                                }}
                              />
                            </Grid>
                            {![1, 2, 3].includes(+item?.details?.asmt_type) &&
                              item?.details?.asmt_submit_due_at &&
                              item?.details?.asmt_open_at && (
                                <Grid item>
                                  <Chip
                                    label={`${moment(
                                      item?.details?.asmt_open_at,
                                      "HH:mm"
                                    ).format("h:mm A")} -
                                ${moment(
                                  item?.details?.asmt_submit_due_at,
                                  "HH:mm"
                                ).format("h:mm A")}`}
                                    style={{
                                      backgroundColor: color.chipColor,
                                      boxShadow: color.chipShadow,
                                    }}
                                  />
                                </Grid>
                              )}
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item sm={11} md={7} lg={7} xl={7}>
                        <Grid item style={{ display: "flex" }}>
                          <Grid item xs={5} style={{ textAlign: "center" }}>
                            <Typography variant="tableTitle">RTA</Typography>
                            <Typography className={className.value}>
                              {getRTA(item?.details?.event_rta_state_id) || "-"}
                            </Typography>
                          </Grid>
                          <Grid item xs={5} style={{ textAlign: "center" }}>
                            <Typography variant="tableTitle">
                              Symptom Severity
                            </Typography>
                            <Typography className={className.value}>
                              {item?.details?.symptom_score || "-"}
                            </Typography>
                          </Grid>
                          <Grid item xs={5} style={{ textAlign: "center" }}>
                            <Typography variant="tableTitle">Flags</Typography>
                            <Typography className={className.value}>
                              {!isEmpty(item?.flag_data) &&
                              isArray(item?.flag_data)
                                ? item.flag_data
                                    .map((flag) => flagType[flag])
                                    .join(", ")
                                : "-"}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item style={{ margin: "auto 0px" }}>
                        {["OPEN", "READY", "LATE", "PENDING"].includes(
                          item?.details?.status
                        ) &&
                        filled != 4 &&
                        +activeEvent?.status === 1 ? (
                          <IconButton
                            onClick={() => {
                              setAssessData(item);
                              setOpen(true);
                            }}
                          >
                            <Add
                              className={className.arrowIcon}
                              style={{ fontSize: "26px" }}
                            />
                          </IconButton>
                        ) : (
                          <Tooltip title="Next page" arrow>
                            <IconButton
                              onClick={() => {
                                setAssessData(item);
                                setSearchParams({
                                  ...queryParams,
                                  assessment_id: EncDctFn(
                                    item?.details?.id,
                                    "encrypt"
                                  ),
                                });
                              }}
                            >
                              <KeyboardArrowRightIcon
                                className={className.arrowIcon}
                                style={{ fontSize: "26px" }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Grid>
                    </Grid>
                  </Grow>
                );
              })
            ) : (
              <Grid
                container
                height={"90%"}
                justifyContent={"center"}
                alignItems={"center"}
              >
                <Typography variant="subTitle">No Data</Typography>
              </Grid>
            )}
          </Grid>

          <TreatmentInfo
            data={assessData}
            visible={open}
            handleModal={(type, reload) => {
              if (type === "close") {
                setOpen(false);
                delete queryParams.status;
                setSearchParams({ ...queryParams }, { replace: true });
              } else if (type === "success") {
                if (searchParams.has("event_id")) {
                  AssessmentListApi(
                    EncDctFn(searchParams.get("event_id"), "decrypt")
                  );
                }
                setOpen(false);
                handleApi(reload);
              }
            }}
          />
        </Grid>
      )}
    </>
  );
}
