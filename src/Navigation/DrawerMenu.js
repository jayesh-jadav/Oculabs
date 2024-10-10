import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Header from "../Components/Header";
import { styled } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import theme, { color } from "../Config/theme";
import NavigationStack from "./NavigationStack";
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  ListItemButton,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  Zoom,
} from "@mui/material";
import { isArray, isEmpty } from "lodash";
import styles from "./styles";
import "./styles.css";
import { useDispatch, useSelector } from "react-redux";
import { isBrowser, isMobile, isTablet } from "react-device-detect";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationPopup from "../Components/NotificationPopUp";
import authActions from "../Redux/reducers/auth/actions";
import AddPatient from "../Components/Modal/AddPatient";
import { getApiData } from "../Utils/APIHelper";
import { Setting } from "../Utils/Setting";
import { toast } from "react-toastify";
import { EncDctFn } from "../Utils/EncDctFn";
import Search from "../Components/CustomIcon/Global/Search";
import Calendar from "../Components/CustomIcon/Header/Calendar";
import Admin from "../Components/CustomIcon/Header/Admin";
import Home from "../Components/CustomIcon/Header/Home";
import DrawerIcon from "../Components/CustomIcon/Drawer";
import Info from "../Components/CustomIcon/Global/Info";
import AddPatientIcon from "../Components/CustomIcon/Drawer/AddPatients";
import Patients from "../Components/CustomIcon/Header/Patients";
import introJs from "intro.js";
import "intro.js/introjs.css";
import "../Components/IntroTrour/index.css";
import {
  adminSteps,
  calenderSteps,
  dashboardSteps,
  patientSteps,
} from "../Config/Static_Data";
import { hasPermission, stringAvatar } from "../Utils/CommonFunctions";
import PatientHistory from "../Components/Modal/PatientHistory";

const drawerWidth = isTablet ? 350 : 250;
const Drawer = styled(
  MuiDrawer,
  {}
)(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    backgroundColor: color.white,
    whiteSpace: "nowrap",
    width: open ? drawerWidth : 60,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
    position: "relative",
    top: isTablet ? 0 : 5,
    [theme.breakpoints.down("md")]: {
      top: 0,
    },
    "@media (max-device-width: 768px)": {
      position: "default",
      top: 0,
    },
  },
}));

function DrawerMenu() {
  const className = styles();
  const {
    userData,
    isToggleDrawer,
    isActivePatient,
    isDrawerList,
    oldUserData,
    isNotify,
    permissionData,
    patientStatus,
    onlinePatients,
    hasIntro,
    isLogin,
    userType,
  } = useSelector((state) => state.auth);
  const {
    setToggleDrawer,
    setActivePatient,
    setNotificationCount,
    setPatientStatus,
    setHasIntro,
  } = authActions;
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [bottomTabHeight, setBottomTabHeight] = useState(0);
  const ref = useRef();
  const introInstance = useRef(null);
  const isFirstRender = useRef(true);
  const [value, setValue] = useState("home");
  const [openTabDrawer, setOpenTabDrawer] = useState(false);
  const [drawerArr, setDrawerArr] = useState([]);
  const [updatedArr, setUpdatedArr] = useState([]);
  const [loader, setLoader] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [hover, setHover] = useState(false);
  const [hover1, setHover1] = useState(false);
  const [steps, setSteps] = useState([]);
  const [visible, setVisible] = useState(false);
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const [addPatientPerm, setAddPatientPerm] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [historyMOdal, setHistoryModal] = useState(false);
  const [onlinePatient, setOnlinePatient] = useState({});

  const isMounted = useRef(true);
  useEffect(() => {
    if (userType !== "super_admin") {
      onlinePatientList();
    }
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const element = document.getElementById("bottom");
    if (element) {
      const newHeight = element.offsetHeight;
      setBottomTabHeight(newHeight);
    }
  }, [isTablet, md]);

  useEffect(() => {
    if (
      userType === "org_admin" ||
      userType === "super_admin" ||
      userType === "ops_admin" ||
      userData?.personal_info?.is_provider === 1 ||
      hasPermission(permissionData, "patient_permission")
    ) {
      setAddPatientPerm(true);
    }
  }, [userType, userData, permissionData]);

  useEffect(() => {
    if (isEmpty(location?.search) && isLogin) {
      if (location?.pathname === "/home" && !isToggleDrawer) {
        dispatch(setToggleDrawer(true));
      }
      const step = determineSteps(
        dashboardSteps,
        patientSteps,
        calenderSteps,
        adminSteps
      );
      setSteps(step);
    }
  }, [userType, location, isLogin, addPatientPerm]);

  // This function is used to start the intro tour
  const startTour = () => {
    introInstance.current = introJs();
    introInstance.current.setOptions({
      showProgress: true,
      disableInteraction: true,
      steps: steps,
      exitOnOverlayClick: false,
      dontShowAgain: true,
      skipLabel: "Skip",
    });
    introInstance.current.onexit(() => {
      dispatch(setToggleDrawer(false));
      if (location?.pathname === "/home") {
        dispatch(setHasIntro("homeIntro", true));
      } else if (location?.pathname === "/patient") {
        dispatch(setHasIntro("patientIntro", true));
      } else if (location?.pathname === "/calendar") {
        dispatch(setHasIntro("calenderIntro", true));
      } else if (location?.pathname === "/admin") {
        dispatch(setHasIntro("adminIntro", true));
      }
    });
    introInstance.current.start();
  };
  // This function is used to stop the intro tour
  const stopTour = () => {
    if (introInstance.current) {
      introInstance.current.exit();
    }
  };

  // intro js onBoarding tour
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLogin) {
        const shouldStartTour =
          (location?.pathname === "/home" && hasIntro?.homeIntro) ||
          (location?.pathname === "/patient" && hasIntro?.patientIntro) ||
          (location?.pathname === "/calendar" && hasIntro?.calenderIntro) ||
          (location?.pathname === "/admin" && hasIntro?.adminIntro);

        if (shouldStartTour) {
          startTour();
        }
      }
    }, 1000);

    return () => {
      clearTimeout(timeout);
      stopTour(); // Clean up and stop the tour if the component unmounts
    };
  }, [steps, isLogin]);

  useEffect(() => {
    setHover(false);
  }, [isToggleDrawer]);

  useEffect(() => {
    if (userData?.personal_info?.role_slug !== "super_admin") {
      getNotificationData();
    }
  }, [isNotify]);

  useEffect(() => {
    if (location?.pathname === "/home") {
      setValue("home");
    } else if (location?.pathname.includes("/patient")) {
      setValue("patient");
    } else if (location?.pathname === "/calendar") {
      setValue("calendar");
    } else if (location?.pathname.includes("/admin")) {
      setValue("admin");
    } else setValue("");

    if (location?.pathname !== "/patient/details") {
      dispatch(setActivePatient(null));
    }
  }, [location]);

  useEffect(() => {
    if (userType !== "super_admin") {
      if (isFirstRender.current) {
        PatientListApi();
        isFirstRender.current = false;
      } else {
        const delayDebounceFn = setTimeout(() => {
          if (!isEmpty(searchFilter)) {
            getAccessPatients();
          } else {
            PatientListApi();
          }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
      }
    }
  }, [searchFilter]);

  useEffect(() => {
    if (isDrawerList && userType !== "super_admin") {
      PatientListApi(true);
    }
  }, [isDrawerList, userType]);

  useEffect(() => {
    setUpdatedArr(filterValueById(drawerArr, onlinePatients));
    dispatch(setPatientStatus(false));
  }, [patientStatus, onlinePatients, drawerArr]);

  const handleHeaderHeightChange = (e) => {
    if (isMounted.current) {
      setHeaderHeight(e);
    }
  };

  const handleHeaderClick = () => {
    if (isMounted.current) {
      setOpenTabDrawer(true);
    }
  };

  const determineSteps = (
    dashboardSteps,
    patientSteps,
    calenderSteps,
    adminSteps
  ) => {
    switch (location?.pathname) {
      case "/home":
        switch (userType) {
          case "proctor":
            return dashboardSteps?.filter((item) =>
              [1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(item?.id)
            );
          case "org_admin":
          case "ops_admin":
          case "practitioner":
          case "assistant":
            const allowedIds =
              isMobile || isTablet
                ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
                : dashboardSteps.map((item) => item.id);
            return dashboardSteps?.filter((item) =>
              allowedIds.includes(item?.id)
            );
          default:
            return dashboardSteps;
        }
      case "/patient":
        if (
          !["super_admin", "ops_admin", "org_admin"].includes(userType) &&
          +userData?.personal_info?.is_provider !== 1
        ) {
          return patientSteps?.filter((item) => ![1].includes(item?.id));
        } else {
          return patientSteps;
        }
      case "/calendar":
        if (+userData?.personal_info?.is_provider === 1) {
          return calenderSteps?.filter((item) => ![8].includes(item?.id));
        } else {
          return calenderSteps;
        }
      case "/admin":
        switch (userType) {
          case "org_admin":
            return adminSteps?.filter((item) =>
              [1, 3, 4, 7, 10, 11, 12, 16, 17, 19, 20].includes(item?.id)
            );
            break;
          case "ops_admin":
            return adminSteps?.filter((item) =>
              [3, 7, 10, 17, 20].includes(item?.id)
            );
            break;
          case "practitioner":
            return adminSteps?.filter((item) =>
              [7, 10, 17, 20].includes(item?.id)
            );
            break;
          case "assistant":
            return adminSteps?.filter((item) =>
              [10, 17, 20].includes(item?.id)
            );
            break;
          default:
            return [];
        }
      default:
        return [];
    }
  };

  // this function is used to set online status array in drawer array
  const filterValueById = (array1, array2) => {
    if (!isEmpty(array1)) {
      return array1.map((item1) => {
        if (!isEmpty(array2)) {
          const matchingItem = array2.find(
            (item2) => +item2.user_id === +item1.id
          );
          if (matchingItem) {
            return { ...item1, status: matchingItem.status };
          } else {
            return item1;
          }
        }
        return item1;
      });
    }
  };

  // this function is use for clear multiple click
  const handleClick = (item) => {
    // if (isDrawerList) {
    //   return null;
    // } else {
    if (+isActivePatient !== +item?.id) {
      dispatch(setActivePatient(item?.id));
      navigate(`/patient/details?patient_id=${EncDctFn(item?.id, "encrypt")}`, {
        state: { data: item },
        replace: true,
      });
    }
    // }
  };

  // display a patient profile
  const AvatarComponent = ({ item, online }) => {
    return (
      <Avatar
        src={item?.profile_pic}
        style={{
          border: online && `2px solid ${color.green}`,
        }}
        className={className.avatar}
        {...stringAvatar(`${item?.firstname} ${item?.lastname}`)}
      />
    );
  };

  // drawer list function
  function drawerList() {
    return (
      <Grid
        item
        xs={12}
        style={{
          padding: "10px 16px 30px 16px",
        }}
      >
        {loader ? (
          <Grid style={{ width: "100%", textAlign: "center" }}>
            <CircularProgress style={{ color: color.primary }} size={30} />
          </Grid>
        ) : !isEmpty(updatedArr) && isArray(updatedArr) ? (
          updatedArr?.map((item, index) => {
            const middlename = !isEmpty(item?.middlename)
              ? item?.middlename + " "
              : "";
            const fullName =
              item?.firstname + " " + middlename + item?.lastname;
            const active = isActivePatient == item?.id;
            let isOnline;
            if (item?.status === "online") {
              isOnline = true;
            } else if (item?.status === "offline") {
              isOnline = false;
            } else if (onlinePatient[`${item?.id}`]) {
              isOnline = true;
            } else {
              isOnline = false;
            }
            return (
              <Zoom
                key={`patient${index}`}
                in={true}
                timeout={300}
                style={{
                  transitionDelay: "200ms",
                }}
                unmountOnExit
              >
                <div
                  ref={ref}
                  onClick={() => {
                    handleClick(item);
                  }}
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      borderRight:
                        active && location?.pathname === "/patient/details"
                          ? `3px solid ${color.primary}`
                          : "",
                      position: "absolute",
                      top: 5,
                      right: isToggleDrawer ? 0 : -5,
                      height: 30,
                      borderRadius: 10,
                    }}
                  />
                  {isMobile || isTablet || md ? (
                    <ListItemButton
                      key={index}
                      onClick={() => setOpenTabDrawer(false)}
                      container
                      style={{
                        alignItems: "center",
                        justifyContent: "flex-start",
                        padding: "5px 0px",
                      }}
                      className={!active ? "listItemButton" : null}
                      wrap={"nowrap"}
                    >
                      <AvatarComponent item={item} online={isOnline} />

                      <Tooltip
                        title={
                          <span style={{ textTransform: "capitalize" }}>
                            {fullName}
                          </span>
                        }
                        arrow
                        placement="left"
                      >
                        <Typography
                          variant={active ? "subTitle" : "default"}
                          style={{
                            color: active && color.primary,
                          }}
                          className={active ? className.drawerListText : "text"}
                        >
                          {fullName}
                        </Typography>
                      </Tooltip>
                    </ListItemButton>
                  ) : isToggleDrawer ? (
                    <ListItemButton
                      key={index}
                      onClick={() => setOpenTabDrawer(false)}
                      style={{
                        alignItems: "center",
                        padding: "5px",
                        borderRadius: 6,
                      }}
                      className={!active ? "listItemButton" : null}
                      wrap={"nowrap"}
                    >
                      <AvatarComponent item={item} online={isOnline} />

                      <Typography
                        variant={
                          active && location?.pathname === "/patient/details"
                            ? "subTitle"
                            : "default"
                        }
                        style={{
                          color:
                            active &&
                            location?.pathname === "/patient/details" &&
                            color.primary,
                        }}
                        className={active ? className.drawerListText : "text"}
                      >
                        {fullName}
                      </Typography>
                    </ListItemButton>
                  ) : (
                    <Tooltip
                      title={
                        <span style={{ textTransform: "capitalize" }}>
                          {fullName}
                        </span>
                      }
                      arrow
                      placement="right"
                    >
                      <Grid
                        container
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "5px 0px",
                          cursor: "pointer",
                        }}
                        onClick={() => setOpenTabDrawer(false)}
                        wrap={"nowrap"}
                      >
                        <AvatarComponent item={item} online={isOnline} />
                      </Grid>
                    </Tooltip>
                  )}
                </div>
              </Zoom>
            );
          })
        ) : (
          <Typography textAlign={"center"} style={{ wordWrap: "break-word" }}>
            Recent patients shown here
          </Typography>
        )}
      </Grid>
    );
  }
  // this function is to create a search text input
  function searchTextField() {
    return (
      <TextField
        fullWidth
        placeholder="Search.."
        value={searchFilter}
        onChange={(e) => {
          let value = e.target.value;
          if (value.startsWith(" ")) {
            value = value.trimStart();
          }
          setSearchFilter(value);
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fill={color.primary} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <Tooltip title="Search by name & phone No." arrow>
                <div style={{ cursor: "pointer", lineHeight: 0 }}>
                  <Info fill={color.gray} />
                </div>
              </Tooltip>
            </InputAdornment>
          ),
        }}
      />
    );
  }

  //drawer list top search and user icon display
  function userList() {
    return (
      <Box
        className={className.patientList}
        onClick={() => dispatch(setToggleDrawer(true))}
      >
        <Grid
          item
          display={"flex"}
          flexDirection={"column"}
          alignItems={
            isTablet ? "right" : !md && !isToggleDrawer ? "center" : "right"
          }
        >
          <Grid
            item
            display={"flex"}
            justifyContent="space-between"
            alignItems={"center"}
            style={{ padding: "0px 16px" }}
          >
            {!md && !isTablet && !isToggleDrawer && (
              <IconButton
                style={{ padding: 6 }}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              >
                <Patients
                  fill={isBrowser && hover ? color.white : color.primary}
                  width={30}
                  height={30}
                />
              </IconButton>
            )}

            {(openTabDrawer || isToggleDrawer) && (
              <Typography
                variant="title"
                style={{ color: color.primary, marginRight: 5 }}
              >
                Patients
              </Typography>
            )}
            {(openTabDrawer || isToggleDrawer) &&
              (addPatientPerm ? (
                <Tooltip title="Add new patient" arrow>
                  <Button
                    id="addPatient"
                    variant="contained"
                    className={className.roundIcon}
                    onClick={() => setVisible(true)}
                  >
                    <AddPatientIcon fill={color.white} height={20} width={20} />
                  </Button>
                </Tooltip>
              ) : null)}
          </Grid>
          <Grid item style={{ marginTop: 10, padding: "0px 16px" }}>
            <Grid
              item
              xs={12}
              display={"flex"}
              flexWrap="nowrap"
              style={{ marginBottom: 5 }}
              id="searchIcon"
            >
              {isTablet || md || isToggleDrawer ? (
                searchTextField()
              ) : (
                <Button variant="square" sx={{ padding: "7px" }}>
                  <Search fill={color.primary} height={22} width={22} />
                </Button>
              )}
            </Grid>
          </Grid>
        </Grid>
        <Grid
          style={{
            height: isTablet || md ? "calc(100% - 80px)" : "calc(100% - 80px)",
          }}
          className={className.scrollBar}
        >
          {drawerList()}
        </Grid>
      </Box>
    );
  }

  //this function is used to get patient list
  async function getAccessPatients() {
    setLoader(true);

    try {
      const response = await getApiData(
        `${Setting.endpoints.patientList}?search=${searchFilter}`,
        "GET",
        {}
      );
      if (response?.status) {
        setDrawerArr(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    } finally {
      setLoader(false);
    }
  }

  // this function is used to get online patients
  async function onlinePatientList() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.getOnlinePatientList}`,
        "GET",
        {}
      );
      if (response?.status) {
        setOnlinePatient(response?.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  // get drawer list array
  async function PatientListApi(bool) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.getResentPatient}?search=${searchFilter}`,
        "GET",
        {}
      );
      if (response?.status) {
        setDrawerArr(response?.data);
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (error) {
      setLoader(false);
      console.log("er=====>>>>>", error);
      toast.error(error.toString());
    }
  }

  //this function is used to get notification data
  async function getNotificationData() {
    dispatch(setNotificationCount(null));
    try {
      const response = await getApiData(
        `${Setting.endpoints.getNotification}?page=${1}`,
        "GET",
        {}
      );
      if (response.status) {
        if (!isEmpty(response?.data)) {
          await dispatch(setNotificationCount(response?.data?.count));
        }
      }
    } catch (error) {
      console.log("error =======>>>", error);
    }
  }

  return (
    <>
      <Header
        headerHeight={handleHeaderHeightChange}
        handleClick={handleHeaderClick}
      />

      <Grid
        sx={{
          display: "flex",
          flex: 1,
          height: isTablet ? window.innerHeight : "100vh",
          paddingTop: `${headerHeight - 5}px`,
        }}
      >
        {!location.pathname.includes("/admin") &&
          location.pathname !== "/profile" &&
          userType !== "super_admin" && (
            <Drawer
              open={
                isTablet ? openTabDrawer : md ? openTabDrawer : isToggleDrawer
              }
              variant={isTablet ? "auto" : !md && "permanent"}
              onClose={() => {
                if (isTablet) {
                  setOpenTabDrawer(false);
                } else if (md) {
                  setOpenTabDrawer(false);
                } else {
                  dispatch(setToggleDrawer(false));
                }
              }}
            >
              {userList()}
              {isTablet
                ? null
                : !md && (
                    <Box
                      sx={{
                        marginTop: "auto",
                        display: "flex",
                        justifyContent: !isToggleDrawer ? "center" : "flex-end",
                        paddingRight: isToggleDrawer && "5px",
                        borderTop: `1px solid ${color.borderColor}`,
                        paddingTop: "5px",
                        paddingBottom: "10px",
                      }}
                    >
                      <IconButton
                        id="hidePatientBar"
                        onClick={() =>
                          dispatch(setToggleDrawer(!isToggleDrawer))
                        }
                        style={{
                          maxHeight: 40,
                          maxWidth: 40,
                          transform: !isToggleDrawer && "rotate(180deg)",
                        }}
                        onMouseEnter={() => setHover1(true)}
                        onMouseLeave={() => setHover1(false)}
                      >
                        <DrawerIcon
                          fill={
                            isBrowser && hover1 ? color.white : color.primary
                          }
                        />
                      </IconButton>
                    </Box>
                  )}
            </Drawer>
          )}
        <Grid
          item
          className={"mainContainer"}
          style={{
            backgroundColor: color.main,
            paddingBottom:
              (isTablet || md) && userType !== "super_admin"
                ? bottomTabHeight
                : null,
            marginTop: !isEmpty(oldUserData) && (isTablet || md ? 18 : 22),
          }}
          onClick={() => dispatch(setToggleDrawer(false))}
        >
          <NavigationStack />
        </Grid>
        {((isTablet && userType !== "super_admin") ||
          (md && userType !== "super_admin")) && (
          <BottomNavigation
            id="bottom"
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue);
            }}
            sx={{
              position: "fixed",
              bottom: 0,
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
              overflowX: "scroll",
              overflowY: "hidden",
              width: 1.0,
              boxShadow: color.shadow,
              zIndex: 1,
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Link
              id="dashboard"
              to="/home"
              replace
              style={{
                textDecoration: "none",
                outline: "none",
              }}
            >
              <BottomNavigationAction
                disableRipple={isTablet}
                icon={
                  <Home
                    fill={value === "home" ? color.primary : color.gray}
                    width={35}
                  />
                }
                value={"home"}
              />
            </Link>
            <Link
              id="patient"
              to="/patient"
              replace
              style={{
                textDecoration: "none",
                outline: "none",
              }}
            >
              <BottomNavigationAction
                disableRipple={isTablet}
                icon={
                  <Patients
                    fill={value === "patient" ? color.primary : color.gray}
                    height={25}
                    width={45}
                  />
                }
                value={"patient"}
              />
            </Link>
            <Link
              id="calendar"
              to="/calendar"
              replace
              style={{
                textDecoration: "none",
                outline: "none",
              }}
            >
              <BottomNavigationAction
                disableRipple={isTablet}
                icon={
                  <Calendar
                    fill={value === "calendar" ? color.primary : color.gray}
                    width={35}
                  />
                }
                value={"calendar"}
              />
            </Link>
            <Link
              id="admin"
              to="/admin"
              replace
              style={{
                textDecoration: "none",
                outline: "none",
              }}
            >
              {userType !== "proctor" && (
                <BottomNavigationAction
                  disableRipple={isTablet}
                  icon={
                    <Admin
                      fill={value === "admin" ? color.primary : color.gray}
                      width={35}
                    />
                  }
                  value={"admin"}
                />
              )}
            </Link>
          </BottomNavigation>
        )}
      </Grid>
      <NotificationPopup />
      <AddPatient
        visible={visible}
        from={"drawer"}
        handleModal={(e, pId) => {
          if (e === "close") {
            setVisible(false);
          }
          if (e === "success") {
            setPatientId(pId);
            setHistoryModal(true);
            setVisible(false);
          }
        }}
      />
      {/* patient history modal */}
      <PatientHistory
        visible={historyMOdal}
        patientId={patientId}
        handleModal={(e) => {
          if (e === "close") {
            setHistoryModal(false);
          } else if (e === "success") {
            navigate(
              `/patient/details?patient_id=${EncDctFn(patientId, "encrypt")}`
            );
            setHistoryModal(false);
          }
        }}
      />
    </>
  );
}

export default DrawerMenu;
