import { Chip, Grid, Typography } from "@mui/material";
import React from "react";
import {
  progressColor,
  RTAProgressLabelArr,
} from "../../../../Config/Static_Data";
import { color } from "../../../../Config/theme";
import ProgressBar from "../../../ProgressBar";

const growArr = [4, 4, 2, 2, 1, 1];
// this function is used to display RTAProgress design
export default function RTAProgress() {
  return (
    <Grid
      container
      style={{
        padding: "10px",
      }}
    >
      <Grid
        item
        xs={12}
        display="flex"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Typography variant="tableTitle">RTA Stage Progression</Typography>
        <Chip
          label="(Estimated RTA 17 Aug)"
          style={{ backgroundColor: color.chipColor }}
        />
      </Grid>
      <div style={{ width: "100%", marginTop: 10 }}>
        <ProgressBar
          textArr={RTAProgressLabelArr}
          progressColor={progressColor}
          growArr={growArr}
        />
      </div>
    </Grid>
  );
}
