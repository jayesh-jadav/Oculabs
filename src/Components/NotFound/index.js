import React from "react";
import Lottie from "react-lottie";
import notFound from "../../Assets/Lottie/notFound.json";
import { Button, Grid, Typography } from "@mui/material";
import { color } from "../../Config/theme";
import { useLocation, useNavigate } from "react-router-dom";
import Home from "../CustomIcon/Header/Home";

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Grid
      container
      style={{
        height: location?.state?.from === "login" && window.innerWidth / 1.5,
      }}
      alignContent={"center"}
      justifyContent={"center"}
      flexDirection={"column"}
    >
      <Lottie
        options={{ loop: true, autoplay: true, animationData: notFound }}
        style={{ height: window.innerWidth >= 500 ? 350 : 250 }}
        width={window.innerWidth >= 500 ? 350 : 250}
      />
      <Typography
        style={{
          textAlign: "center",
          margin: "-60px 0 20px",
          fontSize: 35,
          color: color.primary,
        }}
        variant="title"
      >
        Page not found
      </Typography>
      <Grid item display={"flex"} justifyContent={"center"}>
        <Button
          variant="contained"
          style={{
            backgroundColor: color.primary,
            padding: 15,
            borderRadius: "50%",
            zIndex: 1,
          }}
          onClick={() => handleBack()}
        >
          {}
          <Home fill={color.white} width={24} />
        </Button>
      </Grid>
    </Grid>
  );
}
