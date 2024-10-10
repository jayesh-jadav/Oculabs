import { Collapse, Divider, Grid, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import styles from "../styles";
import { color } from "../../../../Config/theme";
import { Bookmark, KeyboardArrowDown } from "@mui/icons-material";
import { isTablet } from "react-device-detect";
import { useSearchParams } from "react-router-dom";
import { EncDctFn } from "../../../../Utils/EncDctFn";
import MainLoader from "../../../Loader/MainLoader";
import { isArray, isEmpty, isNull } from "lodash";
import { capFn } from "../../../../Utils/CommonFunctions";

export default function FlagReview(props) {
  const { from, eventData, slug, flagData = [], loader = false } = props;
  const className = styles();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [active, setActive] = useState([]);

  const handleToggleCollapse = (index) => {
    if (active.includes(index)) {
      setActive(active?.filter((item) => item !== index));
    } else {
      setActive([...active, index]);
    }
  };

  function removeTrailingSFromLastWord(phrase) {
    const words = phrase.split(" ");
    if (words[words.length - 1].endsWith("s")) {
      words[words.length - 1] = words[words.length - 1].slice(0, -1);
    }
    return words.join(" ");
  }

  return (
    <Grid
      container
      className={from !== "assessment" && className.container}
      style={{ height: "100%", overflow: "hidden" }}
    >
      {from !== "assessment" && (
        <>
          <Grid item xs={12}>
            <Typography variant="tableTitle">
              Flag Review - New Event {eventData?.title}
            </Typography>
          </Grid>
          <Grid item xs={12} style={{ padding: "5px 0px" }}>
            <Divider style={{ backgroundColor: color.borderColor }} />
          </Grid>
        </>
      )}

      <Grid
        item
        xs={12}
        className={className.flagViewScroll}
        style={{
          height: from === "assessment" ? "100%" : "calc(100% - 30px)",
          padding: "0 2px",
        }}
      >
        {loader ? (
          <Grid
            item
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
            height={"100%"}
          >
            <MainLoader />
          </Grid>
        ) : !isEmpty(flagData) && isArray(flagData) ? (
          flagData?.map((item, index) => {
            const flags = item?.data;
            if (from === "assessment") {
              if (slug === item?.unit_key) {
                return flags.map((flagItem, flagIndex) => (
                  <Grid
                    key={`${index}-${flagIndex}`}
                    item
                    xs={12}
                    style={{
                      boxShadow: color.shadow,
                      margin: "14px 0",
                      borderRadius: 12,
                    }}
                  >
                    <Grid
                      onClick={() => handleToggleCollapse(flagIndex)}
                      item
                      xs={12}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "auto",
                        cursor: "pointer",
                      }}
                    >
                      <Bookmark
                        style={{
                          color:
                            flagItem?.flag_type === "ERROR"
                              ? color.bookMarkRed
                              : flagItem?.flag_type === "CLINICAL"
                              ? color.lightOrange
                              : flagItem?.flag_type === "REVIEW"
                              ? color.primary
                              : null,
                          fontSize: isTablet ? 18 : undefined,
                        }}
                      />
                      <Typography
                        variant="tableTitle"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span
                          style={{
                            color:
                              flagItem?.flag_type === "ERROR"
                                ? color.bookMarkRed
                                : flagItem?.flag_type === "CLINICAL"
                                ? color.lightOrange
                                : flagItem?.flag_type === "REVIEW"
                                ? color.primary
                                : "inherit",
                          }}
                        >
                          {Array.isArray(flagItem?.flag_data)
                            ? flagItem.flag_data.filter(
                                (subFlag) => subFlag?.sub_flag_data?.length > 0
                              ).length
                            : 0}
                        </span>
                        {flagItem?.flag_data
                          ? capFn(flagItem?.flag_type)
                          : null}
                      </Typography>
                      <IconButton
                        style={{
                          marginLeft: "auto",
                          transform: active.includes(flagIndex)
                            ? "rotate(180deg)"
                            : undefined,
                        }}
                      >
                        <KeyboardArrowDown />
                      </IconButton>
                    </Grid>
                    <Collapse
                      in={active.includes(flagIndex)}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        marginLeft: "35px",
                        width: "90%",
                      }}
                    >
                      {flagItem?.flag_data?.map((subFlag, subIndex) => {
                        return (
                          <Grid
                            key={subIndex}
                            item
                            mb={1}
                            style={{
                              cursor:
                                from !== "assessment" ? "pointer" : undefined,
                            }}
                            onClick={() => {
                              if (
                                !isNull(
                                  subFlag?.sub_flag_data[0]?.assessment_id
                                )
                              ) {
                                setSearchParams({
                                  ...queryParams,
                                  mtab: 1,
                                  assessment_id: EncDctFn(
                                    subFlag?.sub_flag_data[0]?.assessment_id,
                                    "encrypt"
                                  ),
                                });
                              }
                            }}
                          >
                            {subFlag?.sub_flag_data?.length > 0 ? (
                              <Typography
                                variant="tableTitle"
                                style={{ color: color.bookMarkRed }}
                              >
                                {subFlag?.sub_flag_data?.length + " "}
                                {[
                                  "Severe Symptom",
                                  "New Symptom",
                                  "Worse Symptom",
                                ].includes(subFlag?.sub_flag_type)
                                  ? subFlag?.sub_flag_type &&
                                    subFlag?.sub_flag_data?.length > 1
                                    ? removeTrailingSFromLastWord(
                                        subFlag.sub_flag_type
                                      ).concat("s")
                                    : removeTrailingSFromLastWord(
                                        subFlag.sub_flag_type
                                      ) || ""
                                  : removeTrailingSFromLastWord(
                                      subFlag.sub_flag_type
                                    )}
                              </Typography>
                            ) : null}
                            {subFlag?.sub_flag_data?.map(
                              (subFlagItem, itemIndex) => (
                                <Typography
                                  key={itemIndex}
                                  style={{ marginLeft: 5 }}
                                >
                                  - {subFlagItem?.display_text}
                                </Typography>
                              )
                            )}
                          </Grid>
                        );
                      })}
                    </Collapse>
                  </Grid>
                ));
              }
            } else {
              return (
                <Grid
                  key={index}
                  item
                  xs={12}
                  style={{
                    boxShadow: color.shadow,
                    margin: "14px 0",
                    borderRadius: 12,
                  }}
                >
                  <Grid
                    onClick={() => handleToggleCollapse(index)}
                    item
                    xs={12}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "auto",
                      cursor: "pointer",
                    }}
                  >
                    <Bookmark
                      style={{
                        color:
                          item?.flag_type === "ERROR"
                            ? color.bookMarkRed
                            : item?.flag_type === "CLINICAL"
                            ? color.lightOrange
                            : item?.flag_type === "REVIEW"
                            ? color.primary
                            : null,
                        fontSize: isTablet ? 18 : undefined,
                      }}
                    />
                    <Typography
                      variant="tableTitle"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            item?.flag_type === "ERROR"
                              ? color.bookMarkRed
                              : item?.flag_type === "CLINICAL"
                              ? color.lightOrange
                              : item?.flag_type === "REVIEW"
                              ? color.primary
                              : "inherit",
                        }}
                      >
                        {Array.isArray(item?.flag_data)
                          ? item.flag_data.filter(
                              (subFlag) => subFlag?.sub_flag_data?.length > 0
                            ).length
                          : 0}
                      </span>
                      {item?.flag_data ? capFn(item?.flag_type) : null}
                    </Typography>
                    <IconButton
                      style={{
                        marginLeft: "auto",
                        transform: active.includes(index)
                          ? "rotate(180deg)"
                          : undefined,
                      }}
                    >
                      <KeyboardArrowDown />
                    </IconButton>
                  </Grid>
                  <Collapse
                    in={active.includes(index)}
                    timeout="auto"
                    unmountOnExit
                    style={{
                      marginLeft: "35px",
                      width: "90%",
                    }}
                  >
                    {item?.flag_data?.map((subFlag, subIndex) => {
                      return (
                        <Grid
                          key={subIndex}
                          item
                          mb={1}
                          style={{
                            cursor:
                              from !== "assessment" ? "pointer" : undefined,
                          }}
                          onClick={() => {
                            if (
                              !isNull(subFlag?.sub_flag_data[0]?.assessment_id)
                            ) {
                              setSearchParams({
                                ...queryParams,
                                mtab: 1,
                                assessment_id: EncDctFn(
                                  subFlag?.sub_flag_data[0]?.assessment_id,
                                  "encrypt"
                                ),
                              });
                            }
                          }}
                        >
                          <Typography
                            variant="tableTitle"
                            style={{ color: color.bookMarkRed }}
                          >
                            {subFlag?.sub_flag_data?.length + " "}
                            {[
                              "Severe Symptom",
                              "New Symptom",
                              "Worse Symptom",
                            ].includes(subFlag?.sub_flag_type)
                              ? subFlag?.sub_flag_type &&
                                subFlag?.sub_flag_data?.length > 1
                                ? removeTrailingSFromLastWord(
                                    subFlag.sub_flag_type
                                  ).concat("s")
                                : removeTrailingSFromLastWord(
                                    subFlag.sub_flag_type
                                  ) || ""
                              : removeTrailingSFromLastWord(
                                  subFlag.sub_flag_type
                                )}
                          </Typography>
                          {subFlag?.sub_flag_data?.map(
                            (subFlagItem, itemIndex) => (
                              <Typography
                                key={itemIndex}
                                style={{ marginLeft: 5 }}
                              >
                                - {subFlagItem?.display_text}
                              </Typography>
                            )
                          )}
                        </Grid>
                      );
                    })}
                  </Collapse>
                </Grid>
              );
            }
          })
        ) : (
          from !== "assessment" && (
            <Grid
              item
              display="flex"
              justifyContent="center"
              alignItems="center"
              height="100%"
            >
              <Typography variant="tableTitle">No Data</Typography>
            </Grid>
          )
        )}
      </Grid>
    </Grid>
  );
}
