import { Link, useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { isArray, isEmpty, isNull } from "lodash";
import {
  Alert,
  Avatar,
  Badge,
  Divider,
  Grid,
  IconButton,
  ListItemButton,
  MenuItem,
  Popover,
  Select,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import Images from "../../Config/Images";
import theme, { color } from "../../Config/theme";
import styles from "./styles";
import { KeyboardArrowDown } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import authActions from "../../Redux/reducers/auth/actions";
import ConfirmDialog from "../ConfirmDialog";
import { VscTools } from "react-icons/vsc";
import { MdOutlineCalendarMonth } from "react-icons/md";
import { HiOutlineUserGroup } from "react-icons/hi";
import { AiOutlineHome } from "react-icons/ai";
import FormatIndentDecreaseIcon from "@mui/icons-material/FormatIndentDecrease";
import { isBrowser, isTablet } from "react-device-detect";
import { roleArr } from "../../Config/Static_Data";
import { getApiData } from "../../Utils/APIHelper";
import { Setting } from "../../Utils/Setting";
import { toast } from "react-toastify";
import Home from "../CustomIcon/Header/Home";
import Calendar from "../CustomIcon/Header/Calendar";
import Admin from "../CustomIcon/Header/Admin";
import Notification from "../CustomIcon/Header/Notification";
import NotificationPop from "../Notification";
import styled from "@emotion/styled";
import { findRole, stringAvatar } from "../../Utils/CommonFunctions";
import Patients from "../CustomIcon/Header/Patients";

const headerMenu = [
  { id: 1, label: "Home", icon: <AiOutlineHome size={25} /> },
  { id: 2, label: "Patients", icon: <HiOutlineUserGroup size={25} /> },
  { id: 3, label: "Calendar", icon: <MdOutlineCalendarMonth size={25} /> },
  { id: 4, label: "Admin", icon: <VscTools size={25} /> },
];

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 7,
    top: 5,
    border: `2px solid ${color.white}`,
    padding: "0 2px",
  },
}));
function Header(props) {
  const {
    handleClick = () => null,
    headerHeight = () => null,
    from = "",
  } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    clearAllData,
    setUserData,
    setUserToken,
    setOldUserData,
    setOldUserToken,
    setDrawerList,
    setSelectedOrganization,
    setRefreshTokenExpired,
    setAdminLoader,
    setNotificationCount,
  } = authActions;
  const {
    userData,
    userType,
    oldToken,
    oldUserData,
    useruuid,
    notificationCount,
    selectedOrganization,
    organizationStatus,
  } = useSelector((state) => state.auth);
  const className = styles();
  const location = useLocation();
  const fName = userData?.personal_info?.firstname.split("");
  const lName = userData?.personal_info?.lastname.split("");
  const [orgList, setOrgList] = useState([]);
  const [organization, setOrganization] = useState(null);
  // media query state
  const md = useMediaQuery(theme.breakpoints.down("md"));

  const [value, setValue] = React.useState(0);
  const [userPop, setUserPop] = useState(null);
  const [roleName, setRoleName] = useState("");

  // confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [hover, setHover] = useState(false);

  const pop = Boolean(userPop);
  const id = pop ? "simple-popover" : undefined;

  // notification popover state
  const [notiPop, setNotiPop] = useState(null);
  const popN = Boolean(notiPop);
  const idN = popN ? "simple-popover" : undefined;

  // first name
  const firstName = !isEmpty(userData?.personal_info?.firstname)
    ? userData?.personal_info?.firstname
    : "";
  const lastName = !isEmpty(userData?.personal_info?.firstname)
    ? userData?.personal_info?.lastname
    : "";

  useLayoutEffect(() => {
    const element = document.getElementById("my");
    if (element) {
      const newHeight = element.offsetHeight;
      headerHeight(newHeight);
    }
  }, [isTablet, md]);

  useEffect(() => {
    if (location?.pathname === "/home") {
      setValue(0);
    } else if (
      location?.pathname === "/patient" ||
      location?.pathname === "/patient/details"
    ) {
      setValue(1);
    } else if (location?.pathname === "/calendar") {
      setValue(2);
    } else if (location?.pathname.includes("/admin")) {
      setValue(3);
    } else setValue(false);
  }, [location]);

  useEffect(() => {
    if (!isEmpty(roleArr) && isArray(roleArr)) {
      setRoleName(findRole(userType));
    }
  }, [userType]);

  useEffect(() => {
    if (userType === "super_admin") {
      orgListApi();
    }
  }, [organizationStatus, userType]);

  useEffect(() => {
    if (userType === "super_admin") {
      if (selectedOrganization) {
        setOrganization(selectedOrganization);
        changeOrganization(selectedOrganization);
      } else {
        changeOrganization();
      }
    }
  }, [selectedOrganization, userType]);

  function renderDashboardMenu() {
    return (
      <div className={className.headerSubCon}>
        <Tooltip title={"Notifications"} arrow>
          <IconButton
            className={className.menuCon}
            onClick={(e) => {
              setNotiPop(e.currentTarget);
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ maxWidth: 40, maxHeight: 40, padding: 5 }}
          >
            {notificationCount ? (
              <StyledBadge
                badgeContent={notificationCount}
                color="primary"
                style={{ padding: 2 }}
              >
                <Notification
                  fill={isBrowser && hover ? color?.white : color?.primary}
                />
              </StyledBadge>
            ) : (
              <Notification
                fill={isBrowser && hover ? color?.white : color?.primary}
              />
            )}
          </IconButton>
        </Tooltip>
      </div>
    );
  }

  function renderProfile() {
    return (
      <Grid style={{ padding: 10 }}>
        <Link
          style={{ textDecoration: "none", outline: "none" }}
          to={location.pathname !== "/profile" && "/profile"}
          onClick={() => setUserPop(null)}
        >
          <Grid item display={"flex"} alignItems={"center"}>
            <Avatar
              src={userData?.personal_info?.profile_pic}
              style={{
                width: 30,
                height: 30,
                fontSize: 14,
                textTransform: "capitalize",
              }}
              {...stringAvatar(`${fName} ${lName}`)}
            />
            <Grid item style={{ marginLeft: 20 }}>
              <Typography
                style={{ cursor: "pointer", textTransform: "capitalize" }}
              >
                {firstName + " " + lastName}
              </Typography>
              <Typography style={{ textTransform: "capitalize" }}>
                {roleName}
              </Typography>
            </Grid>
          </Grid>
        </Link>

        <div style={{ width: "100%", padding: "10px 0px" }}>
          <Divider />
        </div>
        <ListItemButton
          style={{ padding: 0 }}
          onClick={() => {
            setConfirmDialog(true);
            setUserPop(null);
          }}
        >
          <Grid item display={"flex"} alignItems={"center"}>
            <img src={Images.signOut} width={20} alt="logout" />
            <Typography style={{ cursor: "pointer", marginLeft: 10 }}>
              Logout
            </Typography>
          </Grid>
        </ListItemButton>
      </Grid>
    );
  }

  // this function is used to create a select organization
  function selectOrganization() {
    return (
      <Select
        displayEmpty
        disabled={
          userType !== "super_admin" || window.location.pathname !== "/admin"
        }
        IconComponent={KeyboardArrowDown}
        value={organization || ""}
        onChange={(v) => {
          dispatch(setSelectedOrganization(v.target.value));
          setOrganization(v.target.value);
        }}
        style={{ textTransform: "capitalize" }}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: "40vh",
              textTransform: "capitalize",
            },
          },
        }}
      >
        <MenuItem value={""} selected>
          Oculabs
        </MenuItem>
        {orgList.map((item, index) => {
          return (
            <MenuItem key={index} value={item?.id}>
              {item?.name}
            </MenuItem>
          );
        })}
      </Select>
    );
  }

  // this function is used for log out current login user
  async function logOutApi() {
    setBtnLoad(true);
    const data = {
      user_id: userData?.personal_info?.id,
      platform: "web",
      uuid: useruuid,
    };
    if (!isEmpty(oldUserData)) {
      data["type"] = "login_as_user";
      data["old_user_id"] = oldUserData?.personal_info?.id;
      data["role_slug"] = userType;
    }
    try {
      const response = await getApiData(Setting.endpoints.logOut, "POST", data);
      if (response?.status) {
        toast.success(response?.message);
        if (isEmpty(oldUserData) && isEmpty(oldToken)) {
          dispatch(clearAllData());
        } else {
          await dispatch(setNotificationCount(null));
          await dispatch(setUserToken(""));
          await dispatch(setUserData(""));
          await dispatch(setUserToken(oldToken));
          await dispatch(setUserData(oldUserData));
          await dispatch(setOldUserData(""));
          await dispatch(setOldUserToken(""));
          await dispatch(setDrawerList(false));
          if (oldUserData?.personal_info?.role_slug === "super_admin") {
            navigate("admin");
          } else {
            navigate("home");
          }
        }
        setConfirmDialog(false);
        dispatch({ type: "socket/disconnect" }); // disconnect socket
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (er) {
      setBtnLoad(false);
      toast.error(er.toString());
      console.log("🚀 ~ file: index.js:244 ~ logOutApi ~ er:", er);
    }
  }

  // this function is used to display organization list
  async function orgListApi() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.organizationList}?is_all=true`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setOrgList(response?.data);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  // this function is used to changed organization
  async function changeOrganization(id) {
    dispatch(setAdminLoader(true));
    try {
      const response = await getApiData(
        Setting.endpoints.changeOrganization,
        "POST",
        { tenant_id: id || null }
      );
      if (response?.status) {
        if (!isEmpty(response?.data)) {
          const dummy = await dispatch(setUserToken(""));
          if (isEmpty(dummy.token)) {
            await dispatch(setUserToken(response?.data?.auth_token));
            await dispatch(
              setRefreshTokenExpired(
                response?.data?.userData?.refresh_token_expired_at
              )
            );
          }
        }
      } else {
        toast.error(response.message);
      }
      dispatch(setAdminLoader(false));
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      dispatch(setAdminLoader(false));
    }
  }

  return (
    <>
      {isTablet || md ? (
        <div className={className.nav} id="my">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Grid item display={"flex"} alignItems={"center"}>
              {!location.pathname.includes("/admin") &&
                location.pathname !== "/profile" &&
                userType !== "super_admin" &&
                from !== "cms" && (
                  <IconButton onClick={() => handleClick()}>
                    <FormatIndentDecreaseIcon
                      style={{ transform: "rotate(180deg)" }}
                    />
                  </IconButton>
                )}
              <Link
                to={
                  userType !== "super_admin"
                    ? location.pathname !== "/home" && "/home"
                    : location.pathname !== "/admin" && "/admin"
                }
                style={{ textDecoration: "none", outline: "none" }}
              >
                <Grid
                  item
                  style={{
                    display: "flex",
                    width:
                      userType === "super_admin" || from === "cms" ? 150 : 75,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight:
                      userType !== "super_admin" &&
                      from !== "cms" &&
                      `1px solid ${color.borderColor}`,
                    cursor: "pointer",
                  }}
                >
                  <img
                    alt={"logo"}
                    src={
                      userType === "super_admin" || from === "cms"
                        ? Images.logo
                        : Images.smallLogo
                    }
                    style={
                      userType === "super_admin" || from === "cms"
                        ? {
                            width: 120,
                            padding: "10px 0px",
                            cursor: location.pathname !== "/admin" && "pointer",
                          }
                        : {
                            height: 35,
                            width: 35,
                            padding: "5px 0px",
                            cursor: location.pathname !== "/home" && "pointer",
                          }
                    }
                  />
                </Grid>
              </Link>
            </Grid>

            <Grid
              item
              display={"flex"}
              alignItems={"center"}
              style={{ paddingRight: 20 }}
              gap={2}
            >
              {userType !== "super_admin" ? (
                from === "cms" ? null : (
                  renderDashboardMenu()
                )
              ) : (
                <div style={{ padding: "5px 0px" }}>{selectOrganization()}</div>
              )}

              {from !== "cms" && (
                <Grid item display={"flex"} alignItems={"center"} gap={1}>
                  <IconButton
                    onClick={(e) => setUserPop(e.currentTarget)}
                    style={{
                      backgroundColor: color.transparent,
                      padding: 0,
                    }}
                  >
                    <Avatar
                      src={userData?.personal_info?.profile_pic}
                      style={{
                        width: 30,
                        height: 30,
                        fontSize: 14,
                        textTransform: "capitalize",
                      }}
                      {...stringAvatar(`${fName} ${lName}`)}
                    />
                  </IconButton>
                  <Grid
                    item
                    display={"flex"}
                    alignItems="center"
                    gap={1}
                    onClick={(e) => setUserPop(e.currentTarget)}
                    style={{
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    <Typography>
                      {userData?.personal_info?.firstname}
                    </Typography>
                    <ListItemButton style={{ padding: 0, borderRadius: "50%" }}>
                      <KeyboardArrowDown
                        style={{
                          transition: "500ms",
                          transform: !isNull(userPop) && "rotate(180deg)",
                        }}
                      />
                    </ListItemButton>
                  </Grid>
                  <Popover
                    onClose={() => setUserPop(null)}
                    anchorEl={userPop}
                    id={id}
                    open={pop}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "center",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    {renderProfile()}
                  </Popover>
                </Grid>
              )}
            </Grid>
          </div>
          {!isEmpty(oldUserData) && (
            <Alert
              variant="filled"
              icon={false}
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: color.bookMarkOrange,
                padding: 0,
                lineHeight: 0.6,
              }}
            >
              <Typography>
                {oldUserData?.personal_info?.firstname} have impersonate{" "}
                {userData?.personal_info?.firstname},{" "}
                <span
                  onClick={() => setConfirmDialog(true)}
                  className={className.logOutText}
                >
                  Logout ?
                </span>
              </Typography>
            </Alert>
          )}
        </div>
      ) : (
        <>
          <div className={className.nav} id={"my"}>
            <div style={{ display: "flex" }}>
              <Link
                to={
                  userType !== "super_admin"
                    ? location.pathname !== "/home" && "/home"
                    : location.pathname !== "/admin" && "/admin"
                }
                style={{ textDecoration: "none", outline: "none" }}
              >
                <Grid
                  item
                  style={{
                    display: "flex",
                    minWidth:
                      userType === "super_admin" || from === "cms" ? 185 : 72,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRight:
                      userType !== "super_admin" &&
                      from !== "cms" &&
                      `1px solid ${color.borderColor}`,
                    cursor:
                      userType !== "super_admin"
                        ? location.pathname !== "/home" && "pointer"
                        : location.pathname !== "/admin" && "pointer",
                  }}
                >
                  <img
                    alt={"logo"}
                    src={
                      userType === "super_admin" || from === "cms"
                        ? Images.logo
                        : Images.smallLogo
                    }
                    style={
                      userType === "super_admin" || from === "cms"
                        ? { width: 140, padding: "10px 0px" }
                        : {
                            height: 35,
                            width: 35,
                            padding: "5px 0px",
                          }
                    }
                  />
                </Grid>
              </Link>
              <Grid
                item
                container
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                wrap="nowrap"
              >
                {userType !== "super_admin" && from !== "cms" && (
                  <Tabs
                    variant="scrollable"
                    value={value}
                    onChange={(e, event) => setValue(event)}
                    aria-label="menu items"
                    indicatorColor={"primary"}
                    scrollButtons={false}
                    TabIndicatorProps={{
                      sx: {
                        height: "3px",
                        borderRadius: 10,
                      },
                    }}
                  >
                    {!isEmpty(headerMenu) &&
                      isArray(headerMenu) &&
                      headerMenu?.map((item, index) => {
                        if (
                          userData?.personal_info?.is_provider === 0 &&
                          userType === "proctor" &&
                          item?.id === 4
                        ) {
                          return null;
                        } else {
                          return (
                            <Link
                              id={
                                index === 0
                                  ? "dashboard"
                                  : index === 1
                                  ? "patient"
                                  : index === 2
                                  ? "calendar"
                                  : index === 3
                                  ? "admin"
                                  : null
                              }
                              key={index}
                              style={{
                                textDecoration: "none",
                                outline: "none",
                              }}
                              to={
                                index === 1
                                  ? "/patient"
                                  : index === 2
                                  ? "/calendar"
                                  : index === 3
                                  ? "/admin"
                                  : "/home"
                              }
                            >
                              <Tooltip arrow title={item?.label}>
                                <Tab
                                  icon={
                                    index === 0 ? (
                                      <Home
                                        fill={
                                          value === index
                                            ? color.primary
                                            : color.gray
                                        }
                                        width={35}
                                      />
                                    ) : index === 1 ? (
                                      <Patients
                                        fill={
                                          value === index
                                            ? color.primary
                                            : color.gray
                                        }
                                        width={40}
                                      />
                                    ) : index === 2 ? (
                                      <Calendar
                                        fill={
                                          value === index
                                            ? color.primary
                                            : color.gray
                                        }
                                        width={30}
                                      />
                                    ) : index === 3 ? (
                                      <Admin
                                        fill={
                                          value === index
                                            ? color.primary
                                            : color.gray
                                        }
                                        width={25}
                                      />
                                    ) : (
                                      item?.icon
                                    )
                                  }
                                  sx={{ color: color.black, minWidth: 50 }}
                                />
                              </Tooltip>
                            </Link>
                          );
                        }
                      })}
                  </Tabs>
                )}

                <Grid
                  item
                  display={"flex"}
                  alignItems={"center"}
                  style={{ paddingRight: 20, marginLeft: "auto" }}
                  gap={2}
                >
                  {userType !== "super_admin" ? (
                    from === "cms" ? null : (
                      renderDashboardMenu()
                    )
                  ) : (
                    <div style={{ padding: "5px 0px" }}>
                      {selectOrganization()}
                    </div>
                  )}

                  {from !== "cms" && (
                    <Grid item display={"flex"} alignItems={"center"} gap={1}>
                      <IconButton
                        onClick={(e) => setUserPop(e.currentTarget)}
                        style={{
                          backgroundColor: color.transparent,
                          padding: 0,
                        }}
                      >
                        <Avatar
                          src={userData?.personal_info?.profile_pic}
                          style={{
                            width: 30,
                            height: 30,
                            fontSize: 14,
                            textTransform: "capitalize",
                          }}
                          {...stringAvatar(`${fName} ${lName}`)}
                        />
                      </IconButton>
                      <Grid
                        item
                        display={"flex"}
                        alignItems="center"
                        gap={1}
                        onClick={(e) => setUserPop(e.currentTarget)}
                        style={{
                          cursor: "pointer",
                          textTransform: "capitalize",
                        }}
                      >
                        <Typography>
                          {userData?.personal_info?.firstname}
                        </Typography>
                        <ListItemButton
                          style={{ padding: 0, borderRadius: "50%" }}
                        >
                          <KeyboardArrowDown
                            style={{
                              transition: "500ms",
                              transform: !isNull(userPop) && "rotate(180deg)",
                            }}
                          />
                        </ListItemButton>
                      </Grid>
                      <Popover
                        onClose={() => setUserPop(null)}
                        anchorEl={userPop}
                        id={id}
                        open={pop}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "center",
                        }}
                        transformOrigin={{
                          vertical: "top",
                          horizontal: "left",
                        }}
                      >
                        {renderProfile()}
                      </Popover>
                    </Grid>
                  )}
                </Grid>
              </Grid>
            </div>
            {!isEmpty(oldUserData) && (
              <Alert
                variant="filled"
                icon={false}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: color.bookMarkOrange,
                  padding: 0,
                  lineHeight: 0.75,
                  whiteSpace: "nowrap",
                  marginLeft:
                    !location.pathname.includes("/profile") &&
                    !location.pathname.includes("/admin") &&
                    71,
                }}
              >
                {/* {oldUserData?.personal_info?.firstname} */}
                You are impersonating {userData?.personal_info?.firstname},{" "}
                <span
                  onClick={() => setConfirmDialog(true)}
                  className={className.logOutText}
                >
                  Logout ?
                </span>
              </Alert>
            )}
          </div>
        </>
      )}

      {/* logout confirm modal */}
      <ConfirmDialog
        title={`Are you sure you want to Log Out?`}
        visible={confirmDialog}
        btnLoad={btnLoad}
        handleModal={(bool) => {
          if (bool) {
            logOutApi();
          } else {
            setConfirmDialog(false);
          }
        }}
      />

      {/* notification list popover component */}
      <Popover
        id={idN}
        open={popN}
        anchorEl={notiPop}
        onClose={() => setNotiPop(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        PaperProps={{
          style: {
            borderRadius: 6,
            maxHeight: "100%",
            padding: 0,
          },
        }}
      >
        <NotificationPop
          handleClick={(type) => {
            if (type === "close") {
              setNotiPop(null);
            }
          }}
        />
      </Popover>
    </>
  );
}

Header.propTypes = {
  isCandidate: PropTypes.bool,
};

Header.defaultProps = {
  isCandidate: true,
};

export default Header;
