import { createTheme } from "@mui/material/styles";
import red from "@mui/material/colors/red";
import { isMobile, isTablet } from "react-device-detect";

export const color = {
  primary: "#3778C2", //report color
  secondary: "#96979A",
  white: "#FFFFFF", //report color
  black: "#000000",
  disable: "#00000061",
  green: "#03A990", // report color
  red: "#FF0000",
  persianRed: "#CE3932",
  error: "#ff1744",
  borderColor: "#E9EAED",
  lightBorder: "#EAEBF2",
  divider: "#0000001f",
  placeholder: "#9ca3af",
  shadow: "0px 4px 12px 0px rgba(199,199,199,0.79)",
  dashCardShadow: "0px 2px 8px 0px rgba(199,199,199,0.79)",
  chipShadow: "0px 0px 5px 0px rgba(199,199,199,0.79)",
  gray: "#6E6F71",
  textColor: "#3B3C3F",
  transparent: "#ffffff00",
  main: "#F4F7Fb",
  downColor: "#234D7C",
  lightOrange: "#F1886D",

  skyBlue: "#40B8E226",
  chipColor: "#F6F9FC",
  // bookmark color
  bookMarkRed: "#CE3932E5",
  bookMarkOrange: "#EE6A49",
  lightPink: "#D297CE", // report
  yellow: "#ffc600",
  grayishBlue: "#7a8a92",

  // graph color
  black400: "#E9EAED",
  blue400: "#99BAE0",
  blue500: "#5F93CE",
  blue600: "#3778C2",
  blue700: "#2C609B",
  blue900: "#1C3E63",

  // report chart color
  chocolateBrown: "#231e20",
  coralRed: "#ff613d",
  darkBerry: "#150734",
};

export const FontFamily = {
  Regular: "EuropaRegular !important",
  Bold: "EuropaBold !important",
};

const EuropaRegular = {
  fontFamily: FontFamily.Regular,
  fontStyle: "normal",
  fontDisplay: "swap",
  src: "url('../Assets/Fonts/Europa-Regular.ttf') format('ttf')",
};

let theme = createTheme();
// Create a theme instance.
theme = createTheme(theme, {
  MuiCssBaseline: {
    "@global": {
      "@font-face": [EuropaRegular],
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: `${color.primary}`,
    },
    secondary: {
      main: `${color.secondary}`,
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#FFFFFF",
    },
  },
  components: {
    MuiGrid: {
      styleOverrides: {
        container: {
          margin: "0px auto",
        },
        root: {
          maxWidth: "unset !important",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: "0px 3px 6px #00000052",
          fontFamily: `EuropaRegular !important`,
          textTransform: "none",
          padding: "6px 10px",
          fontSize: "14px",
          fontWeight: "500",
          // height: 40,
          minWidth: "unset",
          whiteSpace: "nowrap",
          borderRadius: "48px !important",
          "&:disabled": {
            color: "rgb(0 0 0 / 50%) !important",
          },
          "@media (max-width: 768px)": {
            fontSize: "12px !important",
            // minWidth: "unset !important",
            padding: "8px 10px",
          },
        },
        containedPrimary: {
          color: `${color.white}`,
          backgroundColor: color.primary,
          "&:hover": {
            backgroundColor: `none !important`,
            color: color.white,
          },
        },
        downLoad: {
          color: `${color.white}`,
          backgroundColor: color.downColor,
          "&:hover": {
            backgroundColor: `${color.downColor} !important`,
            color: color.white,
          },
        },
        outlinedPrimary: {
          border: `1px solid ${color.primary}`,
          padding: "5px 10px",
        },
        square: {
          color: `${color.primary}`,
          borderRadius: "12px !important",
          "&:hover": {
            backgroundColor: `none !important`,
          },
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular !important`,
          // "&.MuiPaginationItem-root": {
          //   "&.Mui-selected": {
          //     backgroundColor: `${color.white} !important`,
          //     borderColor: color.primary,
          //   },
          //   "&.Mui-disabled": {
          //     backgroundColor: "#BBBBBB",
          //   },
          // },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: color.primary,
          fontFamily: `EuropaRegular !important`,
          transition: "500ms",
          "&:hover": {
            backgroundColor: color.primary,
            color: color.white,
          },
          "@media (hover: none)": {
            "&:hover": {
              backgroundColor: "transparent",
              color: `${color.primary} !important`,
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular !important`,
          letterSpacing: "0.6px",
          color: color.textColor,
          overflow: "hidden",
          whiteSpace: "wrap",
          fontSize: 12,
          "@media (max-width: 768px)": {
            fontSize: 12,
          },
        },
        title: {
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "EuropaBold !important",
          "@media (max-width: 768px)": {
            fontSize: "18px !important",
          },
        },
        tableTitle: {
          fontWeight: "700 !important",
          fontFamily: "EuropaBold !important",
          fontSize: 16,
          "@media (max-width: 768px)": {
            fontSize: "14px !important",
          },
        },
        subTitle: {
          fontWeight: "700 !important",
          fontFamily: "EuropaBold !important",
          fontSize: 14,
          // "@media (max-width: 768px)": {
          //   fontSize: "12px !important",
          // },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        input: {
          fontFamily: "EuropaRegular !important",
          padding: "0px 0px 0px 5px",
          // height: 26,
          fontSize: 14,
          minHeight: "1.3375em !important",
          borderRadius: "12px !important",
          ":-webkit-autofill": {
            WebkitBoxShadow: "0 0 0 1000px white inset",
          },
        },
        root: {
          padding: isTablet ? 8 : "10px 14px",
          borderRadius: "12px !important",
          "&.Mui-focused": {
            border: "0px !important",
          },
          "& > textarea": {
            padding: 0,
            textSizeAdjust: "100%",
            paddingLeft: 2,
          },
        },
        notchedOutline: {
          borderColor: color.borderColor,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: 14, fontFamily: "EuropaRegular !important" },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          fontFamily: "EuropaRegular !important",
          fontSize: 14,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular !important`,
          color: color.black,
          minWidth: !isMobile && 200,
          padding: isTablet ? 8 : "8.6px 14px",
        },
        icon: {
          // position: "unset",
          transition: "500ms",
          marginRight: isTablet || isMobile ? 0 : 5,
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular !important`,
          backgroundColor: color.white,
          fontSize: "12px !important",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular`,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          fontFamily: `EuropaRegular`,
        },
      },
    },

    MuiCheckbox: {
      styleOverrides: {
        root: {
          padding: "0px 9px !important",
          borderRadius: "12px !important",
          color: color.primary,
          "&.Mui-disabled": {
            color: "rgba(52,86,123,0.5)",
          },
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          padding: "10px 20px",
          textTransform: "uppercase",
          fontWeight: "400",
          "@media (max-width: 768px)": {
            padding: "10px 20px",
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          background: color.primary,
          height: 1,
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          padding: "8px",
          maxHeight: "40vh",
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        separator: {
          color: color.primary,
          marginLeft: "12px",
          marginRight: "12px",
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          fontFamily: "EuropaRegular !important",
          wordWrap: "break-word",
          "& .MuiTypography-root": {
            fontSize: "0.875rem",
          },
          "& .MuiDataGrid-columnHeader": {
            "& .MuiDataGrid-iconButtonContainer": {
              visibility: "visible",
              width: "auto",
            },
            "& .MuiDataGrid-checkboxInput": {
              color: color.white,
            },
          },
          "& .MuiDataGrid-sortIcon": {
            opacity: "0.5 !important",
            color: color.white,
          },
          "& .MuiDataGrid-columnHeader--sorted": {
            "& .MuiDataGrid-sortIcon": {
              opacity: "1 !important",
              backgroundColor: "rgba(0,0,0,0.15)",
              borderRadius: 50,
              padding: 2,
            },
          },
          "& .MuiDataGrid-columnSeparator--sideRight": {
            visibility: "visible !important",
          },
        },
        columnHeaders: {
          backgroundColor: color.primary,
          fontWeight: "600",
          color: color.white,
          fontFamily: "EuropaRegular !important",
        },
        columnHeaderTitle: {
          fontWeight: "600",
          letterSpacing: "0.6px",
          fontFamily: "EuropaRegular !important",
          "@media (max-width: 768px)": {
            fontSize: "14px !important",
          },
        },
        cellContent: {
          cursor: "pointer",
          "@media (max-width: 768px)": {
            fontSize: "12px !important",
          },
        },
        cell: {
          padding: 10,
        },
        row: {
          cursor: "pointer",
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            border: `1px solid ${color.primary}`,
            background: color.primary,
            color: color.white,
          },
          "&.MuiPaginationItem-icon": {
            color: color.primary,
          },
          "&:hover": {
            transition: "500ms",
            backgroundColor: color.primary,
            color: color.white,
          },
        },
        previousNext: {
          color: color.primary,
          border: `1px solid ${color.primary}`,
          background: color.white,
        },
        outlined: {
          background: color.primary,
          border: `1px solid ${color.primary}`,
          color: color.white,
        },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontFamily: `EuropaRegular !important`,
          borderRadius: 4,
          padding: 8,
          [theme.breakpoints.down("sm")]: {
            maxWidth: 150,
          },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        root: {
          color: color.primary,
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: color.primary,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: "#B8B8B8",
          },
          "& .MuiSwitch-track": {
            backgroundColor: "#B8B8B8",
          },
          "& .MuiSwitch-switchBase": {
            color: "#A9A9A9",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontFamily: "EuropaRegular !important",
          border: `none`,
        },
        head: {
          fontFamily: "EuropaBold !important",
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: "EuropaBold !important",
          boxShadow: color.shadow,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: "EuropaRegular !important",
          fontSize: "14px",
          color: color.textColor,
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            padding: "2.5px 14px",
            fontSize: "14px !important",
            fontFamily: "EuropaRegular !important",
          },
        },
        popupIndicator: {
          color: `${color.gray} !important`,
          "&:hover": {
            backgroundColor: "white !important",
            color: `${color.gray} !important`,
          },
        },
        listbox: {
          padding: 8,
          "&::-webkit-scrollbar": {
            display: "none !important",
          },
        },
        option: {
          fontSize: "12px !important",
          fontFamily: "EuropaRegular !important",
          // color: "#3A5B7E",
        },
      },
    },
    MuiDateCalendar: {
      styleOverrides: {
        root: {
          minHeight: !isTablet && "358px !important",
        },
      },
    },
  },
});

export default theme;
