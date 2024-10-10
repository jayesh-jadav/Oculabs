const prod = process.env.NODE_ENV === "production";
const baseUrl = !prod
  ? "https://api.dev.oculabs.com"
  : "http://192.168.1.92:5000";

export const domain = prod ? window.location.host.split(".")[0] : "neptune";

export const Setting = {
  baseUrl,
  api: baseUrl + "/v1",
  socket_url: baseUrl,
  domain: domain != "superadmin" ? domain : "oculabs",

  // this captcha key Is working with @Ravi Id
  captchaKey: process.env.REACT_APP_CAPTCHA_KEY,
  // this tnymce key Is working with @Rvi Id
  tinymceKey: process.env.REACT_APP_TINY_MCE_KEY,
  fireBaseServerKey: process.env.REACT_APP_FIREBASE_SERVER_KEY,
  bugsnagKey: process.env.REACT_APP_BUGSNAG_KEY,

  JS_Regex: {
    email_Regex:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    pwd1_Regex: /^.{8,}$/, // /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    phone_Regex: /^(\+44\s?\d{10}|0044\s?\d{10}|0\s?\d{10})?$/,
    alphabatic_Regex: /^[a-zA-Z\s]*$/,
    currency_Regex: /^(?:0|[1-9]\d*)(?:\.(?!.*000)\d+)?$/,
    urlRegex: /^(?:\w+:)?\/\/([^\s\.]+\.\S{2}|localhost[\:?\d]*)\S*$/,
    numberRegex: /[^0-9]/g,
    tokenRegex: /^[A-Za-z0-9+/]{43}=$/,
  },

  endpoints: {
    //login
    login: "/user/login",
    generateOtp: "/user/generate-otp",
    verifyOtp: "/user/verify-otp",
    resetPassword: "/user/reset-password",
    changePassword: "/user/change-password",
    setPassword: "/user/set-password",
    forceChangePassword: "/user/force-change-password",
    refreshToken: "/user/refresh-token",
    checkResetTokenExpired: "/user/check-set-pass-token",

    //logout
    logOut: "/user/logout",

    //user
    addUser: "/user/add-user",
    userList: "/user/user-list",
    userData: "/user/get-data",
    deleteUser: "/user/delete-user",
    updateUser: "/user/update-user",
    changeUserStatus: "/user/change-status",
    sendUserChangePasswordLink: "/user/change-password-link",

    //superAdmin
    adminList: "/admin/list",
    addAdmin: "/admin/add",
    updateAdmin: "/admin/Update",
    loginAsUser: "/admin/login-as-user",
    getSingleAdminData: "/admin/get",
    changeOrganization: "/admin/change-organization",
    changeAdminStatus: "/admin/change-status",
    changePasswordLink: "/admin/change-password-link",

    // organization
    check: "/tenant/lookup",
    organization: "/tenant/create",
    organizationList: "/tenant/list",
    removeOrganization: "/tenant/delete",
    update: "/tenant/update",
    changeStatus: "/tenant/change-status",
    getOrgByID: "/tenant/get",
    createDemo: "/tenant/create-demo",

    //provider
    providerCreate: "/provider/create",
    providerUpdate: "/provider/update",
    providerList: "/provider/provider-list",
    providers: "/provider/list",
    changeProviderStatus: "/provider/change-status",
    getWorkingTime: "/provider/get-working-time",
    saveWorkingTime: "/provider/save-working-time",
    patients: "/provider/patients",
    saveData: "/provider/save-data-access",
    viewSelectedPatient: "/provider/view-selected-patient",
    changeProviderOfPatients: "/provider/change-provider-of-patients",
    patientList: "/provider/access-patients-list",

    // provider calender
    addHoliday: "/provider/add-holiday",
    removeHoliday: "/provider/remove-holiday",

    //patient
    createPatient: "/patient/create",
    updatePatient: "/patient/update",
    list: "/patient/list",
    changePatientStatus: "/patient/change-status",
    getPatient: "/patient/get-patient",
    patientMedicalHistory: "/patient/list-history",
    addRecentPatient: "/patient/add-recent-patient",
    getResentPatient: "/patient/get-recent-patient",
    multiPatientDelete: "/patient/multi-delete-patient",
    checkOpenEvents: "/patient/check-open-events",
    getPatients: "/patient/get-patients",
    mergePatient: "/patient/merge-patient",
    savePatient: "/patient/save-history",
    exportPatientCSV: "/common/export-csv",
    purgeData: "/patient/purge-data",
    getOnlinePatientList: "/patient/get-online-patients",

    // patient questions
    patientQuestions: "/questions/list",
    updateQuestion: "/questions/update",
    questionById: "/questions/get-by-id",

    // profile update
    updateProfile: "/user/update-profile",

    // role customize
    roleCustomize: "/role/customize",
    rolePermission: "/role/permission",

    // upload csv
    uploadCSV: "/user/upload-csv",
    uploadPatientCSV: "/patient/upload-csv",
    uploadProviderCSV: "/provider/upload-csv",

    //Email templates
    getAll: "/emailTemplate/getAll",
    createEmailTemplate: "/emailTemplate/create",
    updateEmailTemplate: "/emailTemplate/update",
    deleteEmail: "/emailTemplate/delete",
    getEmail: "/emailTemplate/getOne",

    //sms templates
    getAllSms: "/smsTemplate/getAll",
    createSmsTemplate: "/smsTemplate/create",
    updateSmsTemplate: "/smsTemplate/update",
    deleteSms: "/smsTemplate/delete",
    getSms: "/smsTemplate/getOne",

    // cms template
    getAllCms: "/cms/get-list",
    createCmsTemplate: "/cms/create",
    getCmsById: "/cms/get-by-id",
    updateCms: "/cms/update",
    deleteCms: "/cms/delete-data",
    getCms: "/cms/get",

    //system parameters
    getAllParams: "/system_params/list",
    createParam: "/system_params/create",
    updateParam: "/system_params/update",
    deleteParam: "/system_params/delete",
    paramsById: "/system_params/get-by-id",

    //event
    createEvent: "/event/create-event",
    createIpi: "/event/create-ipi",
    createPtce: "/event/create-ptce",
    eventList: "/event/list",
    eventDetails: "/event/details",
    appInvitation: "/event/app-invitation",
    addRedFlagReason: "/event/add-redflag-reason",
    deleteEvent: "/event/delete-event",
    closeEvent: "/event/close-event-recored-outcome",
    reopenEvent: "/event/reopen-event",
    getEvent: "/event/get-event-by-id",
    updateEyeTracking: "/event/update-eye-tracking",
    updateAssmtTime: "/event/update-assmt-time",
    updateAppInvitation: "/event/update-app-invitation",
    exportEvent: "/event/export",

    // RTA stage
    progressingRTA: "/event/rta-stage-progressing",
    notProgressingRTA: "/event/rta-stage-not-progressing",
    rescheduleAssessment: "/assessment/reschedule",
    addRtaData: "/event/add-rta-data",
    updateRta: "/event/update-rta-data",

    //Assessment
    createTreatmentInfo: "/assessment/create-treatment-info",
    createSymptomInventory: "/assessment/create-symptom-inventory",
    createImmediateRecall: "/assessment/create-immediate-recall",
    createDigitRecall: "/assessment/create-digit-recall",
    assessmentDetails: "/assessment/get-details",
    addComment: "/assessment/add-comment",
    getProviderNotes: "/assessment/get-provider-notes",
    addProviderNote: "/assessment/save-provider-note",
    exportAssessment: "/assessment/export",

    // logs
    logsList: "/logs/get-list",
    flagLogs: "/event/flag-logs",

    // request
    showRequest: "/event/show-requests",
    approveReject: "/event/approve-request",
    reports: "/reports/spider-reports",

    // calender
    calender: "/calender/calender-info",

    // notification
    getNotification: "/notification/get-all",
    removeNotification: "/notification/remove",
    clearNotification: "/notification/remove-all",
    readNotification: "/notification/read-single",
    allReadNotification: "/notification/read-all",
    testNotification: "/common/test-notification",
    removeToken: "/notification/remove-token",

    // dashboard
    dashboardRTAData: "/event/dashboard",

    // common api
    permission: "/common/get",

    // status
    appStatus: "/common/check-app-status",
    getStatus: "/common/get-app-status",

    //sports
    getAllSports: "/sport/get-all",
    createSports: "/sport/create",
    updateSport: "/sport/update",
    getOneSport: "/sport/get-one",
    sportActiveList: "/sport/list",
    changeStatusSport: "/sport/change-status",
    clearEvent: "/event/clear",

    //Diagnose logs api
    updateDiagnose: "/event/update-diagnosis",

    // report
    getChartData: "/reports/get-chart",
  },
};
