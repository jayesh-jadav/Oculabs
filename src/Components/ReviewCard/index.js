import {
  Avatar,
  Chip,
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
import ProgressBar from "../ProgressBar";
import { KeyboardArrowDown } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { EncDctFn } from "../../Utils/EncDctFn";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { capFn, hasPermission } from "../../Utils/CommonFunctions";
import { useSelector } from "react-redux";
import styles from "./styles";
import { color } from "../../Config/theme";
import { statusText } from "../../Config/Static_Data";

export default function ReviewCard(props) {
  const { item, rightArrow = false, handleSelect = () => null } = props;
  const className = styles();
  const { permissionData, userType } = useSelector((state) => state.auth);
  const middlename = item?.middlename ? item.middlename.trim() + " " : "";
  const fullName = `${item?.firstname || ""} ${middlename}${
    item?.lastname || ""
  }`.trim();

  return (
    <>
      <Grid container alignItems={"center"} flexWrap={"nowrap"} gap={1}>
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Grid item display={"flex"} alignItems={"center"}>
            <Avatar src={item?.profile_pic} />
            <Typography variant="subTitle" className={className.fullName}>
              {fullName}
            </Typography>
          </Grid>
          <Grid item className={className.eRTA}>
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
                  {item?.asmt_status ? statusText[item?.asmt_status] : "N/A"}
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
                    {item?.last_activity_of_doctor
                      ? item?.last_activity_of_doctor
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
                  {item?.eRTA ? item?.eRTA : "Pending"}
                </span>
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container gap={1} style={{ marginTop: 10, flexWrap: "nowrap" }}>
        <Grid item style={{ minWidth: 220 }}>
          <Grid item display={"flex"} gap={1} style={{ marginTop: 10 }}>
            {item?.flag_type?.map((item, index) => {
              return <Chip key={index} label={capFn(item)} />;
            })}
          </Grid>
        </Grid>

        <Grid xs={9} item>
          <Grid item xs={12} display={"grid"} style={{ marginBottom: 10 }}>
            <ProgressBar data={item?.rta_data} />
          </Grid>
          {(item?.diagnosis ||
            item?.auto_close ||
            item?.assessment_missed ||
            item?.baseline_clear) &&
            (hasPermission(permissionData, "diagnosis_module") ||
              hasPermission(permissionData, "review_action") ||
              hasPermission(permissionData, "review_action") ||
              userType === "org_admin") && (
              <FormControl size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  fullWidth
                  label="Action"
                  value={""}
                  onChange={(e) => {
                    handleSelect(e.target.value);
                  }}
                  IconComponent={KeyboardArrowDown}
                  style={{ minWidth: "150px" }}
                >
                  {(hasPermission(permissionData, "diagnosis_module") ||
                    userType === "org_admin") &&
                    item?.diagnosis && (
                      <MenuItem value={"RD"}>Record Diagnosis</MenuItem>
                    )}
                  {(hasPermission(permissionData, "review_action") ||
                    userType === "org_admin") &&
                    item?.auto_close && (
                      <>
                        <MenuItem value={"RE"}>Reopen Event</MenuItem>
                        <MenuItem value={"DE"}>Delete Event</MenuItem>
                        <MenuItem value={"CE"}>Clear Event</MenuItem>
                      </>
                    )}
                  {(hasPermission(permissionData, "review_action") ||
                    userType === "org_admin") &&
                    (item?.assessment_missed || item?.baseline_clear) && (
                      <MenuItem value={"CE"}>Clear Event</MenuItem>
                    )}
                </Select>
              </FormControl>
            )}
        </Grid>
        <Grid item display={"flex"} style={{ marginLeft: "auto" }}>
          {rightArrow && (
            <Link
              to={`/patient/details?patient_id=${EncDctFn(
                item?.patient_id,
                "encrypt"
              )}&event_id=${EncDctFn(item?.event_id, "encrypt")}`}
            >
              <Tooltip title="Next page" arrow>
                <IconButton style={{ maxWidth: 30, maxHeight: 30 }}>
                  <KeyboardArrowRightIcon />
                </IconButton>
              </Tooltip>
            </Link>
          )}
        </Grid>
      </Grid>
    </>
  );
}
