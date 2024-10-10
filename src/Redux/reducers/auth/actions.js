const actions = {
  SET_USER_DATA: "auth/SET_USER_DATA",
  SET_OLD_USER_DATA: "auth/SET_OLD_USER_DATA",
  ONLINE_STATUS: "auth/ONLINE_STATUS",
  LOGIN_STATUS: "auth/LOGIN_STATUS",
  USER_TOKEN: "auth/USER_TOKEN",
  USER_OLD_TOKEN: "auth/USER_OLD_TOKEN",
  CLEAR_ALL_STORAGE_DATA: "auth/CLEAR_ALL_STORAGE_DATA",
  SET_USER_UUID: "auth/SET_USER_UUID",
  SET_DISPLAY_NOTIFICATION_POP_UP: "auth/SET_DISPLAY_NOTIFICATION_POP_UP",
  SET_NOTI_DATA: "auth/SET_NOTI_DATA",
  SET_IS_SUPERADMIN: "auth/SET_IS_SUPERADMIN",
  SET_REFRESH_TOKEN_EXPIRED: "auth/SET_REFRESH_TOKEN_EXPIRED",
  SET_IS_REFRESH_TOKEN: "auh/SET_IS_REFRESH_TOKEN",
  SET_USERTYPE: "auth/SET_USERTYPE",
  SET_USER_ORG: "auth/SET_USER_ORG",
  SET_TOGGLEDRAWER: "auth/SET_TOGGLEDRAWER",
  SET_ACTIVEPATIENT: "auth/SET_ACTIVEPATIENT",
  SET_DRAWERLIST: "auth/SET_DRAWERLIST",
  SET_CHECKLIST: "auth/SET_CHECKLIST",
  CLEAR_CHECKLIST: "auth/CLEAR_CHECKLIST",
  SET_CAPTCHA: "auth/SET_CAPTCHA",
  SET_EVENT_ID: "auth/SET_EVENT_ID",
  SET_NOTIFICATION_COUNT: "auth/SET_NOTIFICATION_COUNT",
  SET_SELECTED_ORGANIZATION: "auth/SET_SELECTED_ORGANIZATION",
  SET_CHANGE_ORGANIZATION_STATUS: "auth/SET_CHANGE_ORGANIZATION_STATUS",
  PERMISSION_DATA: "auth/PERMISSION_DATA",
  ADMIN_LOADER: "auth/ADMIN_LOADER",
  SET_BACK_NOTI_COUNT: "auth/SET_BACK_NOTI_COUNT",
  SET_REALTIME_API_CALL: "auth/SET_REALTIME_API_CALL",
  SET_ONLINE_PATIENTS: "auth/SET_ONLINE_PATIENTS",
  SET_PATIENT_STATUS: "auth/SET_PATIENT_STATUS",
  SET_HAS_INTRO: "auth/SET_HAS_INTRO",
  SET_REMOVE_TOKEN: "auth/SET_REMOVE_TOKEN",
  SET_LOGIN_IMAGE: "auth/SET_LOGIN_IMAGE",
  SET_SOCKET_ID: "auth/SET_SOCKET_ID",
  SET_REF_DEMO_TIME: "auth/SET_REF_DEMO_TIME",
  SET_PLAYBACK_BUTTON: "auth/SET_PLAYBACK_BUTTON",

  setUserData: (userData) => (dispatch) =>
    dispatch({
      type: actions.SET_USER_DATA,
      userData,
    }),
  setOldUserData: (oldUserData) => (dispatch) =>
    dispatch({
      type: actions.SET_OLD_USER_DATA,
      oldUserData,
    }),
  setOnlineStatus: (isOnline) => (dispatch) =>
    dispatch({
      type: actions.ONLINE_STATUS,
      isOnline,
    }),

  setIsLogin: (isLogin) => (dispatch) =>
    dispatch({
      type: actions.LOGIN_STATUS,
      isLogin,
    }),

  setUserToken: (token) => (dispatch) =>
    dispatch({
      type: actions.USER_TOKEN,
      token,
    }),

  setOldUserToken: (oldToken) => (dispatch) =>
    dispatch({
      type: actions.USER_OLD_TOKEN,
      oldToken,
    }),

  setUserUUID: (useruuid) => (dispatch) =>
    dispatch({
      type: actions.SET_USER_UUID,
      useruuid,
    }),

  setNotiData: (notiData) => (dispatch) =>
    dispatch({
      type: actions.SET_NOTI_DATA,
      notiData,
    }),

  setNotificationCount: (notificationCount) => (dispatch) =>
    dispatch({
      type: actions.SET_NOTIFICATION_COUNT,
      notificationCount,
    }),

  displayNotificationPopUp: (isNotifiy) => (dispatch) =>
    dispatch({
      type: actions.SET_DISPLAY_NOTIFICATION_POP_UP,
      isNotifiy,
    }),

  clearAllData: () => (dispatch) =>
    dispatch({
      type: actions.CLEAR_ALL_STORAGE_DATA,
    }),

  setIsSuperAdmin: (isSuperAdmin) => (dispatch) =>
    dispatch({
      type: actions.SET_IS_SUPERADMIN,
      isSuperAdmin,
    }),

  setRefreshTokenExpired: (refreshTokenExpired) => (dispatch) =>
    dispatch({
      type: actions.SET_REFRESH_TOKEN_EXPIRED,
      refreshTokenExpired,
    }),
  setIsRefreshToken: (isRefreshToken) => (dispatch) =>
    dispatch({
      type: actions.SET_IS_REFRESH_TOKEN,
      isRefreshToken,
    }),

  setToggleDrawer: (isToggleDrawer) => (dispatch) => {
    dispatch({
      type: actions.SET_TOGGLEDRAWER,
      isToggleDrawer,
    });
  },
  setActivePatient: (isActivePatient) => (dispatch) => {
    dispatch({
      type: actions.SET_ACTIVEPATIENT,
      isActivePatient,
    });
  },
  setPermissionData: (permissionData) => (dispatch) =>
    dispatch({
      type: actions.PERMISSION_DATA,
      permissionData,
    }),
  setAdminLoader: (adminLoader) => (dispatch) =>
    dispatch({
      type: actions.ADMIN_LOADER,
      adminLoader,
    }),

  setUserType: (userType) => (dispatch) =>
    dispatch({ type: actions.SET_USERTYPE, userType }),

  setUserOrg: (userOrg) => (dispatch) =>
    dispatch({ type: actions.SET_USER_ORG, userOrg }),

  setDrawerList: (isDrawerList) => (dispatch) =>
    dispatch({ type: actions.SET_DRAWERLIST, isDrawerList }),

  setCheckList: (checkList, id) => (dispatch) =>
    dispatch({ type: actions.SET_CHECKLIST, checkList, id }),

  setCaptcha: (captcha) => (dispatch) =>
    dispatch({ type: actions.SET_CAPTCHA, captcha }),

  setEventID: (eventID) => (dispatch) => {
    dispatch({ type: actions.SET_EVENT_ID, eventID });
  },

  setSelectedOrganization: (selectedOrganization) => (dispatch) => {
    dispatch({ type: actions.SET_SELECTED_ORGANIZATION, selectedOrganization });
  },
  setChangeOrganizationStatus: (organizationStatus) => (dispatch) => {
    dispatch({
      type: actions.SET_CHANGE_ORGANIZATION_STATUS,
      organizationStatus,
    });
  },
  setBackNotiCount: (backNotiCount) => (dispatch) => {
    dispatch({ type: actions.SET_BACK_NOTI_COUNT, backNotiCount });
  },
  setRealTimeApiCall: (realTimeApiCall) => (dispatch) => {
    dispatch({ type: actions.SET_REALTIME_API_CALL, realTimeApiCall });
  },
  setOnlinePatients: (onlinePatients) => (dispatch) => {
    dispatch({ type: actions.SET_ONLINE_PATIENTS, onlinePatients });
  },
  setPatientStatus: (patientStatus) => (dispatch) => {
    dispatch({ type: actions.SET_PATIENT_STATUS, patientStatus });
  },
  setHasIntro: (key, value) => (dispatch) => {
    dispatch({ type: actions.SET_HAS_INTRO, payload: { key, value } });
  },
  setRemoveToken: (removeToken) => (dispatch) => {
    dispatch({ type: actions.SET_REMOVE_TOKEN, removeToken });
  },
  setLoginImage: (loginImage) => (dispatch) => {
    dispatch({ type: actions.SET_LOGIN_IMAGE, loginImage });
  },
  setSocketID: (socketID) => (dispatch) => {
    dispatch({ type: actions.SET_SOCKET_ID, socketID });
  },
  setRefDemoTime: (refDemoTime) => (dispatch) => {
    dispatch({ type: actions.SET_REF_DEMO_TIME, refDemoTime });
  },
  setPlayButton: (playButton) => (dispatch) => {
    dispatch({ type: actions.SET_PLAYBACK_BUTTON, playButton });
  },
  clearCheckList: () => (dispatch) =>
    dispatch({
      type: actions.CLEAR_CHECKLIST,
    }),
};

export default actions;
