import {
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import theme, { color } from "../../Config/theme";
import styles from "./styles";
import { BsArrowRight } from "react-icons/bs";
import { isTablet } from "react-device-detect";
import { BsFillCheckCircleFill, BsCircle } from "react-icons/bs";

export default function DashCard(props) {
  const {
    handleClick = () => null,
    value,
    title,
    arrow,
    icon,
    img,
    checkbox,
    from,
  } = props;

  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const className = styles();
  return (
    <Grid
      className={arrow ? className.cardArrow : className.card}
      style={{
        padding: arrow ? "20px 30px" : from === "dashBoard" && isTablet && 8,
      }}
      // style={
      //   (arrow && { minWidth: isMobile ? "200px" : "325px" },
      //   { padding: img && "15px" })
      // }
      onClick={handleClick}
    >
      <Grid
        item
        container
        gap={from === "dashBoard" && isTablet ? 1 : 3}
        wrap={"nowrap"}
        alignItems="unset"
      >
        <Grid item>
          <div
            className={
              from === "dashBoard" && isTablet
                ? className.tabImgContainer
                : className.imgContainer
            }
            style={{ padding: 5 }}
          >
            {img ? (
              <img
                alt={""}
                src={img}
                style={{
                  borderRadius: "15%",
                  width: "45px",
                  height: "45px",
                  objectFit: "fill",
                }}
              />
            ) : (
              <Typography
                style={{
                  color: color.primary,
                  fontSize: from === "dashBoard" && isTablet ? 26 : 34,
                  lineHeight: 0,
                }}
              >
                {icon}
              </Typography>
            )}
          </div>
        </Grid>
        <Grid
          item
          xs={12}
          style={
            img && {
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }
          }
        >
          <Grid
            style={{
              display: "flex",
              justifyContent: "space-between",
              // alignItems: "center",
            }}
          >
            <Typography
              variant="title"
              style={{
                color: color.primary,
              }}
            >
              {value}
            </Typography>
            {arrow && (
              <div>
                <Tooltip title="Next page" arrow>
                  <IconButton
                    // onClick={handleClick}
                    style={{ padding: 5 }}
                  >
                    <BsArrowRight cursor={"pointer"} fontSize={"28px"} />
                  </IconButton>
                </Tooltip>
              </div>
            )}
          </Grid>
          <Grid>
            <Typography
              style={{
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </Typography>
          </Grid>
        </Grid>
        {checkbox ? (
          <Grid
            style={{
              display: "flex",
              marginLeft: sm ? "auto" : "10px",
            }}
          >
            <FormControlLabel
              style={{ paddingTop: 0, marginRight: 0 }}
              control={
                <Checkbox
                  icon={<BsCircle />}
                  checkedIcon={<BsFillCheckCircleFill />}
                  size="large"
                />
              }
            />
          </Grid>
        ) : null}
      </Grid>
    </Grid>
  );
}
