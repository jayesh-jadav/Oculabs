import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { FilterAlt, KeyboardArrowDown } from "@mui/icons-material";
import { DataGrid } from "@mui/x-data-grid";
import theme, { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData, getAPIProgressData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isArray, isEmpty, isNull, isNumber, isObject } from "lodash";
import ProviderComponent from "../../../Components/ProviderComponent";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import { useDispatch, useSelector } from "react-redux";
import ClearIcon from "@mui/icons-material/Clear";
import AddPatientsForm from "../../../Components/Forms/AddPatients/index";
import Images from "../../../Config/Images";
import ConfirmDialog from "../../../Components/ConfirmDialog";
import CsvExistDataModal from "../../../Components/Modal/CsvExistDataModal";
import ChangedPasswordLink from "../../../Components/Modal/ChangedPasswordLink";
import MainLoader from "../../../Components/Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import authActions from "../../../Redux/reducers/auth/actions";
import Search from "../../../Components/CustomIcon/Global/Search";
import ImagePreview from "../../../Components/ImagePreview";
import MergePatient from "../../../Components/MergePatient";
import CModal from "../../../Components/Modal/CModal";
import CloseEventConfirm from "../../../Components/Modal/CloseEventConfirm";
import { CTypography } from "../../../Components/CTypography";
import { reasonToClose, referral } from "../../../Config/Static_Data";
import Info from "../../../Components/CustomIcon/Global/Info";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import Send from "../../../Components/CustomIcon/Global/Send";
import DataManagement from "../../../Components/CustomIcon/Patients/DataManagement";
import { hasPermission } from "../../../Utils/CommonFunctions";
import { isBrowser } from "react-device-detect";

const errorObj = {
  rejectErr: false,
  rejectMsg: "",
  reasonErr: false,
  reasonMsg: "",
  descriptionErr: false,
  descriptionMsg: "",
  refereErr: false,
  refereMsg: "",
  refereTxtErr: false,
  refereTxtMsg: "",
  refereReasonErr: false,
  refereReasonMsg: "",
  otherErr: false,
  otherMsg: "",
};

export default function Patients() {
  const { userType, userData, permissionData } = useSelector(
    (state) => state.auth
  );
  const classes = styles();
  const navigate = useNavigate();
  const { setDrawerList } = authActions;
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [loader, setLoader] = useState(false);
  const [provider, setProvider] = useState(
    searchParams.has("provider")
      ? Number(EncDctFn(searchParams.get("provider"), "decrypt"))
      : ""
  );
  const [newProvider, setNewProvider] = useState("");
  const [providersList, setProvidersList] = useState([]);
  const [switchLoader, setSwitchLoader] = useState(false);
  const [activeData, setActiveData] = useState("");

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [patientList, setPatientList] = useState([]);
  const [pageNo, setPageNo] = useState(
    searchParams.has("page")
      ? Number(EncDctFn(searchParams.get("page"), "decrypt"))
      : 1
  );
  const [searchFilter, setSearchFilter] = useState(
    searchParams.has("search")
      ? EncDctFn(searchParams.get("search"), "decrypt")
      : ""
  );

  const [editData, setEditData] = useState([]);

  // csv upload
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvConf, setCsvConf] = useState(false);
  const [uploader, setUploader] = useState(false);
  const [csvExistData, setCsvExistData] = useState([]);
  const [visible, setVisible] = useState(false);

  // send password link state
  const [sendPassVisible, setSendPassVisible] = useState(false);
  const [sendHover, setSendHover] = useState(null);
  const [editHover, setEditHover] = useState(null);
  const [dataManageHover, setDataManageHover] = useState(null);

  const [openDataManage, setOpenDataManage] = useState({ open: false });
  const [loadDataManage, setLoadDataManage] = useState({
    download: false,
    export: false,
  });
  const [purgeBtlLoad, setPurgeBtnLoad] = useState(false);

  // datagrid checked item state
  const [checkedItem, setCheckedItem] = useState([]);

  // delete ConfirmDialog btn state
  const [deleteConf, setDeleteConf] = useState(false);
  const [btnLoad, setBtnLoad] = useState(false);
  const [deleteLoad, setDeleteLoad] = useState(false);

  // permission state
  const [permission, setPermission] = useState(false);
  const [changePass, setChangePass] = useState(false);

  //merge patient state
  const [merge, setMerge] = useState({
    openEvent: false,
    closeEvent: false,
    data: [],
  });

  //close event state
  const [errObj, setErrObj] = useState(errorObj);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [referredTo, setReferredTo] = useState("");
  const [referredText, setReferredText] = useState("");
  const [referredReason, setReferredReason] = useState("");
  const [other, setOther] = useState("");

  const timeoutRef = useRef(null);
  const [image, setImage] = useState("");

  const sm = useMediaQuery(theme.breakpoints.down("sm"));

  const column = [
    {
      field: "sr_no",
      headerName: "Sr. No.",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        const index = pageNo === 1 ? ind : (pageNo - 1) * 16 + ind;
        return <Typography>{index}</Typography>;
      },
    },
    {
      field: "user_photo",
      headerName: "Image",
      width: 80,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (params?.row?.is_active) {
          return (
            <Tooltip title={"View user information"} arrow placement="left">
              <IconButton
                style={{ padding: 0 }}
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.user_photo);
                  }, 150);
                }}
                onMouseUp={() => {
                  clearTimeout(timeoutRef.current);
                }}
                onClick={() => {
                  setEditData(params.row);
                  setSearchParams(
                    {
                      ...queryParams,
                      id: EncDctFn(params.row.id, "encrypt"),
                      tab: "patient_info",
                    },
                    { replace: true }
                  );
                }}
                sx={{
                  ":hover": {
                    backgroundColor: color.transparent,
                  },
                }}
              >
                <Avatar src={params?.row?.user_photo} />
              </IconButton>
            </Tooltip>
          );
        } else {
          return (
            <Tooltip title={"User is inactive"} arrow placement="left">
              <Avatar
                onMouseDown={() => {
                  timeoutRef.current = setTimeout(() => {
                    setImage(params?.row?.user_photo);
                  }, 150);
                }}
                onMouseUp={() => {
                  clearTimeout(timeoutRef.current);
                }}
                src={params?.row?.user_photo}
              />
            </Tooltip>
          );
        }
      },
    },
    {
      field: "id",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "global_unique_key",
      headerName: "GUID",
      width: 160,
      sortable: false,
    },

    {
      field: "firstname",
      headerName: "Name",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        const middlename = params?.row?.middlename
          ? params?.row?.middlename
          : "";
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {params?.row?.firstname +
              " " +
              middlename +
              " " +
              params?.row?.lastname || "-"}
          </Typography>
        );
      },
    },
    {
      field: "email",
      sortable: false,
      headerName: "Email",
      minWidth: 300,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.email || "-"}</Typography>;
      },
    },
    {
      field: "phone",
      headerName: "Phone No.",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        return <Typography>{params?.row?.phone || "-"}</Typography>;
      },
    },
    {
      field: "provider_firstname",
      headerName: "Provider",
      sortable: false,
      minWidth: 250,
      flex: 1,
      renderCell: (params) => {
        const title = params?.row?.provider_title;
        const firstname = params?.row?.provider_firstname || "";
        const lastname = params?.row?.provider_lastname || "";
        const credentials = params?.row?.provider_credentials;
        const fullName =
          (isNull(credentials) ||
          (isEmpty(credentials) && (!isNull(title) || !isEmpty(title)))
            ? title
            : "") +
          " " +
          firstname +
          " " +
          lastname +
          " " +
          (!isNull(credentials) || !isEmpty(credentials) ? credentials : "");
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {!isEmpty(fullName) ? fullName : "-"}
          </Typography>
        );
      },
    },
    {
      field: "is_active",
      headerName: "Status",
      minWidth: 100,
      sortable: false,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => {
        return !isEmpty(activeData) &&
          activeData?.id === params?.row?.id &&
          switchLoader ? (
          <CircularProgress size={22} />
        ) : (
          <Switch
            checked={params?.row?.is_active === 1 ? true : false}
            onChange={() => {
              setActiveData(params?.row);
              changeStatusApi(params?.row?.id);
            }}
          />
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      width: 180,
      align: "center",
      sortable: false,
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <Grid item xs={12} display="flex" alignItems={"center"}>
            {(permission ||
              hasPermission(permissionData, "patient_permission")) && (
              <Tooltip title="Edit" arrow>
                <Link
                  to={`/admin/patients?id=${EncDctFn(
                    params?.row?.id,
                    "encrypt"
                  )}&tab=edit`}
                  replace
                >
                  <IconButton
                    onMouseEnter={() => setEditHover(params?.row?.id)}
                    onMouseLeave={() => setEditHover(null)}
                    style={{ height: 40, width: 40 }}
                  >
                    <Edit
                      fill={
                        isBrowser && editHover === params?.row?.id
                          ? color.white
                          : color.primary
                      }
                    />
                  </IconButton>
                </Link>
              </Tooltip>
            )}
            {(userType === "super_admin" ||
              userType === "org_admin" ||
              userType === "ops_admin") && (
              <Tooltip title="Send password reset instructions" arrow>
                <span>
                  <IconButton
                    disabled={params?.row?.is_active === 0}
                    onClick={() => {
                      setEditData(params?.row);
                      setSendPassVisible(true);
                    }}
                    style={{ height: 40, width: 40 }}
                    onMouseEnter={() => setSendHover(params?.row?.id)}
                    onMouseLeave={() => setSendHover(null)}
                  >
                    <Send
                      fill={
                        !params?.row?.is_active
                          ? color.placeholder
                          : isBrowser && sendHover === params?.row?.id
                          ? color.white
                          : color.primary
                      }
                    />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {userType === "super_admin" ||
            userType === "org_admin" ||
            hasPermission(permissionData, "data_management") ? (
              <Tooltip title="Regulatory Data Management" arrow>
                <span>
                  <IconButton
                    style={{ height: 40, width: 40 }}
                    onMouseEnter={() => setDataManageHover(params?.row?.id)}
                    onMouseLeave={() => setDataManageHover(null)}
                    onClick={() => {
                      setOpenDataManage({ open: true, data: params?.row });
                    }}
                  >
                    <DataManagement
                      fill={
                        !params?.row?.is_active
                          ? color.placeholder
                          : isBrowser && dataManageHover === params?.row?.id
                          ? color.white
                          : color.primary
                      }
                    />
                  </IconButton>
                </span>
              </Tooltip>
            ) : null}
          </Grid>
        );
      },
    },
  ];

  useEffect(() => {
    if (isEmpty(checkedItem)) {
      setNewProvider("");
    }
  }, [checkedItem]);

  useEffect(() => {
    searchParams.get("tab") !== "merge" && setCheckedItem([]);
    setEditHover(null);
    setSendHover(null);
  }, [provider, changeTab]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!isEmpty(searchFilter)) {
        setPageNo(1);
        setSearchParams(
          { ...queryParams, page: EncDctFn(1, "encrypt") },
          { replace: true }
        );
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            search: EncDctFn(searchFilter, "encrypt"),
          },
          { replace: true }
        );
      } else {
        setPageNo(1);
        setSearchParams(
          { ...queryParams, page: EncDctFn(1, "encrypt") },
          { replace: true }
        );
        delete queryParams.search;
        setSearchParams({ ...queryParams }, { replace: true });
      }
    }, 500);
    // Cleanup the timeout to avoid unnecessary API calls
    return () => clearTimeout(delayDebounceFn);
  }, [searchFilter]);

  useEffect(() => {
    if (
      userType === "super_admin" ||
      userType === "ops_admin" ||
      userType === "org_admin" ||
      userData?.personal_info?.is_provider === 1
    ) {
      setPermission(true);
    }
    providersApi();
  }, []);

  useEffect(() => {
    if (searchParams.has("page")) {
      setPageNo(Number(EncDctFn(searchParams.get("page"), "decrypt")));
    }
    if (searchParams.has("search")) {
      setSearchFilter(EncDctFn(searchParams.get("search"), "decrypt"));
    }
    if (searchParams.has("provider")) {
      setProvider(Number(EncDctFn(searchParams.get("provider"), "decrypt")));
    }
    if (searchParams.has("tab")) {
      setChangeTab(searchParams.get("tab"));
    }
    patientListApi(false);
  }, [searchParams]);

  useEffect(() => {
    setUploader(false);
  }, [csvConf]);

  async function patientListApi(bool) {
    !bool && setLoader(true);
    searchParams.get("tab") !== "merge" && setCheckedItem([]);
    try {
      const response = await getApiData(
        `${Setting.endpoints.list}?page=${pageNo}&search=${
          searchFilter ? searchFilter : ""
        }&provider_id=${provider}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setPatientList(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
      setLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setLoader(false);
    }
  }

  async function providersApi() {
    setProvidersList([]);
    try {
      const response = await getApiData(
        `${Setting.endpoints.providers}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isArray(response?.data)) {
          setProvidersList(response?.data);
        }
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function changeProviderOfPatientsApi() {
    try {
      const response = await getApiData(
        Setting.endpoints.changeProviderOfPatients,
        "POST",
        {
          id: newProvider,
          patients: checkedItem,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        patientListApi(false);
        setCheckedItem(null);
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function changeStatusApi(id) {
    setSwitchLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changePatientStatus,
        "PATCH",
        {
          id: id,
        }
      );
      if (response?.status) {
        patientListApi(true);
        dispatch(setDrawerList(true));
      } else {
        toast.error(response?.message);
      }
      setSwitchLoader(false);
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
      setSwitchLoader(false);
    }
  }

  // this function is Used to delete a patient
  async function deletePatient() {
    setDeleteLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.multiPatientDelete,
        "POST",
        {
          patient_ids: checkedItem,
        }
      );
      if (response?.status) {
        toast.success(response?.message);
        setDeleteConf(false);
        patientListApi(true);
        dispatch(setDrawerList(true));
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setDeleteLoad(false);
    }
  }

  function clearData() {
    setSelectedFile(null);
  }

  // csv upload function
  async function uploadCSV(verify) {
    setUploader(true);
    if (selectedFile) {
      const params = {
        user_csv: selectedFile,
        is_verified: verify ? 1 : 0,
      };
      try {
        const response = await getAPIProgressData(
          Setting.endpoints.uploadPatientCSV,
          "POST",
          params,
          true
        );
        if (response?.status) {
          if (!isEmpty(response?.data)) {
            setCsvExistData(response?.data);
          }
          if (verify) {
            patientListApi(true);
            clearData();
          } else {
            setVisible(true);
          }
          toast.success(response?.message);
        } else {
          if (!isEmpty(response?.data)) {
            setCsvExistData(response?.data);
            setVisible(true);
          }
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error =======>>>", error);
        toast.error(error.message.toString());
      } finally {
        setUploader(false);
        setCsvConf(false);
        verify && setVisible(false);
      }
    }
  }

  async function checkOpenEventApi() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        Setting.endpoints.checkOpenEvents,
        "POST",
        { patient_ids: checkedItem }
      );

      if (response?.status) {
        if (!isEmpty(response?.data) && response?.data.length > 1) {
          setMerge({ ...merge, openEvent: true, data: response?.data });
        } else {
          setSearchParams({
            ...queryParams,
            tab: "merge",
          });
        }
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (err) {
      setBtnLoad(false);
      toast.error(err.toString());
      console.log(
        "🚀 ~ file: index.js:49 ~ getSelectedPatientApi ~ err======>>>>>>>",
        err
      );
    }
  }

  function validation() {
    let valid = true;
    let error = { ...errObj };

    if (!isNumber(reason)) {
      valid = false;
      error.reasonErr = true;
      error.reasonMsg = "";
    }
    if (reason === 1 && isEmpty(description)) {
      valid = false;
      error.descriptionErr = true;
      error.descriptionMsg = "Please enter description";
    }
    if (reason === 3 && isEmpty(referredTo)) {
      valid = false;
      error.refereErr = true;
      error.refereMsg = "Please select whom to refere";
    }
    if (referredTo === "Other" && isEmpty(referredText)) {
      valid = false;
      error.refereTxtErr = true;
      error.refereTxtMsg = "Please enter whom to refere";
    }
    if (reason === 3 && isEmpty(referredReason)) {
      valid = false;
      error.refereReasonErr = true;
      error.refereReasonMsg = "Please enter reason for referral";
    }
    if (reason === 4 && isEmpty(other)) {
      valid = false;
      error.otherErr = true;
      error.otherMsg = "Please enter patient's outcome";
    }

    setErrObj(error);
    if (valid) {
      closeEvent();
    }
  }

  async function closeEvent() {
    setBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.closeEvent}?`,
        "POST",
        {
          event_id: merge?.eId,
          patient_id: merge?.pId,
          RRA: reason === 0 ? 1 : 0,
          RNRA: description || null,
          lost_follow_up: reason === 2 ? 1 : 0,
          provider_referral: referredTo === "Other" ? referredText : referredTo,
          referral_description: referredReason || null,
          other: other || null,
        }
      );
      if (response?.status) {
        checkOpenEventApi();
        toast.success(response.message);
        setMerge({ ...merge, closeEvent: false });
        clear();
      } else {
        toast.error(response?.message);
      }
      setBtnLoad(false);
    } catch (error) {
      setBtnLoad(false);
      console.log("error =======>>>", error);
      toast.error(error.toString());
    }
  }

  function clear() {
    setReason("");
    setDescription("");
    setReferredTo("");
    setReferredText("");
    setReferredReason("");
    setOther("");
  }

  // this function is used to download or export csv api integration
  async function exportCSV(data, type) {
    if (type === "download") {
      setLoadDataManage({ ...loadDataManage, download: true });
    } else {
      setLoadDataManage({ ...loadDataManage, export: true });
    }
    try {
      const response = await getApiData(
        `${Setting.endpoints.exportPatientCSV}?patient_id=${data?.id}&exportVia=${type}`,
        "GET",
        {}
      );
      if (response?.status) {
        if (type === "download") {
          downloadCsv(response?.data);
        } else {
          toast.success(response?.message);
        }
        setOpenDataManage({ open: false });
        setLoadDataManage({ export: false, download: false });
      } else {
        toast.error(response?.message);
      }
      setLoadDataManage({ export: false, download: false });
    } catch (er) {
      setLoadDataManage({ export: false, download: false });
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    }
  }

  async function purgeData(data) {
    setPurgeBtnLoad(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.purgeData}`,
        "POST",
        { patient_id: data?.id },
        true
      );
      if (response?.status) {
        toast.success(response?.message);
        patientListApi(true);
        setOpenDataManage({ open: false });
      } else {
        toast.error(response?.message);
      }
    } catch (er) {
      console.log("er=====>>>>>", er);
      toast.error(er.toString());
    } finally {
      setPurgeBtnLoad(false);
    }
  }
  // this function is used to download patient csv
  const downloadCsv = (data) => {
    // Create a Blob from the CSV data
    const blob = new Blob([data], { type: "text/csv" });

    // Create a download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger the click event to start the download
    link.click();

    // Remove the link from the DOM
    document.body.removeChild(link);
  };

  const downloadCSV = () => {
    const csvContent = `First Name,Middle Name,Last Name,Sex,Email,Phone number (xxx-xxx-xxxx),Gender,Date of Birth (MM-DD-YYYY),Provider's Email,Pronouns,Guardian's Email,Guardian's Phone(xxx-xxx-xxxx)
`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "Patient.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Grid className={classes.container}>
      {changeTab === "add" || changeTab === "edit" ? (
        <AddPatientsForm
          handleClick={(type) => {
            setChangeTab("");
            delete queryParams.tab;
            delete queryParams.id;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : changeTab === "patient_info" ? (
        <ProviderComponent
          handleClick={(type) => {
            setChangeTab("");
            delete queryParams.tab;
            delete queryParams.id;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : changeTab === "merge" ? (
        <MergePatient
          data={checkedItem}
          handleClick={(type) => {
            setChangeTab("");
            delete queryParams.tab;
            delete queryParams.id;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : (
        <div className={classes.gridContainer}>
          <Grid
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"space-between"}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <BackBtn handleClick={() => navigate(-1)} />
              <Typography variant="title" style={{ color: color.primary }}>
                Patients
              </Typography>
            </div>
            {(permission ||
              hasPermission(permissionData, "patient_permission")) && (
              <div>
                <Link to={"/admin/patients?tab=add"} replace>
                  <Tooltip title="Add patient" arrow>
                    <Button variant="contained" style={{ minWidth: 120 }}>
                      Add
                    </Button>
                  </Tooltip>
                </Link>
                {userType !== "super_admin" && (
                  <>
                    <Tooltip
                      title="If you open csv in excel, please save as csv to upload to oculabs"
                      arrow
                    >
                      <Button
                        variant="downLoad"
                        component="label"
                        style={{ minWidth: 120, marginLeft: 10 }}
                      >
                        <input
                          type="file"
                          onChange={(e) => {
                            setSelectedFile(e.target.files[0]);
                            setCsvConf(true);
                          }}
                          onClick={(event) => {
                            event.target.value = null;
                          }}
                          accept=".csv"
                          hidden
                        />
                        Upload CSV
                      </Button>
                    </Tooltip>

                    <Tooltip title={"Download template"} arrow>
                      <Button
                        variant="downLoad"
                        style={{ minWidth: 120, marginLeft: 10 }}
                        onClick={downloadCSV}
                      >
                        {/* <a
                          style={{ textDecoration: "none", color: "white" }}
                          href={Images.patientCSV}
                          download="Patient.csv"
                          type="text/csv"
                        > */}
                        Download
                        {/* </a> */}
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            )}
          </Grid>
          <Grid
            container
            style={{ justifyContent: "space-between" }}
            gap={2}
            wrap={sm ? "wrap" : "nowrap"}
          >
            <Grid item style={{ display: "flex" }}>
              {!isEmpty(checkedItem) && (
                <Grid item style={{ marginTop: 20 }}>
                  <Select
                    displayEmpty
                    IconComponent={!newProvider && FilterAlt}
                    value={newProvider || ""}
                    onChange={(v) => {
                      setNewProvider(v.target.value);
                    }}
                    endAdornment={
                      <IconButton
                        sx={{
                          display: newProvider ? "visible" : "none",
                          padding: 0,
                        }}
                        onClick={() => {
                          setNewProvider("");
                        }}
                      >
                        <ClearIcon />
                      </IconButton>
                    }
                    style={{
                      color: !isNumber(newProvider) ? color.placeholder : "",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: "40vh",
                        },
                      },
                    }}
                  >
                    <MenuItem
                      value={""}
                      hidden
                      selected
                      style={{ color: color.placeholder }}
                    >
                      Select new provider
                    </MenuItem>
                    {providersList.map((item, index) => {
                      if (
                        item?.id === provider ||
                        item?.id === editData?.provider_id
                      ) {
                        return null;
                      } else {
                        return (
                          <MenuItem key={index} value={item?.id}>
                            {(item?.credentials ||
                            (item?.credentials && item?.title)
                              ? item?.title
                              : "") +
                              " " +
                              item?.firstname +
                              " " +
                              item?.lastname +
                              " " +
                              (item?.credentials || item?.credentials
                                ? item?.credentials
                                : "")}
                          </MenuItem>
                        );
                      }
                    })}
                  </Select>
                  <Button
                    style={{ minWidth: 80, marginLeft: "10px" }}
                    disabled={isEmpty(newProvider.toString())}
                    variant="contained"
                    onClick={() => changeProviderOfPatientsApi()}
                  >
                    Assign
                  </Button>
                  <Button
                    style={{
                      minWidth: 80,
                      marginLeft: "10px",
                      backgroundColor: color.error,
                    }}
                    variant="contained"
                    onClick={() => setDeleteConf(true)}
                  >
                    Delete
                  </Button>
                  <Tooltip
                    title="A maximum of 6 patients can be merged at once"
                    arrow
                  >
                    <Button
                      style={{ minWidth: 80, marginLeft: "10px" }}
                      disabled={
                        checkedItem.length === 1 ||
                        checkedItem.length > 6 ||
                        btnLoad
                      }
                      variant="contained"
                      onClick={() => checkOpenEventApi()}
                    >
                      {btnLoad ? <CircularProgress size={22} /> : "Merge"}
                    </Button>
                  </Tooltip>
                </Grid>
              )}
            </Grid>
            <Grid item style={{ display: "flex", gap: 10 }}>
              <Grid style={{ marginTop: 20, marginRight: 10 }}>
                <Select
                  displayEmpty
                  IconComponent={!provider && FilterAlt}
                  value={provider || ""}
                  onChange={(v) => {
                    setPageNo(1);
                    delete queryParams.search;
                    setSearchParams(
                      {
                        ...queryParams,
                        page: EncDctFn(1, "encrypt"),
                        provider: EncDctFn(v.target.value, "encrypt"),
                      },
                      { replace: true }
                    );
                    setProvider(v.target.value);
                    setSearchFilter("");
                  }}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: provider ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setPageNo(1);
                        delete queryParams.search;
                        delete queryParams.provider;
                        setSearchParams(
                          {
                            ...queryParams,
                            page: EncDctFn(1, "encrypt"),
                          },
                          { replace: true }
                        );

                        setProvider("");
                        setSearchFilter("");
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                  style={{
                    color: !isNumber(provider) ? color.placeholder : "",
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "40vh",
                      },
                    },
                  }}
                >
                  <MenuItem
                    value={""}
                    hidden
                    selected
                    style={{ color: color.placeholder }}
                  >
                    Select provider
                  </MenuItem>
                  {providersList.map((item, index) => {
                    return (
                      <MenuItem key={index} value={item?.id}>
                        {(item?.credentials ||
                        (item?.credentials && item?.title)
                          ? item?.title
                          : "") +
                          " " +
                          item?.firstname +
                          " " +
                          item?.lastname +
                          " " +
                          (item?.credentials || item?.credentials
                            ? item?.credentials
                            : "")}
                      </MenuItem>
                    );
                  })}
                </Select>
              </Grid>

              <TextField
                style={{ marginTop: 20 }}
                placeholder="Search"
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
                      <div style={{ lineHeight: 0 }}>
                        <Search fill={color.primary} />
                      </div>
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip
                        title="Search by name, email, phone or GUID"
                        placement="bottom"
                        arrow
                      >
                        <div style={{ lineHeight: 0, cursor: "pointer" }}>
                          <Info fill={color.gray} />
                        </div>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
          {loader ? (
            <Grid
              container
              display={"flex"}
              alignItems="center"
              justifyContent={"center"}
              style={{ height: 500 }}
            >
              <MainLoader />
            </Grid>
          ) : !isEmpty(patientList?.items) ? (
            <>
              <div style={{ margin: "20px 0px" }}>
                <DataGrid
                  rows={patientList?.items}
                  columns={column}
                  getRowId={patientList?.role_id}
                  disableColumnMenu
                  hideFooter
                  showCellRightBorder
                  disableSelectionOnClick
                  showColumnRightBorder
                  autoHeight={true}
                  getRowHeight={() => "auto"}
                  scrollbarSize={2}
                  showCellVerticalBorder
                  onCellDoubleClick={(params) => {
                    if (
                      params?.field !== "action" &&
                      params?.field !== "__check__" &&
                      params?.field !== "is_active" &&
                      params?.row?.is_active
                    ) {
                      setSearchParams(
                        {
                          ...queryParams,
                          id: EncDctFn(params?.row?.id, "encrypt"),
                          tab: "patient_info",
                        },
                        { replace: true }
                      );
                    }
                    setEditData(params.row);
                  }}
                  // hide column
                  initialState={{
                    columns: {
                      columnVisibilityModel: {
                        action:
                          permission ||
                          hasPermission(permissionData, "patient_permission") ||
                          hasPermission(permissionData, "data_management"),
                        __check__: permission,
                        organization_name: userType === "super_admin",
                        // provider_firstname:
                        //   userData?.personal_info?.is_provider === 0,
                      },
                    },
                  }}
                  disableRowSelectionOnClick
                  checkboxSelection
                  onRowSelectionModelChange={(item) => {
                    setCheckedItem(item);
                  }}
                />
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Pagination
                  count={Math.ceil(patientList?.pagination?.totalPage)}
                  defaultPage={pageNo}
                  color="primary"
                  onChange={(v, e) => {
                    setPageNo(e);
                    setSearchParams(
                      { ...queryParams, page: EncDctFn(e, "encrypt") },
                      { replace: true }
                    );
                  }}
                />
              </div>
            </>
          ) : (
            <NoData />
          )}
        </div>
      )}

      {/* csv confirm dialog modal */}
      <ConfirmDialog
        title={"Please verify CSV data."}
        visible={csvConf}
        btnLoad={uploader}
        btnTitle={"Verify"}
        handleModal={(bool) => {
          if (bool) {
            uploadCSV();
          } else {
            setCsvConf(false);
          }
        }}
      />

      <CsvExistDataModal
        type={"patients"}
        title={"Review Patients"}
        visible={visible}
        data={csvExistData}
        handleModal={(bool) => {
          if (bool) {
            uploadCSV(true);
          } else {
            setVisible(false);
          }
        }}
        btnLoad={uploader}
        handleReUpload={(e) => {
          setSelectedFile(e.target.files[0]);
          setVisible(false);
          setCsvConf(true);
        }}
      />

      {/* send changed password link modal */}
      <ChangedPasswordLink
        model={"sendLink"}
        handleModal={(value) => {
          if (value === "close") {
            setSendPassVisible(false);
          }
        }}
        visible={sendPassVisible}
        data={editData}
      />

      <ChangedPasswordLink
        model={"changePass"}
        handleModal={(value) => {
          if (value === "close") {
            setChangePass(false);
          }
        }}
        visible={changePass}
        data={editData}
      />
      <ImagePreview image={image} handleClose={() => setImage("")} />

      {/* delete ConfirmDialog */}
      <ConfirmDialog
        title={`Are you sure you want to delete selected patients?`}
        visible={deleteConf}
        btnLoad={deleteLoad}
        handleModal={(bool) => {
          if (bool) {
            deletePatient();
          } else {
            setDeleteConf(false);
          }
        }}
      />

      {/* open event modal */}
      <CModal
        title={"Open Event"}
        handleModal={(type) => {
          setMerge({ ...merge, openEvent: false });
        }}
        visible={merge?.openEvent}
        children={
          <Grid container gap={1}>
            <Grid
              item
              xs={12}
              display={"flex"}
              justifyContent={"center"}
              marginY={1}
            >
              <Typography variant="tableTitle" color={color.red}>
                Please close any {merge?.data.length - 1} event(s)
              </Typography>
            </Grid>
            <Grid item xs={12} display={"flex"} justifyContent={"center"}>
              {["Patient", "Event", "Action"].map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    xs={4}
                    sm={3}
                    display={"flex"}
                    justifyContent={"center"}
                  >
                    <Typography fontSize={18} variant="tableTitle">
                      {item}
                    </Typography>
                  </Grid>
                );
              })}
            </Grid>
            <Grid item xs={12}>
              {merge?.data?.map((item, index) => {
                return (
                  <Grid
                    key={index}
                    item
                    display={"flex"}
                    justifyContent={"center"}
                    marginBottom={1}
                  >
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Typography
                        variant="subTitle"
                        style={{ textTransform: "capitalize" }}
                      >
                        {item?.firstname +
                          " " +
                          (item?.middlename || "") +
                          " " +
                          item?.lastname}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Typography variant="subTitle">{item?.title}</Typography>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sm={3}
                      display={"flex"}
                      justifyContent={"center"}
                      alignItems={"center"}
                    >
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() =>
                          setMerge({
                            ...merge,
                            closeEvent: true,
                            eId: item?.event_id,
                            pId: item?.id,
                          })
                        }
                      >
                        Close event
                      </Button>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        }
      />

      {/* close event modal */}
      <CloseEventConfirm
        maxWidth={"600px"}
        visible={merge?.closeEvent}
        title={"You are about to close this event!"}
        subTitle={`Once the event outcome is selected below and this event is closed, the outcome will be permanently recorded and no additional assessments will be recorded for this event.
        You will need to reopen the event to make any changes or resume assessments.`}
        btnLoad={btnLoad}
        btnTitle={"Close Event"}
        handleModal={(type) => {
          if (type === "close") {
            setMerge({ ...merge, closeEvent: false });
            setReason([]);
            clear();
          } else {
            validation();
          }
        }}
        child={
          <Grid container className={classes.scrollbar}>
            <Grid item xs={12} mb={2}>
              <CTypography title="Select reason" required />
              <FormControl fullWidth error={errObj.reasonErr}>
                <Select
                  fullWidth
                  displayEmpty
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setErrObj({ ...errObj, reasonErr: false, reasonMsg: "" });
                  }}
                  style={isNumber(reason) ? {} : { color: color.disable }}
                  IconComponent={!isNumber(reason) && KeyboardArrowDown}
                  endAdornment={
                    <IconButton
                      sx={{
                        display: isNumber(reason) ? "visible" : "none",
                        padding: 0,
                      }}
                      onClick={() => {
                        setReason("");
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  }
                >
                  <MenuItem value="" selected hidden disabled>
                    Please select reason to close event
                  </MenuItem>
                  {reasonToClose.map((item, index) => {
                    return (
                      <MenuItem key={index} value={index}>
                        {item}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
              {errObj.reasonErr && (
                <FormHelperText
                  style={{
                    color: color.error,
                  }}
                >
                  Please select a reason for closing event
                </FormHelperText>
              )}
            </Grid>
            {reason === 1 && (
              <Grid item xs={12} mb={2}>
                <CTypography title="Please describe" required />
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  maxRows={5}
                  placeholder="Please describe"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setErrObj({
                      ...errObj,
                      descriptionErr: false,
                      descriptionMsg: "",
                    });
                  }}
                  error={errObj.descriptionErr}
                  helperText={errObj.descriptionMsg}
                />
              </Grid>
            )}
            {reason === 3 && (
              <>
                <Grid item xs={12} mb={2}>
                  <CTypography title="Referred to" required />
                  <FormControl fullWidth error={errObj.refereErr}>
                    <Select
                      displayEmpty
                      fullWidth
                      value={referredTo}
                      onChange={(e) => {
                        setReferredTo(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereErr: false,
                          refereMsg: "",
                        });
                      }}
                      style={
                        isEmpty(referredTo) ? { color: color.disable } : {}
                      }
                      IconComponent={!referredTo && KeyboardArrowDown}
                      endAdornment={
                        <IconButton
                          sx={{
                            display: referredTo ? "visible" : "none",
                            padding: 0,
                          }}
                          onClick={() => {
                            setReferredTo("");
                          }}
                        >
                          <ClearIcon />
                        </IconButton>
                      }
                    >
                      <MenuItem value="" selected hidden disabled>
                        Please select
                      </MenuItem>
                      {referral.map((item, index) => {
                        return (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  {errObj.refereErr && (
                    <FormHelperText
                      style={{
                        color: color.error,
                      }}
                    >
                      {errObj.refereMsg}
                    </FormHelperText>
                  )}
                </Grid>
                {referredTo === "Other" && (
                  <Grid item xs={12} mb={2}>
                    <CTypography title="Referred to" required />
                    <TextField
                      fullWidth
                      placeholder="Referred to..."
                      value={referredText}
                      onChange={(e) => {
                        setReferredText(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereTxtErr: false,
                          refereTxtMsg: "",
                        });
                      }}
                      error={errObj.refereTxtErr}
                      helperText={errObj.refereTxtMsg}
                    />
                  </Grid>
                )}
                {!isEmpty(referredTo) && (
                  <Grid item xs={12} mb={2}>
                    <CTypography title="Reason for referral" required />
                    <TextField
                      fullWidth
                      placeholder="Reason for referral"
                      value={referredReason}
                      onChange={(e) => {
                        setReferredReason(e.target.value);
                        setErrObj({
                          ...errObj,
                          refereReasonErr: false,
                          refereReasonMsg: "",
                        });
                      }}
                      error={errObj.refereReasonErr}
                      helperText={errObj.refereReasonMsg}
                    />
                  </Grid>
                )}
              </>
            )}
            {reason === 4 && (
              <Grid item xs={12} mb={2}>
                <CTypography
                  title="Please describe the patient's outcome"
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  maxRows={5}
                  placeholder="Please describe the patient's outcome"
                  value={other}
                  onChange={(e) => {
                    setOther(e.target.value);
                    setErrObj({
                      ...errObj,
                      otherErr: false,
                      otherMsg: "",
                    });
                  }}
                  error={errObj.otherErr}
                  helperText={errObj.otherMsg}
                />
              </Grid>
            )}
          </Grid>
        }
      />

      {/* csv export and download Regulatory Data Management model */}
      <CModal
        title={"Regulatory Data Management"}
        visible={openDataManage.open}
        handleModal={(type) => {
          setOpenDataManage({ open: false });
        }}
        children={
          <Grid
            container
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "nowrap",
              gap: 10,
            }}
          >
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => exportCSV(openDataManage.data, "email")}
              >
                {loadDataManage?.export ? (
                  <CircularProgress size={22} style={{ color: color.white }} />
                ) : (
                  "Export"
                )}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => exportCSV(openDataManage.data, "download")}
              >
                {loadDataManage?.download ? (
                  <CircularProgress size={22} style={{ color: color.white }} />
                ) : (
                  "Download"
                )}
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => purgeData(openDataManage.data)}
              >
                {purgeBtlLoad ? (
                  <CircularProgress size={22} style={{ color: color.white }} />
                ) : (
                  "Purge"
                )}
              </Button>
            </Grid>
          </Grid>
        }
      />
    </Grid>
  );
}
