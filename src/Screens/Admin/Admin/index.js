import React from "react";
import { Grid, Typography, useMediaQuery, Zoom } from "@mui/material";
import DashCard from "../../../Components/DashCard";
import { adminCard } from "../../../Config/Static_Data";
import theme, { color } from "../../../Config/theme";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "./styles";
import MainLoader from "../../../Components/Loader/MainLoader";

export default function Admin() {
  const { userData, selectedOrganization, adminLoader, userType } = useSelector(
    (state) => state.auth
  );
  const className = styles();

  const xl = useMediaQuery(theme.breakpoints.down("xl"));
  const lg = useMediaQuery(theme.breakpoints.down("lg"));
  const md = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Grid className={className.container}>
      <Typography
        variant="title"
        style={{
          color: color.primary,
          marginLeft: md ? 0 : lg ? "7.5%" : xl ? "5%" : "5.5%",
        }}
      >
        Admin
      </Typography>
      <Grid
        container
        gap={2}
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {adminLoader ? (
          <MainLoader />
        ) : (
          adminCard.map((item, index) => {
            if (
              userData?.personal_info?.role_slug !== "org_admin" &&
              item?.id === 1
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug !== "super_admin" &&
              item?.id === 2
            ) {
              return null;
            } else if (
              (userData?.personal_info?.role_slug !== "super_admin" &&
                userData?.personal_info?.role_slug !== "org_admin" &&
                item?.id === 5) ||
              (userData?.personal_info?.role_slug !== "super_admin" &&
                userData?.personal_info?.role_slug !== "org_admin" &&
                item?.id === 4) ||
              (userData?.personal_info?.role_slug !== "super_admin" &&
                userData?.personal_info?.role_slug !== "org_admin" &&
                item?.id === 16) ||
              (userData?.personal_info?.role_slug !== "super_admin" &&
                userData?.personal_info?.role_slug !== "org_admin" &&
                (item?.id === 11 || item?.id === 12))
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug !== "super_admin" &&
              userData?.personal_info?.role_slug !== "ops_admin" &&
              userData?.personal_info?.role_slug !== "org_admin" &&
              item?.id === 3
            ) {
              return null;
            } else if (
              userData?.personal_info?.is_provider === 1 &&
              item?.id === 6
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug === "assistant" &&
              userData?.personal_info?.is_provider === 0 &&
              (item?.id === 6 || item?.id === 7)
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug !== "super_admin" &&
              (item?.id === 13 ||
                item?.id === 14 ||
                item?.id === 15 ||
                item?.id === 18)
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug === "super_admin" &&
              selectedOrganization &&
              (item?.id === 11 ||
                item?.id === 12 ||
                item?.id === 13 ||
                item?.id === 14 ||
                item?.id === 15 ||
                item?.id === 18 ||
                item?.id === 17 ||
                item?.id === 20)
            ) {
              return null;
            } else if (
              userData?.personal_info?.role_slug === "super_admin" &&
              !selectedOrganization &&
              (item?.id === 3 ||
                item?.id === 7 ||
                item?.id === 10 ||
                item?.id === 16 ||
                item?.id === 17 ||
                item?.id === 19 ||
                item?.id === 20)
            ) {
              return null;
            } else {
              return (
                <Zoom
                  key={index}
                  in={true}
                  timeout={300}
                  style={{
                    transitionDelay: "200ms",
                  }}
                  unmountOnExit
                >
                  <Grid
                    item
                    xs={12}
                    sm={5.8}
                    md={5}
                    lg={3.5}
                    id={
                      item?.id === 14
                        ? "superAdmin"
                        : item?.id === 1
                        ? "organization"
                        : item?.id === 2
                        ? "client"
                        : item?.id === 3
                        ? "users"
                        : item?.id === 4
                        ? "roles"
                        : item?.id === 7
                        ? "providers"
                        : item?.id === 10
                        ? "patients"
                        : item?.id === 11
                        ? "email"
                        : item?.id === 12
                        ? "sms"
                        : item?.id === 18
                        ? "cms"
                        : item?.id === 13
                        ? "questions"
                        : item?.id === 15
                        ? "params"
                        : item?.id === 16
                        ? "userLogs"
                        : item?.id === 17
                        ? "requests"
                        : item?.id === 19
                        ? "sports"
                        : item?.id === 20
                        ? "reports"
                        : null
                    }
                  >
                    <Link
                      to={
                        item?.id === 1 && userType === "org_admin"
                          ? "/admin/organization?tab=edit"
                          : item?.location
                      }
                      style={{ textDecoration: "none", outline: "none" }}
                    >
                      <DashCard
                        arrow
                        title={item?.description}
                        value={item?.title}
                        icon={item.icon}
                      />
                    </Link>
                  </Grid>
                </Zoom>
              );
            }
          })
        )}
      </Grid>
    </Grid>
  );
}
