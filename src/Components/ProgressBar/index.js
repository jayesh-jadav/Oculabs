import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { color } from "../../Config/theme";
import styles from "./styles";
import {
  GraphColor,
  RTAColor,
  ShortRTATitle,
  static_state_code,
} from "../../Config/Static_Data";
import { isEmpty, isUndefined } from "lodash";
import { getTitle } from "../../Utils/CommonFunctions";

export default function ProgressBar(props) {
  const { data = [] } = props;
  const className = styles();

  function CBlock(props) {
    const { value } = props;
    return (
      <div
        style={{
          width: 40,
          maxHeight: 13,
          minHeight: 13,
          backgroundColor: props.color ? props.color : GraphColor[value],
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 10 }}>
          {[0, 1, 2, 3, 4, 5, 6].includes(+value) ? value : 0}
        </span>
      </div>
    );
  }

  const [rtaData, setRtaData] = useState([]);
  const [countStateCode, setCountStateCode] = useState("");
  const [isOverflowing, setIsOverflowing] = useState({});
  const refs = useRef([]);

  // Effect to set rta_data
  useEffect(() => {
    const length = data && data?.length;
    let mergeArray;
    if (!isEmpty(data) && !isUndefined(length)) {
      const slice_val = static_state_code.slice(data[length - 1]?.state_code);
      mergeArray = [...data, ...slice_val];
      const countStateCodes = countConsecutiveRepeatedStateCodes(mergeArray);
      setCountStateCode(countStateCodes);
      setRtaData(mergeArray);
    } else {
      const countStateCodes =
        countConsecutiveRepeatedStateCodes(static_state_code);
      setCountStateCode(countStateCodes);
      setRtaData(static_state_code);
    }
  }, [data]);
  // Effect to check overflow for each item
  useEffect(() => {
    setIsOverflowing(
      refs.current.reduce((acc, ref, index) => {
        acc[index] = ref?.scrollWidth > ref?.clientWidth;
        return acc;
      }, {})
    );
  }, [countStateCode]);

  const countConsecutiveRepeatedStateCodes = (data) => {
    let currentCount = 0; // Track the count of the current state_code
    const counts = []; // Array to hold the counts of consecutive state_code repetitions
    data.forEach((item, index) => {
      if (
        index === 0 ||
        +item?.state_code === 0 ||
        item.state_code !== data[index - 1].state_code
      ) {
        // New state_code or the first item, push the count of the previous state_code if not first
        if (index !== 0) {
          counts.push({
            state_code:
              +data[index - 1].state_code !== 0
                ? data[index - 1].state_code
                : data[index - 1].default_state_code,
            count: currentCount,
          });
        }
        // Reset the count for the new state_code
        currentCount = 1;
      } else {
        // Part of the existing group, increment count
        currentCount++;
      }
    });
    // Add the count for the last state_code
    if (data.length > 0) {
      counts.push({
        state_code:
          +data[data.length - 1].state_code !== 0
            ? data[data.length - 1].state_code
            : data[data.length - 1].default_state_code,
        count: currentCount,
      });
    }
    return counts;
  };

  // this function is used to display a graph blocks
  function CBlock(props) {
    const { value } = props;
    return (
      <div
        style={{
          width: 40,
          maxHeight: 13,
          minHeight: 13,
          backgroundColor: props.color ? props.color : GraphColor[value],
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></div>
    );
  }

  // Function to get color based on state_code
  const getColor = (stateCode) => {
    return RTAColor[stateCode];
  };

  return (
    <Table
      size="small"
      className={className.scrollBar}
      style={{ display: "grid", overflow: "auto" }}
    >
      <TableBody style={{ padding: "0px 0px", backgroundColor: color.white }}>
        <TableRow>
          {rtaData?.map((value, index, array) => {
            const currentRTA = data?.length - 1 === index;
            return (
              <React.Fragment key={index}>
                <TableCell style={{ padding: "0px 0px 0px 0px" }}>
                  <div style={{ padding: "0px 5px 5px 0px" }}>
                    <CBlock
                      value={value?.state_code}
                      color={getColor(value?.state_code)}
                    />
                  </div>

                  <div
                    style={{
                      width:
                        index >= 0 &&
                        +value?.state_code !== 0 &&
                        +array[index + 1]?.state_code === value?.state_code
                          ? 45
                          : 40,
                      borderBottom: currentRTA
                        ? `3px dashed ${getColor(value?.state_code)}`
                        : `3px solid ${getColor(value?.state_code)}`,
                    }}
                  />
                </TableCell>
              </React.Fragment>
            );
          })}
        </TableRow>

        <TableRow style={{ display: "flex" }}>
          {!isEmpty(countStateCode) &&
            countStateCode?.map((value, index, array) => {
              const toolTipMsg =
                getTitle(value) === "RR"
                  ? "Relative Rest"
                  : getTitle(value) === "SL"
                  ? "Symptom Limited"
                  : getTitle(value) === "LT"
                  ? "Light Activity"
                  : getTitle(value) === "MOD"
                  ? "Moderate Activity"
                  : getTitle(value) === "INT"
                  ? "Intense Activity"
                  : getTitle(value) === "RTA"
                  ? "Return to Activity"
                  : getTitle(value);
              const sortName = ShortRTATitle.includes(getTitle(value));
              return (
                <Tooltip
                  key={index}
                  title={isOverflowing[index] || sortName ? toolTipMsg : ""}
                  arrow
                >
                  <TableCell
                    style={{
                      padding: `0px ${5 * value?.count}px 0px 0px`,
                    }}
                    colSpan={value?.count}
                  >
                    <Typography
                      ref={(el) => (refs.current[index] = el)}
                      style={{
                        maxWidth: 40 * value?.count,
                        minWidth: 40 * value?.count,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        height: 18,
                      }}
                    >
                      {getTitle(value)}
                    </Typography>
                  </TableCell>
                </Tooltip>
              );
            })}
        </TableRow>
      </TableBody>
    </Table>
  );
}
