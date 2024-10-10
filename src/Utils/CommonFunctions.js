import _, { isArray, isEmpty, isNull } from "lodash";
import moment from "moment";
import { roleArr } from "../Config/Static_Data";
import { store } from "../Redux/store/configureStore";

export function isUserLogin() {
  const {
    auth: { userData },
  } = store.getState();

  if (_.isObject(userData) && !_.isEmpty(userData)) {
    return true;
  } else {
    return false;
  }
}

// remaining day count function
export function remainingDays(date, license) {
  const current_time = moment();
  const unix = Date.parse(date) / 1000;
  const given_time = moment(unix * 1000); // Assuming 'timeAgo' is in seconds
  const seconds = current_time.diff(given_time, "seconds");
  const minutes = current_time.diff(given_time, "minutes");
  const hours = current_time.diff(given_time, "hours");
  const days = current_time.diff(given_time, "days");
  const weeks = current_time.diff(given_time, "weeks");
  const months = current_time.diff(given_time, "months");
  const years = current_time.diff(given_time, "years");

  if (license) {
    if (seconds >= 60 || minutes >= 60) {
      return "Expired";
    } else if (Math.abs(hours) <= 24) {
      return "Will end today";
    } else if (Math.abs(days) <= 7) {
      if (Math.abs(days) === 1) {
        return "Will end today";
      } else {
        return `${Math.abs(days)} days ago`;
      }
    } else if (Math.abs(weeks) <= 4.3) {
      if (Math.abs(weeks) === 1) {
        return "1 week left";
      } else {
        return `${Math.abs(weeks)} weeks left`;
      }
    } else if (Math.abs(months) <= 12) {
      if (Math.abs(months) === 1) {
        return "1 month left";
      } else {
        return `${Math.abs(months)} months left`;
      }
    } else {
      if (Math.abs(years) === 1) {
        return "1 year left";
      } else {
        return `${Math.abs(years)} years left`;
      }
    }
  } else {
    if (seconds <= 60) {
      return "Just now";
    } else if (minutes <= 60) {
      if (minutes === 1) {
        return "a min ago";
      } else {
        return `${minutes} min ago`;
      }
    } else if (hours <= 24) {
      if (hours === 1) {
        return "a hour ago";
      } else {
        return `${hours} hours ago`;
      }
    } else if (days <= 7) {
      if (days === 1) {
        return "today";
      } else {
        return `${days} days ago`;
      }
    } else if (weeks <= 4.3) {
      if (weeks === 1) {
        return "a week ago";
      } else {
        return `${weeks} weeks ago`;
      }
    } else if (months <= 12) {
      if (months === 1) {
        return "a month ago";
      } else {
        return `${months} months ago`;
      }
    } else {
      if (years === 1) {
        return "a year ago";
      } else {
        return `${years} years ago`;
      }
    }
  }
}

// find role using role_slug
export function findRole(role_slug) {
  const role = roleArr?.map((item, index) => {
    if (item.role_slug === role_slug) {
      return item.name;
    }
  });
  return role;
}

// find role permission
export function hasPermission(permissionData, permission) {
  if (isArray(permissionData) && !isEmpty(permissionData)) {
    return permissionData.some((item) => item.permission === permission);
  }
  return false; // Return false if permissionData is not an array or is empty
}

export function capFn(string) {
  if (string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}

export function getTitle(data) {
  const state_code = Number(data?.state_code);
  const count = data?.count;

  switch (state_code) {
    case 1:
      return count > 1 ? "Relative Rest" : "RR";
    case 2:
      return count > 1 ? "Symptom Limited" : "SL";
    case 3:
      return count > 1 ? "Light Activity" : "LT";
    case 4:
      return count > 1 ? "Moderate Activity" : "MOD";
    case 5:
      return count > 1 ? "Intense Activity" : "INT";
    case 6:
      return count > 1 ? "Return to activity" : "RTA";
    default:
      return null;
  }
}

export default function generate52Weeks(type) {
  const weeks = [];
  let weekCount = 52;
  if (type === "this_month" || type === "last_month") {
    weekCount = 4;
  } else if (type === "this_quarter" || type === "last_quarter") {
    weekCount = 13;
  } else if (type === "this_week" || type === "last_week") {
    weekCount = 1;
  }
  for (let i = 1; i <= weekCount; i++) {
    weeks.push(`Week-${i}`);
  }
  return weeks;
}

export function safeJsonParse(jsonString) {
  if (typeof jsonString === "undefined" || jsonString === null) {
    return null;
  }
  const sanitizedJsonString = jsonString.replace(/undefined/g, "null");
  try {
    const parsedData = JSON.parse(sanitizedJsonString);
    return parsedData;
  } catch (error) {
    console.error("Error parsing JSON:", error.message);
    return null;
  }
}

export function stringToColor(string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}

export function stringAvatar(name) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name.split(" ")[0][0]}${name.split(" ")[1][0]}`,
  };
}

// this function is used to display date in system timezone
export function convertToIST(date) {
  // Check if dob is not null and not empty
  if (!isNull(date) && !isEmpty(date)) {
    // Convert date to a Date object
    const newDate = new Date(date);

    // Local timezone offset in milliseconds
    const localOffset = new Date().getTimezoneOffset() * 60000;

    // IST offset is UTC + 5:30 hours (19800000 ms)
    const ISTOffset = 19800000;

    // Adjust the time to IST
    const ISTTime = new Date(newDate.getTime() + localOffset + ISTOffset);

    return ISTTime;
  } else {
    return null; // Return null if dob is invalid
  }
}
