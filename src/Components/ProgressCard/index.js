import {
  Avatar,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";
import styles from "./styles";
import { color } from "../../Config/theme";
import ProgressBar from "../ProgressBar";
import { isEmpty, isUndefined } from "lodash";
import { KeyboardArrowDown } from "@mui/icons-material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { Link } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import { statusText } from "../../Config/Static_Data";

export default function ProgressCard(props) {
  const { data = {}, handleAction = () => null, rightArrow } = props;
  const className = styles();

  const rta = data?.rta_data[data?.rta_data?.length - 1]?.state_code;
  const middleName = !isEmpty(data?.middlename) ? data?.middlename + " " : "";
  const fullName = data?.firstname + " " + middleName + " " + data?.lastname;
  return (
    <Grid container className={className.container}>
      <Grid
        item
        xs={12}
        display={"flex"}
        alignItems={"center"}
        justifyContent={"space-between"}
        flexWrap={"wrap"}
        gap={"10px"}
      >
        <Grid item display={"flex"} alignItems={"center"} gap={"5px"}>
          <Avatar src={data?.profile_pic} />
          <Typography
            variant="subTitle"
            style={{ textTransform: "capitalize" }}
          >
            {fullName}
          </Typography>
        </Grid>
        <Grid item display="flex" alignItems="center" gap={"10px"}>
          <Typography variant="subTitle">
            Status:{" "}
            <span
              style={{
                fontSize: 12,
                color: color.primary,
                whiteSpace: "nowrap",
              }}
            >
              {data?.asmt_status ? statusText[data?.asmt_status] : "N/A"}
            </span>
          </Typography>
          <Tooltip title={"Days since last action"} arrow>
            <Typography variant="subTitle">
              DSLA:{" "}
              <span
                style={{
                  fontSize: 12,
                  color: color.primary,
                  whiteSpace: "nowrap",
                }}
              >
                {data?.last_activity_of_doctor
                  ? data?.last_activity_of_doctor
                  : "N/A"}
              </span>
            </Typography>
          </Tooltip>
          <Typography variant="subTitle">
            eRTA:{" "}
            <span
              style={{
                fontSize: 12,
                color: color.primary,
                whiteSpace: "nowrap",
              }}
            >
              {data?.eRTA ? data?.eRTA : "N/A"}
            </span>
          </Typography>
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        display={"flex"}
        justifyContent={"space-between"}
        mt="10px"
        mb="5px"
      >
        <Grid item xs={12} display={"grid"}>
          <ProgressBar data={data?.rta_data} />
        </Grid>
        {rightArrow ? (
          <Link
            to={`/patient/details?patient_id=${EncDctFn(
              data?.patient_id,
              "encrypt"
            )}`}
          >
            <Tooltip title="Next page" arrow>
              <IconButton style={{ maxWidth: 30, maxHeight: 30 }}>
                <KeyboardArrowRightIcon />
              </IconButton>
            </Tooltip>
          </Link>
        ) : null}
      </Grid>
      <Grid
        item
        xs={12}
        display={"flex"}
        alignItems={"center"}
        flexWrap={"wrap"}
        gap={"5px"}
      >
        <Grid
          item
          style={{
            flexGrow: 1,
          }}
        >
          <Typography variant="subTitle">New</Typography>
          <Typography className={className.title}>
            {!isUndefined(data?.flag_key?.NEW_SYMPTOM)
              ? data?.flag_key?.NEW_SYMPTOM
              : "-"}
          </Typography>
        </Grid>
        <Grid
          item
          style={{
            flexGrow: 1,
          }}
        >
          <Typography variant="subTitle">Severe</Typography>
          <Typography className={className.title}>
            {!isUndefined(data?.flag_key?.SEVERE_SYMPTOM)
              ? data?.flag_key?.SEVERE_SYMPTOM
              : "-"}
          </Typography>
        </Grid>
        <Grid
          item
          style={{
            flexGrow: 1,
          }}
        >
          <Typography variant="subTitle">Worse</Typography>
          <Typography className={className.title}>
            {!isUndefined(data?.flag_key?.WORSE_SYMPTOM)
              ? data?.flag_key?.WORSE_SYMPTOM
              : "-"}
          </Typography>
        </Grid>
        <Grid
          item
          style={{
            flexGrow: 1,
          }}
        >
          <Typography variant="subTitle">Other</Typography>
          <Typography className={className.title}>
            {!isUndefined(data?.flag_key?.OTHER_SYMPTOM)
              ? data?.flag_key?.OTHER_SYMPTOM
              : "-"}
          </Typography>
        </Grid>

        <Grid
          item
          style={{
            flexGrow: 1,
          }}
        >
          <FormControl size="small">
            <InputLabel>Action</InputLabel>
            <Select
              label="Action"
              onChange={(e) => {
                handleAction(e.target.value);
              }}
              value={""}
              IconComponent={KeyboardArrowDown}
              style={{ minWidth: "100px" }}
            >
              <MenuItem value={rta == 6 ? "diagnosis" : "progress"}>
                {rta == 6 ? "Close Event & Record Outcome" : "Progress"}
              </MenuItem>
              <MenuItem value={"do_not_progress"}>Do Not Progress</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
}
