import { BrowserRouter as Router } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import _, { isArray, isEmpty } from "lodash";
import "./App.css";
import "./globleStyle.scss";
import authActions from "./Redux/reducers/auth/actions";
import useOnlineStatus from "@rehooks/online-status";
import {
  askForPermissionToReceiveNotifications,
  onMessageListener,
} from "./push-notification";

// Common Screen
import Offline from "./Screens/Offline/index";
import moment from "moment";

// Candidate Routes
import DrawerMenu from "./Navigation/DrawerMenu";
import LoginStack from "./Navigation/loginStack";
import { getApiData } from "./Utils/APIHelper";
import { Setting } from "./Utils/Setting";
import { toast } from "react-toastify";

function App() {
  const {
    userData,
    isOnline,
    isLogin,
    token,
    userType,
    useruuid,
    isRefreshToken,
    removeToken,
  } = useSelector((state) => state.auth);
  const ref_token = !_.isEmpty(userData)
    ? userData.refresh_token_expired_at
    : "";

  const accessToken = useSelector((state) => state.auth.token);
  let intervalId;

  const dispatch = useDispatch();
  const {
    setOnlineStatus,
    setIsLogin,
    setUserType,
    setUserOrg,
    setUserToken,
    setRefreshTokenExpired,
    setUserData,
    setPermissionData,
    setIsRefreshToken,
    clearAllData,
    setRemoveToken,
    setOnlinePatients,
  } = authActions;
  const onlineStatus = useOnlineStatus();
  const [statusData, setStatusData] = useState("active");

  useEffect(() => {
    const handleOrientationChange = () => {
      // Reload the window
      window.location.reload();
    };

    // Add event listener for orientation change
    window.addEventListener("orientationchange", handleOrientationChange);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      dispatch(setOnlinePatients([]));
      return ""; // For other browsers
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (_.isObject(userData) && !_.isEmpty(userData)) {
      dispatch(setIsLogin(true));
      dispatch(setUserType(userData?.personal_info?.role_slug));
      dispatch(setUserOrg(userData?.personal_info?.org_id));
    } else {
      dispatch(setIsLogin(false));
      dispatch(setUserType(""));
    }
  }, [userData, accessToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    intervalId = setInterval(() => {
      const todaysDate = moment().format();
      if (ref_token !== "" && !_.isUndefined(ref_token) && isLogin) {
        const current_tm = new Date(todaysDate);
        const expired_on = new Date(ref_token);
        if (current_tm > expired_on && !_.isEmpty(accessToken)) {
          if (isRefreshToken) {
            RefreshTokenApiCall();
          } else {
            removeTokenApi();
          }
        }
      }
    }, 5000); // 10 sec in milliseconds

    return () => clearInterval(intervalId);
  }, [isLogin, isRefreshToken, ref_token]);

  // onLine status set
  useEffect(() => {
    dispatch(setOnlineStatus(onlineStatus));
  }, [onlineStatus]);

  useEffect(() => {
    askForPermissionToReceiveNotifications();
    onMessageListener();
  }, []);

  useEffect(() => {
    if (userType && userType !== "super_admin" && isLogin) {
      getPermissionData();
    }
  }, [userType, isLogin]);

  // notification using socket
  useEffect(() => {
    dispatch({ type: "socket/notification" });
    dispatch({ type: "socket/userStatus" });
    dispatch({ type: "socket/connect" });

    return () => {
      dispatch({ type: "socket/disconnect" });
    };
  }, []);

  // this useEffect is used to display notification count in browser tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isLogin && userType !== "super_admin") {
        getStatus();
      }
      let nextAppState = document.hidden ? "background" : "active";
      if (isLogin && userType !== "super_admin") {
        if (nextAppState === "background") {
          dispatch({ type: "socket/disconnect" });
          appStatus(0);
        } else {
          appStatus(1);
        }
      }
    };
    handleVisibilityChange();
    // Listen for visibility change events
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (removeToken && isLogin) {
      removeTokenApi();
    }
  }, [removeToken]);

  // this function is used to post foreground or background status
  const appStatus = async (status) => {
    try {
      const resp = await getApiData(
        Setting.endpoints.appStatus,
        "POST",
        {
          status: status === 0 ? "inactive" : "active",
          id: userData.id,
          fcm_token: useruuid,
          platform: "web",
        },
        ""
      );

      if (resp?.status) {
        // console.log("Status post request success");
      } else {
        // console.log("Status post request failed");
      }
    } catch (error) {
      console.log("Error in appStatus", error);
    }
  };

  // this function is used to get foreground or background status
  const getStatus = async () => {
    try {
      const resp = await getApiData(Setting.endpoints.getStatus, "POST", {
        fcm_token: useruuid,
      });
      if (resp?.status) {
        setStatusData(resp?.data);
      } else {
        console.log("Status get request failed:", resp?.message);
      }
    } catch (error) {
      console.log("Error in getStatus", error);
    }
  };

  // this function is ued to refresh token
  async function RefreshTokenApiCall() {
    let endPoint = Setting.endpoints.refreshToken;

    try {
      const response = await getApiData(
        endPoint,
        "POST",
        { refreshToken: token },
        true
      );
      if (response?.status) {
        clearInterval(intervalId);
        dispatch(setUserToken(response?.data?.auth_token));
        dispatch(
          setRefreshTokenExpired(response?.data?.refresh_token_expired_at)
        );
        dispatch(setUserData(response?.data?.userData));
        dispatch(setIsRefreshToken(false));
      }
    } catch (error) {
      console.log("response ~ RefreshTokenApiCall ", error);
    }
  }

  // this function is used to get permission data
  async function getPermissionData() {
    try {
      const response = await getApiData(
        `${Setting.endpoints.permission}?role_slug=${userType}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          await dispatch(setPermissionData(response?.data));
        }
        // else {
        //   dispatch(setPermissionData({}));
        // }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error(error.toString());
      console.log("error =======>>>", error);
    }
  }

  async function removeTokenApi() {
    try {
      const response = await getApiData(Setting.endpoints.removeToken, "POST", {
        uuid: useruuid,
        tenant_id: userData?.personal_info?.tenant_id,
        role: userData?.personal_info?.role_slug,
      });

      if (response?.status) {
        dispatch(setRemoveToken(false));
        await dispatch(clearAllData());
      } else {
        toast.error(response?.message);
      }
    } catch (err) {
      toast.error(err.toString());
      console.log("🚀 ~ removeToken ~ err==========>>>>>>>>>>", err);
    }
  }

  return (
    <Router>
      {isOnline ? isLogin ? <DrawerMenu /> : <LoginStack /> : <Offline />}
    </Router>
  );
}

export default App;
