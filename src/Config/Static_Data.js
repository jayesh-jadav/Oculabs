import { color } from "./theme";
import Images from "./Images";
import Users from "../Components/CustomIcon/Admin/Users";
import Patients from "../Components/CustomIcon/Header/Patients";
import Organization from "../Components/CustomIcon/Global/Organization";
import SportsFootballOutlinedIcon from "@mui/icons-material/SportsFootballOutlined";
import AssessmentTwoToneIcon from "@mui/icons-material/AssessmentTwoTone";
// NOTE || WARNING : Any id change in adminCard array will affect intro tour array

export const adminCard = [
  {
    id: 14,
    icon: (
      <img
        src={Images.superAdmin}
        style={{ width: 35, height: 35 }}
        alt={"sp"}
      />
    ),
    title: "Super Admin",
    description: "Create, update, and delete Super Admin.",
    location: "/admin/super-admin",
  },
  {
    id: 1,
    icon: <Organization fill={color.primary} width={35} height={35} />,
    title: "Organization",
    description: "Edit Organization wide settings.",
    location: "/admin/organization",
  },
  {
    id: 2,
    icon: (
      <img
        src={Images.clientManagement}
        style={{ width: 45, height: 45 }}
        alt={"org"}
      />
    ),
    title: "Client Management",
    description: "Create, update, and delete Clients and Client information.",
    location: "/admin/organization",
  },
  {
    id: 3,
    icon: <Users fill={color.primary} width={45} height={45} />,
    title: "Users",
    description:
      "Create, update, and delete Users and User information. Import/export User list.",
    location: "/admin/users",
  },
  {
    id: 4,
    icon: (
      <img src={Images.roles} style={{ width: 35, height: 35 }} alt="role" />
    ),
    title: "Roles",
    description: "User permissions and data access.",
    location: "/admin/roles",
  },
  {
    id: 7,
    icon: (
      <img
        src={Images.providers}
        style={{ width: 35, height: 35 }}
        alt="provider"
      />
    ),
    title: "Providers",
    description:
      "Create, update, and delete Providers and Provider information.",
    location: "/admin/providers",
  },
  {
    id: 10,
    icon: <Patients fill={color.primary} width={45} height={45} />,
    title: "Patients",
    description:
      "Create, update, and delete Patients and Patient information. Import/export patient roster.",
    location: "/admin/patients",
  },
  {
    id: 11,
    icon: (
      <img
        src={Images.emailTemplates}
        style={{ width: 35, height: 35 }}
        alt="email"
      />
    ),
    title: "Email Templates",
    description: "Create, update, and delete email templates.",
    location: "/admin/email-templates",
  },
  {
    id: 12,
    icon: <img src={Images.SMS} style={{ width: 35, height: 35 }} alt="sms" />,
    title: "SMS Templates",
    description: "Create, update, and delete SMS templates.",
    location: "/admin/sms-templates",
  },
  {
    id: 18,
    icon: <img src={Images.CMS} style={{ width: 35, height: 35 }} alt="cms" />,
    title: "CMS Templates",
    description: "Create, update, and delete CMS templates.",
    location: "/admin/cms-templates",
  },
  {
    id: 13,
    icon: (
      <img src={Images.Questions} style={{ width: 35, height: 35 }} alt="que" />
    ),
    title: "Questions",
    description: "Update question text.",
    location: "/admin/master-question",
  },
  {
    id: 15,
    icon: (
      <img
        src={Images.SystemParameters}
        style={{ width: 30, height: 30 }}
        alt="params"
      />
    ),
    title: "System Parameters",
    description: "Create and update system Parameters.",
    location: "/admin/system-params",
  },
  {
    id: 16,
    icon: (
      <img src={Images.UserLogs} style={{ width: 35, height: 35 }} alt="logs" />
    ),
    title: "User Logs",
    description: "View User logs",
    location: "/admin/user-logs",
  },
  {
    id: 17,
    icon: (
      <img
        src={Images.RequestUser}
        style={{ width: 35, height: 35 }}
        alt="Requests"
      />
    ),
    title: "Requests",
    description: "View, Approve and Reject requests",
    location: "/admin/requests",
  },
  {
    id: 19,
    icon: (
      <SportsFootballOutlinedIcon
        style={{ color: color.primary, fontSize: 38 }}
      />
    ),
    title: "Sports",
    description: "Manage the list of sports for your organization",
    location: "/admin/sports",
  },
  {
    id: 20,
    icon: (
      <img
        src={Images.reporting}
        style={{ width: 35, height: 35 }}
        alt={"report"}
      />
    ),
    title: "Reports",
    description: "Manage reports",
    location: "/admin/reports",
  },
];

export const roleArr = [
  {
    id: 1,
    role_slug: "super_admin",
    name: "Super Admin",
  },
  {
    id: 2,
    role_slug: "org_admin",
    name: "Organization Admin",
  },
  {
    id: 3,
    role_slug: "ops_admin",
    name: "Operations Admin",
  },
  {
    id: 4,
    role_slug: "practitioner",
    name: "Practitioner",
  },
  {
    id: 5,
    role_slug: "assistant",
    name: "Assistant",
  },
  {
    id: 6,
    role_slug: "proctor",
    name: "Proctor",
  },
  {
    id: 7,
    role_slug: "patient",
    name: "Patient",
  },
];

export const permissionArr = [
  // {
  //   id: 5,
  //   title: "Ready to record diagnosis actions",
  //   key: "ready_to_record_diagnosis_module",
  // },
  {
    id: 1,
    title: "Ready to progress actions",
    key: "ready_to_progress_module",
  },
  {
    id: 2,
    title: "Not progressing actions",
    key: "not_progressing_module",
  },
  // {
  //   id: 3,
  //   title: "Need to review actions",
  //   key: "need_to_review_module",
  // },
  // {
  //   id: 4,
  //   title: "mTBI diagnosis",
  //   key: "mtbi_diagnosis",
  // },

  { id: 5, title: "Add New Patient", key: "patient_permission" },
  // { id: 6, title: "Manage Assessment Window", key: "assessment_window" },
  { id: 7, title: "Regulatory Data Management", key: "data_management" },
  {
    id: 8,
    title: "Review - Diagnose Patient",
    key: "diagnosis_module",
  },
  {
    id: 9,
    title: "Review - Event Actions",
    key: "review_action",
  },
];

export const sexArr = [
  {
    id: "1",
    name: "Male",
  },
  {
    id: "0",
    name: "Female",
  },
  {
    id: "2",
    name: "Intersex",
  },
];

export const genderArr = [
  {
    id: 1,
    name: "Male",
  },
  {
    id: 2,
    name: "Female",
  },
  {
    id: 3,
    name: "Other",
  },
];

export const pronounsArr = [
  { id: "1", name: "She/Her/Hers" },
  { id: "2", name: "He/Him/His" },
  { id: "3", name: "They/Them/Their" },
  { id: "4", name: "Ze/Zir/Zirs" },
  { id: "5", name: "Ze/Hir/Hirs" },
];

export const statusDropDown = [
  {
    id: 1,
    title: "Ready to Progress",
    key: "ready_to_progress",
  },
  {
    id: 2,
    title: "Not Progressing",
    key: "not_progressing",
  },
  {
    id: 3,
    title: "Review",
    key: "review",
  },
];

export const titleArr = ["Mr.", "Mrs.", "Dr.", "Ms.", "Mx."];

export const optionList = ["Yes", "No", "Undiagnosed"];

export const recoveryArr = [
  "7 to 10 days",
  "2 weeks to 1 month",
  "1 to 6 months",
  "greater than 6 months",
  "Still recovering",
];
export const preferenceArr = [
  {
    id: 1,
    label: "Morning",
    title: "Morning (6am - 11:59am)",
  },
  {
    id: 2,
    label: "Afternoon",
    title: "Afternoon (12pm - 5:59pm)",
  },
  {
    id: 2,
    label: "Night",
    title: "Night (6pm - 11:59pm)",
  },
];

export const symptomInventoryQ = [
  {
    id: 1,
    question: "Fixation Count",
    meta_key: "fix_aoi",
    answer: "value",
  },
  {
    id: 2,
    question: "View Count",
    meta_key: "viewed",
    answer: "value",
  },
  {
    id: 3,
    question: "Fixation duration within AOI",
    meta_key: "fix_dur_aoi",
    answer: "value",
  },
  // extra
  {
    id: 4,
    question: "Fixations on screen",
    meta_key: "fix_screen",
    answer: "value",
  },
  {
    id: 5,
    question: "Total fixation duration (in sec) in AOI",
    meta_key: "total_fix_dur",
    answer: "value",
  },
  {
    id: 6,
    question: "Total fixation duration (in sec) on screen﻿",
    meta_key: "fix_dur_screen",
    answer: "value",
  },
  {
    id: 7,
    question: "Screen duration (in sec)",
    meta_key: "dur_screen",
    answer: "value",
  },
  {
    id: 8,
    question: "Number of revisits",
    meta_key: "page_revisit",
    answer: "value",
  },
  {
    id: 9,
    question: "Initial question score",
    meta_key: "initial_score",
    answer: "value",
  },
  {
    id: 10,
    question: "Number of score changes",
    meta_key: "score_chng",
    answer: "value",
  },
  {
    id: 11,
    question: "Final Question Score",
    meta_key: "final_score",
    answer: "value",
  },
  {
    id: 12,
    question: "Time to first fixation",
    meta_key: "time_first_fixation",
    answer: "value",
  },
];

export const eyeTrackingQuestion = [
  "fix_aoi",
  "viewed",
  "fix_dur_aoi",
  "fix_screen",
  "total_fix_dur",
  "fix_dur_screen",
  "time_first_fixation",
];

export const reasonToClose = [
  "Recovered and Returned to Activity",
  "Recovered but not Returned to Activity",
  "Lost to Follow Up",
  "Provider Referral",
  "Other",
];

export const referral = [
  "Visual Specialist",
  "Vestibular Specialist",
  "Occupational Therapist",
  "Cognitive/Behavioral Therapist",
  "Other",
];

export const RTAProgressLabelArr = [
  {
    text: "Relative Rest",
  },
  {
    text: "Symptom Limited",
  },
  {
    text: "Light Activity",
  },
  {
    text: "Moderate Activity",
  },
  {
    text: "Intense Activity",
  },
  {
    text: "RTA",
    color: color.primary,
  },
];
export const progressColor = [
  color.blue900,
  color.blue700,
  color.blue600,
  color.blue500,
  color.blue400,
  color.black400,
];

export const dashboardSteps = [
  {
    id: 1,
    element: "#dashboard",
    title: "Dashboard",
    intro:
      "After a patient completes an assessment they will be placed into one of the below categories for your review and action. ",
  },
  {
    id: 2,
    element: "#patient",
    title: "Patient",
    intro:
      "Comprehensive view of your patients, with enhanced filtering capabilities. ",
  },
  {
    id: 3,
    element: "#calendar",
    title: "Calendar",
    intro:
      "View patient assessments and estimated return to activity dates, with enhanced filtering capabilities. ",
  },
  {
    id: 4,
    element: "#admin",
    title: "Admin",
    intro:
      "Manage patients, users, roles, and access to meet your organizational needs.",
  },
  {
    id: 5,
    element: "#progress",
    title: "Ready to Progress",
    intro:
      "This is where you can view patients who are ready to progress to the next stage of their assessment.",
  },
  {
    id: 6,
    element: "#noProgress",
    title: "Not Progressing",
    intro:
      "This is where you can view patients who are not progressing to the next stage of their assessment.",
  },
  {
    id: 7,
    element: "#review",
    title: "Review",
    intro:
      "This is where you can review patients who need their profile and assessments reviewed.",
  },
  {
    id: 8,
    element: "#newPatient",
    title: "Add New Patient",
    intro: "Click here to add a new patient.",
  },
  {
    id: 9,
    element: "#newEvent",
    title: "Add New Event",
    intro: "Click here to add a new injury or baseline for a patient.",
  },
  {
    id: 10,
    element: "#sideCalender",
    title: "Calender",
    intro:
      "The calendar is where you can view when patients are required to complete their assessments.",
  },
  {
    id: 11,
    element: "#hamburger",
    title: "Hamburger",
    intro:
      "Clicking on this icon you will have an at-a-glance view of your calendar.",
  },
  {
    id: 12,
    element: "#searchIcon",
    title: "Search Patient",
    intro:
      "By clicking on this icon you can search your patients easily by name or phone number.",
  },
  {
    id: 13,
    element: "#addPatient",
    title: "Add Patient",
    intro:
      "By clicking on this icon you can add new patients to begin assessments. You will need to have their contact information as well as their DOB, provider name and additional personal information.",
  },
  {
    id: 14,
    element: "#hidePatientBar",
    title: "Hide Patient Bar",
    intro:
      "By clicking on this icon you can hide your patient list or expand your patient list.",
  },
];

export const patientSteps = [
  {
    id: 1,
    element: "#providerSelect",
    title: "Select a Provider",
    intro:
      "This is where you can filter patients by the provider they are seeing within your organization.",
  },
  {
    id: 2,
    element: "#eventSelect",
    title: "Select Event Type",
    intro:
      "This is where you can filter patients by event type: injury or baseline.",
  },
  {
    id: 3,
    element: "#assessmentSelect",
    title: "Assessment Types",
    intro:
      "This is where you can filter patients by different assessment types such as baseline, immediate post-injury, initial visit, and subsequent.",
  },
  {
    id: 4,
    element: "#search",
    title: "Search",
    intro:
      "This is where you can search patients by name, email, phone number, or GUID.",
  },
];

export const calenderSteps = [
  {
    id: 1,
    element: "#arrow",
    title: "Arrow Left & Right",
    intro: "This is where you can select the month you would like to view.",
  },
  {
    id: 2,
    element: "#providerSearch",
    title: "Search by Provider",
    intro: "This is where you can filter your calendar by provider.",
  },
  {
    id: 3,
    element: "#patientSearch",
    title: "Search by Patient Name",
    intro: "This is where you can filter your calendar by patient name.",
  },
  {
    id: 4,
    element: "#eventSearch",
    title: "Search by Event Type",
    intro:
      "This is where you can filter your calendar by event type: injury or baseline.",
  },
  {
    id: 5,
    element: "#assessmentSearch",
    title: "Search by Assessment Type",
    intro:
      "This is where you can filter your calendar by different assessment types such as baseline, immediate post-injury, initial visit, and subsequent.",
  },
  {
    id: 6,
    element: "#assessmentStatus",
    title: "Search by Assessment Status",
    intro:
      "This is where you can filter your calendar by assessment status, which includes complete, missing, and pending.",
  },
  {
    id: 7,
    element: "#RTAsearch",
    title: "Search by RTA Stage",
    intro:
      "This is where you can filter your calendar by RTA stage, such as light-moderate activity, return to activity, etc.",
  },
  {
    id: 8,
    element: "#mostRecent",
    title: "Search by RTA Stage",
    intro:
      "This is where you can filter your calendar by most recent event, such as open, closed, etc.",
  },
];

export const adminSteps = [
  {
    id: 14,
    element: "#superAdmin",
    title: "Super Admin",
    intro: "-",
  },
  {
    id: 1,
    element: "#organization",
    title: "Organization",
    intro:
      "This is where you can manage settings about your entire organization such as security and capability preferences.",
  },
  {
    id: 2,
    element: "#client",
    title: "Client Management",
    intro: "-",
  },
  {
    id: 3,
    element: "#users",
    title: "Users",
    intro:
      "This is where you can add, edit, and delete users both individually or in bulk via CSV upload.",
  },
  {
    id: 4,
    element: "#roles",
    title: "Roles",
    intro:
      "This is where you can edit certain capabilities for each role available in Oculabs.",
  },
  {
    id: 7,
    element: "#providers",
    title: "Providers",
    intro:
      "This is where you can add, edit, and delete providers both individually or in bulk via CSV upload.",
  },
  {
    id: 10,
    element: "#patients",
    title: "Patients",
    intro:
      "This is where you can add, edit, and delete patients both individually or in bulk via CSV upload.",
  },
  {
    id: 11,
    element: "#email",
    title: "Email Templates",
    intro:
      "This is where you can select and send already created email templates to your patients.",
  },
  {
    id: 12,
    element: "#sms",
    title: "SMS Templates",
    intro:
      "This is where you can select and send already created SMS templates to your patients.",
  },
  {
    id: 18,
    element: "#cms",
    title: "CMS Templates",
    intro: "-",
  },
  {
    id: 13,
    element: "#questions",
    title: "Master Questions",
    intro: "-",
  },
  {
    id: 15,
    element: "#params",
    title: "System Parameters",
    intro: "-",
  },

  {
    id: 16,
    element: "#userLogs",
    title: "User Logs",
    intro: "This is where you can search and filter user history.",
  },
  {
    id: 17,
    element: "#requests",
    title: "Patient Requests",
    intro: "This is where you can accept or reject new assessment requests.",
  },
  {
    id: 19,
    element: "#sports",
    title: "Sports",
    intro: "This is where you can add sports that may not be listed.",
  },
  {
    id: 20,
    element: "#reports",
    title: "Reports",
    intro: "This is where you can review patient reports.",
  },
];

export const staticProgressData = [
  {
    eRTA: "Apr 7",
    firstname: "Wonda",
    flag_key: {
      NEW_SYMPTOM: 5,
      SEVERE_SYMPTOM: 7,
      WORSE_SYMPTOM: 2,
    },
    lastname: "Smith",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=600",
    patient_id: 11,
    event_id: 21,
    rta_data: [
      {
        state_code: "1",
      },
      {
        state_code: "2",
      },
      {
        state_code: "3",
      },
      {
        state_code: "4",
      },
      {
        state_code: "5",
      },
      {
        state_code: "6",
      },
    ],
  },
  {
    firstname: "Brok",
    lastname: "Simmons",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/428333/pexels-photo-428333.jpeg?auto=compress&cs=tinysrgb&w=600",
    flag_key: {
      NEW_SYMPTOM: 2,
      SEVERE_SYMPTOM: 5,
      WORSE_SYMPTOM: 3,
    },
    eRTA: "Apr 1",
    patient_id: 12,
    event_id: 22,
    rta_data: [
      {
        state_code: "1",
      },
      {
        state_code: "3",
      },
      {
        state_code: "4",
      },
      {
        state_code: "6",
      },
    ],
  },
];

export const staticNotProgressingData = [
  {
    firstname: "Ryne",
    lastname: "Nore",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600",
    eRTA: "Mar 20",
    patient_id: 13,
    event_id: 23,
    flag_key: {
      NEW_SYMPTOM: 1,
      SEVERE_SYMPTOM: 4,
      WORSE_SYMPTOM: 2,
    },
    rta_data: [
      {
        state_code: "3",
      },
      {
        state_code: "4",
      },
      {
        state_code: "5",
      },
      {
        state_code: "6",
      },
    ],
  },
  {
    firstname: "Jenny",
    lastname: "Wilson",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
    eRTA: "Mar 30",
    patient_id: 14,
    event_id: 24,
    flag_key: {
      NEW_SYMPTOM: 1,
      SEVERE_SYMPTOM: 1,
      WORSE_SYMPTOM: 1,
    },
    rta_data: [
      {
        state_code: "1",
      },
      {
        state_code: "2",
      },
      {
        state_code: "3",
      },
    ],
  },
];

export const staticReviewData = [
  {
    firstname: "Mark",
    lastname: "Jones",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/819530/pexels-photo-819530.jpeg?auto=compress&cs=tinysrgb&w=600",
    eRTA: "Apr 5",
    patient_id: 11,
    event_id: 21,
    flag_type: ["CLINICAL"],
    rta_data: [
      {
        state_code: "1",
      },
      {
        state_code: "2",
      },
      {
        state_code: "5",
      },
      {
        state_code: "6",
      },
      {
        state_code: "4",
      },
    ],
  },
  {
    firstname: "Katie",
    lastname: "Nelson",
    middlename: "",
    profile_pic:
      "https://images.pexels.com/photos/247322/pexels-photo-247322.jpeg?auto=compress&cs=tinysrgb&w=600",
    eRTA: "Mar 28",
    patient_id: 12,
    flag_type: ["ERROR"],
    event_id: 22,
    rta_data: [
      {
        state_code: "2",
      },
      {
        state_code: "3",
      },
      {
        state_code: "4",
      },
      {
        state_code: "6",
      },
    ],
  },
];

export const static_state_code = [
  { state_code: "0", default_state_code: "1" },
  { state_code: "0", default_state_code: "2" },
  { state_code: "0", default_state_code: "3" },
  { state_code: "0", default_state_code: "4" },
  { state_code: "0", default_state_code: "5" },
  { state_code: "0", default_state_code: "6" },
];

export const ShortRTATitle = ["RR", "SL", "LT", "MOD", "INT", "RTA"];

export const RTAColor = {
  0: "#E9EAED",
  1: "#280D63",
  2: "#2C609B",
  3: " #5F93CE",
  4: "#03A990",
  5: "#35BAA6",
  6: "#97DCD1",
};

export const GraphColor = {
  0: "#E9EAED",
  1: "#BDD3EB",
  2: "#99BAE0",
  3: "#5F93CE",
  4: "#3778C2",
  5: "#2C609B",
  6: "#1C3E63",
};

export const seasonArr = [
  { id: "1", name: "Winter" },
  { id: "2", name: "Spring" },
  { id: "3", name: "Summer" },
  { id: "4", name: "Fall" },
];

export const medicineUnits = [
  { unit: "Kg", name: "Kilogram (Kg)" },
  { unit: "g", name: "gram (g)" },
  { unit: "mg", name: "milligram (mg)" },
  { unit: "mcg", name: "microgram (mcg)" },
  { unit: "L", name: "liter (L)" },
  { unit: "ml", name: "milliliter (ml)" },
  { unit: "cc", name: "cubic centimeter (cc)" },
  { unit: "mol", name: "mole (mol)" },
  { unit: "mmol", name: "milimole (mmol)" },
];

export const rescheduleData = [
  {
    label: "Window available after 24 hours",
    value: 1,
    description:
      "This option will keep your patient on the assessment window defined in [Providers name here]'s Provider settings while also maintaining the minimum 24-hour RTA stage stay requirement.",
  },
  {
    label: "Optimized window",
    value: 2,
    description:
      "This option will create a new assessment window for this patient only while also maintaining the minimum 24-hour RTA stage stay requirement. Please be advised that in order to maintain this assessment window each completed assessment will need to be reviewed by [assessment window end time here] on the weekdays marked as available in [Providers name here]'s settings.",
  },
  {
    label: "Soonest available window",
    value: 3,
    description:
      "This option will keep your patient on the assessment window defined in [Providers name here]'s Provider settings. WARNING this option breaks the minimum 24-hour RTA stage stay requirement, the patient will take their next assessment in [assessment window start time - current time, show difference in hours and minutes].",
  },
];

export const rtaDropdownArr = [
  {
    label: "Relative Rest",
    value: 1,
  },
  { label: "Symptom Limited Activity", value: 2 },
  { label: "Light Activity", value: 3 },
  { label: "Moderate Activity", value: 4 },
  { label: "Intense Activity", value: 5 },
  { label: "Return to Activity", value: 6 },
];

export const statusColor = [
  { status: "OPEN", color: color.primary },
  { status: "READY", color: color.yellow },
  { status: "PENDING", color: color.yellow },
  { status: "LATE", color: color.error },
  { status: "MISSED", color: color.persianRed },
  { status: "MISSED_DUE_TO_SCHEDULE", color: color.darkBerry },
  { status: "COMPLETE", color: color.green },
  { status: "NEEDS_REVIEW", color: color.lightPink },
  { status: "COMPLETE_LATE", color: color.chocolateBrown },
  { status: "COMPLETED_WITHIN_OAW", color: color.green },
  { status: "eRTA", color: color.grayishBlue },
];

export const statusText = {
  OPEN: "Upcoming",
  READY: "Ready",
  PENDING: "Ready",
  LATE: "Late",
  MISSED: "Missing",
  MISSED_DUE_TO_SCHEDULE: "Missed Due To Schedule",
  COMPLETE: "Complete",
  NEEDS_REVIEW: "Needs Review",
  COMPLETE_LATE: "Completed Late",
  COMPLETED_WITHIN_OAW: "Complete",
  eRTA: "eRTA",
};

export const logsType = [
  { id: 1, label: "Patient", value: "PATIENT" },
  { id: 2, label: "Event", value: "EVENT" },
  { id: 3, label: "Event RTA", value: "EVENT_RTA" },
  { id: 4, label: "Assessment", value: "ASSESSMENT" },
  { id: 5, label: "User", value: "USER" },
];

export const logsValue = {
  PATIENT: "Patient",
  EVENT: "Event",
  EVENT_RTA: "Event RTA",
  ASSESSMENT: "Assessment",
  USER: "User",
};

export const flagType = {
  CLINICAL: "Clinical",
  ERROR: "Error",
  REVIEW: "Review",
};

export const common = ["day", "year", "month", "week"];
export const grouping = [
  { label: "Daily", value: "day" },
  { label: "Weekly", value: "week" },
  { label: "Monthly", value: "month" },
  { label: "Quarterly", value: "quarter" },
  { label: "Yearly", value: "year" },
];
export const periodArr = [
  {
    label: "Today",
    value: "today",
  },
  {
    label: "Yesterday",
    value: "yesterday",
  },
  {
    label: "This week",
    value: "this_week",
  },
  {
    label: "Last week",
    value: "last_week",
  },
  {
    label: "This month",
    value: "this_month",
  },
  {
    label: "Last month",
    value: "last_month",
  },
  {
    label: "This quarter",
    value: "this_quarter",
  },
  {
    label: "Last quarter",
    value: "last_quarter",
  },
  {
    label: "This year",
    value: "this_year",
  },
  {
    label: "Last year",
    value: "last_year",
  },

  {
    label: "Custom date",
    value: "custom_date",
  },
];
export const monthName = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const quarterArr = ["Jan-Mar", "Apr-Jun", "Jul-Sep", "Oct-Dec"];
export const flagArr = ["clinical", "error", "review"];
