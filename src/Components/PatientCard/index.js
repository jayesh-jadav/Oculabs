import {
  Avatar,
  Checkbox,
  Grid,
  ListItemButton,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { color } from "../../Config/theme";
import styles from "./styles";
import { BsFillCheckCircleFill, BsCircle } from "react-icons/bs";
import ActiveDot from "../../Components/ActiveDot/index";
import moment from "moment";
import { isEmpty, isNull } from "lodash";
import "./styles.css";

export default function PatientCard(props) {
  const {
    handleClick = () => null,
    data = {},
    ischeckbox,
    from = "",
    status,
    id = [],
  } = props;

  const className = styles();
  const [dob, setDob] = useState("");
  const [hover, setHover] = useState(false);
  const middlename = data?.middlename ? data?.middlename : "";

  useEffect(() => {
    if (!isEmpty(data?.dob) || !isNull(data?.dob)) {
      const displayDate = moment(data?.dob).format("MM-DD-YYYY");
      setDob(displayDate);
    }
  }, [data]);

  function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  function stringAvatar(name) {
    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
    };
  }

  // This is used to show tooltip when text contains ellipsis. {
  const [isEllipsisActive, setIsEllipsisActive] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const containerRef = useRef();
  useEffect(() => {
    const container = containerRef.current;
    if (container.scrollWidth > container.clientWidth) {
      setIsEllipsisActive(true);
    } else {
      setIsEllipsisActive(false);
      setShowTooltip(false);
    }
  }, []);
  const handleMouseEnter = () => {
    if (isEllipsisActive) {
      setShowTooltip(true);
    }
  };
  const handleMouseLeave = () => {
    setShowTooltip(false);
  };
  // }

  return (
    <ListItemButton
      className={"listItemButton1"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => handleClick(id.includes(data?.id) ? "deselect" : "select")}
      style={{
        boxShadow: color.shadow,
        backgroundColor: color.white,
        width: "auto",
        position: "relative",
        minWidth: "300px",
      }}
    >
      <Grid container gap={1} wrap="nowrap" style={{ display: "flex" }}>
        <Grid
          item
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <Avatar
            src={data?.profile_pic}
            {...stringAvatar(`${data.firstname} ${data.lastname}`)}
            style={{
              width: from === "accessPatient" ? 90 : 70,
              height: from === "accessPatient" ? 100 : 70,
              objectFit: "cover",
              borderRadius: 12,
              color: hover ? color.primary : color.white,
              textTransform: "uppercase",
              fontSize: 20,
              boxShadow: "none",
              backgroundColor: hover ? color.white : color.primary,
            }}
          />
        </Grid>
        <Grid
          item
          xs={12}
          style={{ display: "flex", flexDirection: "column", marginRight: 5 }}
        >
          <Tooltip
            title={data?.firstname + " " + middlename + " " + data?.lastname}
            arrow
            open={showTooltip}
          >
            <Typography
              ref={containerRef}
              variant="tableTitle"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className={"text1"}
              style={{
                textTransform: "capitalize",
                maxWidth: 150,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                color: !hover && color.primary,
              }}
            >
              {data?.firstname + " " + middlename + " " + data?.lastname}
            </Typography>
          </Tooltip>

          <Grid item display={"flex"}>
            {data?.dob && (
              <Grid itemProp="">
                <Typography
                  style={{
                    color: hover && color.white,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {moment(data?.dob).format("MM-DD-YYYY")}
                </Typography>
              </Grid>
            )}

            {from === "merge" && ischeckbox ? (
              <Grid
                display={"flex"}
                alignItems={"start"}
                style={{
                  position: "absolute",
                  right: 0,
                }}
              >
                <Checkbox
                  checked={id.includes(data?.id)}
                  icon={
                    <BsCircle
                      style={{ color: hover ? color.white : color.primary }}
                    />
                  }
                  checkedIcon={
                    <BsFillCheckCircleFill
                      style={{ color: hover ? color.white : color.primary }}
                    />
                  }
                  size="medium"
                />
              </Grid>
            ) : null}
          </Grid>

          <Grid
            item
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <Typography
              style={{
                color: hover && color.white,
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              Sex:{" "}
              {(data?.sex === "0"
                ? "Female"
                : data?.sex === "1"
                ? "Male"
                : "Intersex") || "-"}
            </Typography>

            {from === "accessPatient" && ischeckbox ? (
              <Grid
                display={"flex"}
                alignItems={"start"}
                style={{
                  position: "absolute",
                  right: 0,
                }}
              >
                <Checkbox
                  checked={data?.status}
                  icon={<BsCircle />}
                  checkedIcon={
                    <BsFillCheckCircleFill style={{ color: color.green }} />
                  }
                  size="medium"
                  onChange={handleClick}
                />
              </Grid>
            ) : (
              data?.gender && (
                <Tooltip title={data?.gender} arrow>
                  <Typography
                    style={{
                      color: hover && color.white,
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Gender:{" "}
                    <span
                      style={{
                        maxWidth: 80,
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {data?.gender}
                    </span>
                  </Typography>
                </Tooltip>
              )
            )}
          </Grid>
          {from === "accessPatient" && (
            <Grid>
              <Typography
                style={{
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                }}
              >
                {data?.email || "-"}
              </Typography>
              <Typography
                style={{
                  fontWeight: 400,
                  letterSpacing: "0.01em",
                  textTransform: "capitalize",
                }}
              >
                {((isNull(data?.provider_credentials) ||
                  isEmpty(data?.provider_credentials)) &&
                (!isNull(data?.provider_title) ||
                  !isEmpty(data?.provider_title))
                  ? data?.provider_title
                  : "") +
                  " " +
                  data?.provider_firstname +
                  " " +
                  data?.provider_lastname +
                  " " +
                  (!isNull(data?.provider_credentials) ||
                  !isEmpty(data?.provider_credentials)
                    ? data?.provider_credentials
                    : "")}
              </Typography>
            </Grid>
          )}
        </Grid>

        {status && (
          <Grid item style={{ position: "absolute", top: 4, right: 4 }}>
            <ActiveDot color={color.green} />
          </Grid>
        )}
      </Grid>
    </ListItemButton>
  );
}
