import React, { useState } from "react";
import CModal from "../CModal";
import {
  Button,
  CircularProgress,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { rescheduleData } from "../../../Config/Static_Data";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { getApiData } from "../../../Utils/APIHelper";
import { isArray, isEmpty, isNull } from "lodash";
import moment from "moment";

export default function RescheduleModal(props) {
  const {
    visible = false,
    handleModal = () => {},
    eventData,
    userData,
  } = props;
  const [value, setValue] = useState(1);
  const [rescheduleBtnLoad, setRescheduleBtnLoad] = useState(false);
  const providerNameParts = [
    (!isNull(userData?.provider_credentials) &&
      !isEmpty(userData?.provider_credentials)) ||
    ((isNull(userData?.provider_credentials) ||
      isEmpty(userData?.provider_credentials)) &&
      !isNull(userData?.provider_title) &&
      !isEmpty(userData?.provider_title))
      ? userData?.provider_title || ""
      : "",
    userData?.provider_firstname || "",
    userData?.provider_lastname || "",
    !isNull(userData?.provider_credentials) &&
    !isEmpty(userData?.provider_credentials)
      ? userData?.provider_credentials
      : "",
  ];

  const providerName = providerNameParts
    .filter((part) => !isEmpty(part) && !isNull(part))
    .join(" ")
    .trim();

  // Reschedule api integration function
  async function createReschedule(patientId, eventId, val) {
    setRescheduleBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.rescheduleAssessment}?patient_id=${patientId}&event_id=${eventId}&option=${val}`,
        "GET",
        {}
      );
      if (response.status) {
        toast.success(response.message.toString());
        handleModal("success");
      } else {
        toast.error(response.message.toString());
      }
    } catch (error) {
      toast.error(error.toString());
    } finally {
      setRescheduleBtnLoad(false);
    }
  }

  function remainingTime(targetDate) {
    const currentDate = moment(); // Current date and time
    const remaining = moment(targetDate).diff(currentDate); // Difference in

    if (remaining > 0) {
      const duration = moment.duration(remaining); // Convert milliseconds to duration

      const days = duration.days();
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      if (days > 0) {
        return `${days} day(S) & ${hours}:${minutes} hours`;
      } else {
        return `${hours}:${minutes} hours`;
      }
    }
  }

  return (
    <CModal
      maxWidth={"450px"}
      visible={visible}
      title="Manage Assessment Window"
      handleModal={() => {
        handleModal("close");
      }}
      closeIcon={false}
    >
      <Grid container gap={2} marginBlock={1} justifyContent={"center"}>
        <Grid item xs={12}>
          <RadioGroup
            row
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
            }}
          >
            {!isEmpty(rescheduleData) && isArray(rescheduleData)
              ? rescheduleData?.map((item, index) => {
                  let description = "";
                  if (index === 0) {
                    description = `This option will keep your patient on the assessment window defined in ${providerName} Provider settings while also maintaining the minimum 24-hour RTA stage stay requirement.`;
                  } else if (index === 1) {
                    description = `This option will create a new assessment window for this patient only while also maintaining the minimum 24-hour RTA stage stay requirement. Please be advised that in order to maintain this assessment window each completed assessment will need to be reviewed by ${remainingTime(
                      eventData?.reschedule_dates?.option_2
                    )} on the weekdays marked as available in ${providerName} settings.`;
                  } else if (index === 2) {
                    description = `This option will keep your patient on the assessment window defined in ${providerName} Provider settings. WARNING this option breaks the minimum 24-hour RTA stage stay requirement, the patient will take their next assessment in ${remainingTime(
                      eventData?.reschedule_dates?.option_3
                    )}.`;
                  }
                  return (
                    <Tooltip
                      key={index}
                      arrow
                      title={description}
                      placement="top"
                    >
                      <FormControlLabel
                        key={index}
                        value={item.value}
                        control={
                          <Radio
                            size="small"
                            style={{ padding: "2px 5px 2px 10px" }}
                          />
                        }
                        label={
                          <Typography
                            style={{ fontWeight: 900 }}
                            onClick={() => setValue(item.value)}
                          >
                            {item.label}:{" "}
                            <div>
                              <Typography variant="subTitle">
                                {eventData?.reschedule_dates && index === 0
                                  ? moment(
                                      eventData?.reschedule_dates?.option_1
                                    ).format("YYYY-MM-DD hh:mm A")
                                  : index === 1
                                  ? moment(
                                      eventData?.reschedule_dates?.option_2
                                    ).format("YYYY-MM-DD hh:mm A")
                                  : moment(
                                      eventData?.reschedule_dates?.option_3
                                    ).format("YYYY-MM-DD hh:mm A")}
                              </Typography>
                            </div>
                          </Typography>
                        }
                        style={{
                          textTransform: "capitalize",
                        }}
                      />
                    </Tooltip>
                  );
                })
              : null}
          </RadioGroup>
        </Grid>
        <Grid item style={{ marginLeft: "auto" }}>
          <Button
            variant="contained"
            disabled={rescheduleBtnLoad}
            onClick={() => {
              createReschedule(
                userData?.id || userData?.patient_id,
                eventData?.id || userData?.event_id,
                value
              );
            }}
            style={{ width: 100 }}
          >
            {rescheduleBtnLoad ? <CircularProgress size={22} /> : "Submit"}
          </Button>
        </Grid>
      </Grid>
    </CModal>
  );
}
