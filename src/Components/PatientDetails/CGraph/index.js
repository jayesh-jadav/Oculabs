import {
  Chip,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { isEmpty, isNull, isUndefined } from "lodash";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import {
  GraphColor,
  RTAColor,
  ShortRTATitle,
  static_state_code,
} from "../../../Config/Static_Data";
import { color } from "../../../Config/theme";
import Notes from "../../CustomIcon/Patients/Notes";
import MainLoader from "../../Loader/MainLoader";
import CModal from "../../Modal/CModal";
import styles from "./styles";
import { isBrowser } from "react-device-detect";
import { getTitle } from "../../../Utils/CommonFunctions";

export default function CGraph(props) {
  const { height, data, loader, eRTA = "" } = props;
  const className = styles();
  const [visible, setVisible] = useState(false);
  const [notes, setNotes] = useState("");
  const [activeScore, setActiveScore] = useState(null);
  const [hover, setHover] = useState(null);
  const [rtaData, setRtaData] = useState([]);
  const [countStateCode, setCountStateCode] = useState("");
  const [isOverflowing, setIsOverflowing] = useState({});
  const refs = useRef([]);

  // effect to set rta_data
  useEffect(() => {
    if (!isEmpty(data)) {
      const length = data?.rta_data?.length;
      let mergeArray;
      if (!isEmpty(data?.rta_data) && !isUndefined(length)) {
        const slice_val = static_state_code.slice(
          data?.rta_data[length - 1]?.state_code
        );
        mergeArray = [...data?.rta_data, ...slice_val];
        const countStateCodes = countConsecutiveRepeatedStateCodes(mergeArray);
        setCountStateCode(countStateCodes);
        setRtaData(mergeArray);
      } else {
        const countStateCodes =
          countConsecutiveRepeatedStateCodes(static_state_code);
        setCountStateCode(countStateCodes);

        setRtaData(static_state_code);
      }
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
        item?.state_code == 0 ||
        item.state_code !== data[index - 1].state_code
      ) {
        // New state_code or the first item, push the count of the previous state_code if not first
        if (index !== 0) {
          counts.push({
            state_code:
              data[index - 1].state_code != 0
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
          data[data.length - 1].state_code != 0
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
          backgroundColor: props.color
            ? props.color
            : GraphColor[value ? value : 0],
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
    <div
      className={className.container}
      style={{
        minHeight: height ? height : "100%",
        maxHeight: height ? height : "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="tableTitle">RTA Progression</Typography>
        <Chip
          label={`Estimated RTA ${eRTA || "N/A"}`}
          style={{ backgroundColor: color.chipColor }}
        />
      </div>

      {loader ? (
        <Grid
          style={{
            height: "calc(100% - 90px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MainLoader />
        </Grid>
      ) : !isEmpty(data) &&
        !isEmpty(data?.item) &&
        !isEmpty(data?.actual_values) ? (
        <TableContainer
          sx={{ maxHeight: "calc(100% - 40px)", width: "100%" }}
          className={className.scrollBarWidth}
        >
          <Table size="small" style={{ display: "grid" }}>
            <div
              style={{
                position: "sticky",
                top: 0,
                left: 0,
                zIndex: 1,
                backgroundColor: color.white,
              }}
            >
              <div style={{ padding: "5px 0px", backgroundColor: color.white }}>
                <TableRow>
                  <TableCell
                    style={{
                      padding: "0px 5px",
                      minWidth: 100,
                    }}
                    className={className.sticky}
                  ></TableCell>
                  {isEmpty(rtaData) && (
                    <TableCell
                      style={{ padding: "0px 5px 5px 0px" }}
                    ></TableCell>
                  )}
                  {rtaData?.map((value, index, array) => {
                    const currentRTA = data?.rta_data?.length - 1 === index;
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
                                value?.state_code != 0 &&
                                array[index + 1]?.state_code ==
                                  value?.state_code
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
                  <TableCell
                    style={{
                      padding: "0px 5px",
                      minWidth: 100,
                    }}
                    className={className.sticky}
                  ></TableCell>
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
                          title={
                            isOverflowing[index] || sortName ? toolTipMsg : ""
                          }
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
              </div>
              <div style={{ padding: "0px 0px 10px 0px" }}>
                <Typography variant="tableTitle" className={className.sticky}>
                  Symptom
                </Typography>
              </div>
            </div>

            <TableBody>
              {!isEmpty(data) &&
                data?.array_keys?.map((item, index) => {
                  return (
                    <React.Fragment key={index}>
                      <TableRow>
                        <Tooltip
                          title={
                            item == "date"
                              ? ""
                              : item == "comment"
                              ? ""
                              : item == "sx_score"
                              ? ""
                              : data?.actual_values?.[item]
                          }
                          arrow
                          placement="right"
                        >
                          <TableCell
                            variant={
                              item == "comment" || item == "date" ? "head" : ""
                            }
                            key={index}
                            scope="row"
                            className={className.sticky}
                            style={{
                              wordWrap: "nowrap",
                              whiteSpace: "nowrap",
                              padding:
                                item === "date" || item == "comment"
                                  ? "5px 5px 5px 0px"
                                  : "0px 5px 5px 5px",
                              maxWidth: 100,
                              minWidth: 100,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              bottom:
                                item == "date"
                                  ? 0
                                  : item == "comment"
                                  ? 46
                                  : "",
                              left:
                                item == "comment" ||
                                item == "sx_score" ||
                                item == "date"
                                  ? 0
                                  : "",
                              top: item == "sx_score" ? 80 : "",
                              zIndex:
                                item == "comment" ||
                                item == "sx_score" ||
                                item == "date"
                                  ? 1
                                  : "",
                            }}
                          >
                            {item == "date"
                              ? "Assessment"
                              : item == "comment"
                              ? `Patients Notes`
                              : item == "sx_score"
                              ? "Severity Score"
                              : data?.actual_values?.[item]}
                          </TableCell>
                        </Tooltip>

                        {data?.item.map((val, ind1) => {
                          return Object.keys(val).map((key, ind) => {
                            if (
                              item === key &&
                              key !== "date" &&
                              key !== "sx_score" &&
                              key !== "comment"
                            ) {
                              return (
                                <TableCell
                                  key={ind}
                                  style={{
                                    padding: "0px 5px 0px 0px",
                                  }}
                                >
                                  <CBlock value={val[key]} />
                                </TableCell>
                              );
                            } else if (item === key && key === "sx_score") {
                              return (
                                <TableCell
                                  key={ind}
                                  style={{
                                    padding: "0px 5px 0px 0px",
                                    position: "sticky",
                                    top: item == "sx_score" ? 80 : "",
                                    backgroundColor: color.white,
                                    textAlign: "center",
                                  }}
                                >
                                  {!isNull(val[key]) ? (
                                    <Typography
                                      onClick={() => {
                                        setActiveScore(
                                          !isNull(val[key]) && val[key]
                                        );
                                      }}
                                    >
                                      {val[key]}
                                    </Typography>
                                  ) : (
                                    <Typography>0</Typography>
                                  )}
                                </TableCell>
                              );
                            } else if (
                              item === key &&
                              (key === "date" || key === "comment")
                            ) {
                              const date = val[key]
                                ? moment(val[key]).format("D")
                                : "-";
                              const month = val[key]
                                ? moment(val[key]).format("MMM")
                                : "-";
                              const currentDate = moment(new Date()).format(
                                "YYYY-MM-DD"
                              );
                              const activeDate = moment(currentDate).isSame(
                                val[key]
                              );
                              return (
                                <TableCell
                                  key={ind}
                                  style={{
                                    padding:
                                      item === "date" || item == "comment"
                                        ? "5px 5px 5px 0px"
                                        : "0px",
                                    position: "sticky",
                                    bottom:
                                      key == "date"
                                        ? 0
                                        : key == "comment"
                                        ? 46
                                        : "",
                                    backgroundColor: color.white,
                                    textAlign: "center",
                                  }}
                                >
                                  {key === "comment" ? (
                                    <IconButton
                                      key={index}
                                      component="label"
                                      className={className.notes}
                                      sx={{
                                        border: `1px solid ${
                                          isEmpty(val[key])
                                            ? color.borderColor
                                            : color.primary
                                        } !important`,
                                        height: 40,
                                        width: 40,
                                      }}
                                      disabled={isEmpty(val[key])}
                                      onClick={() => {
                                        setNotes(val[key]);
                                        setVisible(true);
                                      }}
                                      onMouseEnter={() => setHover(ind1)}
                                      onMouseLeave={() => setHover(null)}
                                    >
                                      <Notes
                                        fill={
                                          isEmpty(val[key])
                                            ? color.placeholder
                                            : isBrowser && hover === ind1
                                            ? color.white
                                            : color.primary
                                        }
                                        height={35}
                                        width={25}
                                      />
                                      {/* <DescriptionOutlined /> */}
                                    </IconButton>
                                  ) : (
                                    <Typography
                                      style={{
                                        whiteSpace: "wrap",
                                        borderBottom:
                                          activeDate &&
                                          `2px solid ${color.primary}`,
                                      }}
                                    >
                                      {date}
                                      <br />
                                      {month}
                                    </Typography>
                                  )}
                                </TableCell>
                              );
                            }
                          });
                        })}
                      </TableRow>
                    </React.Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Grid
          style={{
            height: "calc(80%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <Typography variant="tableTitle">No Data</Typography>
        </Grid>
      )}

      <CModal
        visible={visible}
        handleModal={() => {
          setNotes("");
          setVisible(false);
        }}
        maxWidth={"560px"}
        title={"Patients Notes"}
        children={
          <Grid style={{ minHeight: 200 }}>
            <Typography>{notes}</Typography>
          </Grid>
        }
      />
    </div>
  );
}
