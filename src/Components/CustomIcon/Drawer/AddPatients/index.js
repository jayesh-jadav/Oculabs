import { makeStyles } from "@mui/styles";
import React from "react";
export default function AddPatient(props) {
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
      height={height ? height : 25}
      width={width ? width : 25}
      viewBox="0 0 26 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={className.st0}>
        <path d="M25.3293 12.3293C25.3293 12.9317 25.0783 13.4739 24.6867 13.8755C24.2952 14.2671 23.743 14.508 23.1406 14.508H15.1787V22.4699C15.1787 23.6847 14.2048 24.6586 13 24.6586C11.7952 24.6586 10.8112 23.6847 10.8112 22.4699V14.508H2.84939C1.64457 14.508 0.670677 13.5341 0.670677 12.3293C0.670677 11.1245 1.64457 10.1506 2.84939 10.1506H10.8112V2.18876C10.8112 0.973896 11.7952 0 13 0C13.6024 0 14.1446 0.240964 14.5361 0.642571C14.9377 1.03414 15.1787 1.58635 15.1787 2.18876V10.1506H23.1406C24.3454 10.1506 25.3293 11.1245 25.3293 12.3293Z" />
      </g>
    </svg>
  );
}
