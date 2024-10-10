import { makeStyles } from "@mui/styles";
import React from "react";
export default function Gender(props) {
  const { height, width, fill, stroke } = props;
  const styles = makeStyles({
    st0: {
      fill: fill ? fill : "none",
      stroke: stroke ? stroke : "none",
      strokeWidth: 20,
      strokeMiterlimit: 10,
    },
  });
  const className = styles();
  return (
    <svg
      height={height ? height : 20}
      width={width ? width : 20}
      viewBox="0 0 47 13"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={className.st0}>
        <path d="M46.95 2.25C46.95 1.01 45.94 0 44.7 0H2.25C1.01 0 0 1.01 0 2.25C0 3.5 1.01 4.5 2.25 4.5H44.7C45.94 4.5 46.95 3.5 46.95 2.25Z" />
        <path d="M46.95 9.96997C46.95 8.72997 45.94 7.71997 44.7 7.71997H2.25C1.01 7.71997 0 8.72997 0 9.96997C0 11.21 1.01 12.22 2.25 12.22H44.7C45.94 12.22 46.95 11.22 46.95 9.96997Z" />
      </g>
    </svg>
  );
}
