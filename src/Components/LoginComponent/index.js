import {
  Button,
  Divider,
  Grid,
  Typography,
  useMediaQuery,
} from "@mui/material";
import React from "react";
import useStyles from "./styles";
import theme, { color } from "../../Config/theme";
import Images from "../../Config/Images";
import { isMobile, isTablet } from "react-device-detect";
import { useSelector } from "react-redux";
import ReCAPTCHA from "react-google-recaptcha";
import { Setting } from "../../Utils/Setting";
import { Link } from "react-router-dom";
import Typewriter from "../Typewriter";

export default function LoginComponent(props) {
  const { child, pageLoad, otpSuccess, handleCaptcha = () => null } = props;
  const classes = useStyles();
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const { captcha, loginImage } = useSelector((state) => state.auth);

  return (
    <Grid
      container
      wrap="nowrap"
      style={{
        height: isMobile || isTablet ? window.innerHeight : "100vh",
      }}
    >
      {md || isTablet ? null : (
        <Grid item xs={7} position={"relative"} backgroundColor={color.main}>
          <img
            src={loginImage || Images.loginImage}
            alt="Marketing Copy "
            style={{
              width: "100%",
              height: "100vh",
              objectFit: "fill",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "7%",
              left: "8%",
              right: "10%",
            }}
          >
            <Grid item xs={5}>
              <Typography variant="title" className={classes.mainHeading}>
                The missing piece to connected TBI care.
              </Typography>

              <div style={{ width: "100%" }}>
                <Typography className={classes.subText}>
                  <Typewriter
                    text="Through digitization and mobilization, the Oculabs platform makes TBI care more accessible to patients and easier for healthcare providers to monitor injury response and recovery like never before."
                    delay={60}
                    infinite
                  />
                </Typography>
              </div>

              <Button
                variant="contained"
                target="blank"
                href="https://www.neuroscienceinnovations.com"
                style={{
                  width: 228,
                  color: color.primary,
                  backgroundColor: color.white,
                  marginTop: 30,
                }}
              >
                Learn more
              </Button>
            </Grid>
          </div>
        </Grid>
      )}

      <Grid
        item
        xs={md || isTablet ? 12 : 5}
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        className={classes.container}
      >
        <Grid
          container
          justifyContent={"center"}
          gap={4}
          alignContent={"center"}
          style={{ margin: "auto" }}
        >
          <Grid
            item
            xs={12}
            display={"flex"}
            justifyContent={"center"}
            style={{ paddingTop: isTablet && 30 }}
          >
            <img src={Images.logo} className={classes.img} alt="Logo" />
          </Grid>
          {child}
          {!pageLoad && !otpSuccess && captcha > 2 && (
            <ReCAPTCHA
              sitekey={Setting.captchaKey}
              onChange={() => handleCaptcha(false)}
              size={isMobile && "compact"}
            />
          )}
        </Grid>
        <Grid item style={{ display: "flex", marginTop: "auto" }}>
          <Grid item xs={12}>
            <Grid
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Link
                to="/terms_condition"
                style={{
                  textDecoration: "none",
                  outline: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                state={"terms_condition"}
              >
                <Typography className={classes.cms}>
                  Terms & conditions
                </Typography>
              </Link>
              <Divider
                orientation="vertical"
                flexItem
                style={{ backgroundColor: color.placeholder }}
              />
              <Link
                to="/privacy_policy"
                style={{
                  textDecoration: "none",
                  outline: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                state={"privacy_policy"}
              >
                <Typography className={classes.cms}>Privacy policy</Typography>
              </Link>
            </Grid>
            <Typography className={classes.cText}>
              © Neuroscience Innovations, Inc. 2022 - All Rights Reserved
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
