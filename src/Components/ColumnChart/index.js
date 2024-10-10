import React from "react";
import Chart from "react-apexcharts";
import styles from "./styles";

export default function ColumnChart(props) {
  const {
    options = {},
    series = [],
    type = "bar",
    height = "500",
    width = "600",
  } = props;
  const classes = styles();

  return (
    <div className={classes.mixedChart}>
      <Chart
        options={options}
        series={series}
        type={type}
        width={width}
        height={height}
      />
    </div>
  );
}
