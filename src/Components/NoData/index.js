import { Grid, Typography } from "@mui/material";
import React from "react";
import Lottie from "react-lottie";
import NoData1 from "../../Assets/Lottie/noData1.json";
import { color } from "../../Config/theme";

export default function NoData(props) {
  const { title, textOnly = false, height } = props;
  return (
    <Grid
      container
      style={{ height: height ? height : 500 }}
      display={"flex"}
      alignItems={"center"}
      justifyContent={"center"}
      flexDirection={"column"}
    >
      {!textOnly && (
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: NoData1,
          }}
          height={window.innerWidth >= 500 ? 300 : 200}
          width={window.innerWidth >= 500 ? 300 : 200}
        />
      )}

      <Typography
        style={{
          color: color.primary,
          marginTop: window.innerWidth >= 500 ? -60 : -40,
        }}
        variant="tableTitle"
      >
        {title ? title : "No Data"}
      </Typography>
    </Grid>
  );
}
