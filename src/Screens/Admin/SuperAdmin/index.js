import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Pagination,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import { getApiData } from "../../../Utils/APIHelper";
import { Setting } from "../../../Utils/Setting";
import { toast } from "react-toastify";
import { isEmpty, isNull, isObject } from "lodash";
import NoData from "../../../Components/NoData";
import BackBtn from "../../../Components/BackBtn";
import AddSuperAdmin from "../../../Components/Forms/AddSuperAdmin";
import { sexArr } from "../../../Config/Static_Data";
import moment from "moment";
import MainLoader from "../../../Components/Loader/MainLoader";
import { EncDctFn } from "../../../Utils/EncDctFn";
import Search from "../../../Components/CustomIcon/Global/Search";
import ImagePreview from "../../../Components/ImagePreview";
import Info from "../../../Components/CustomIcon/Global/Info";
import Edit from "../../../Components/CustomIcon/Global/Edit";
import Send from "../../../Components/CustomIcon/Global/Send";
import ChangedPasswordLink from "../../../Components/Modal/ChangedPasswordLink";
import { isBrowser } from "react-device-detect";

export default function SuperAdmin() {
  const classes = styles();
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const queryParams = Object.fromEntries(searchParams.entries());
  const [loader, setLoader] = useState(false);

  // change tab
  const [changeTab, setChangeTab] = useState("");
  const [ProviderList, setProviderList] = useState([]);
  const [pageNo, setPageNo] = useState(1);
  const [searchFilter, setSearchFilter] = useState("");
  const [image, setImage] = useState("");
  const [editHover, setEditHover] = useState(null);
  const [sendHover, setSendHover] = useState(null);
  const [activeData, setActiveData] = useState("");
  const [switchLoader, setSwitchLoader] = useState(false);
  const [sendPassVisible, setSendPassVisible] = useState(false);
  const [editData, setEditData] = useState([]);

  const searchVal = searchParams.has("search")
    ? EncDctFn(searchParams.get("search"), "decrypt")
    : "";
  const page = searchParams.has("page")
    ? Number(EncDctFn(searchParams.has("page"), "decrypt"))
    : 1;

  const adminColumn = [
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
      field: "id",
      headerName: "ID",
      width: 70,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "profile_pic",
      headerName: "Image",
      width: 110,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <Avatar
            onMouseDown={() => {
              timeoutRef.current = setTimeout(() => {
                setImage(params?.row?.profile_pic);
              }, 350);
            }}
            onMouseUp={() => {
              clearTimeout(timeoutRef.current);
            }}
            src={params?.row?.profile_pic}
          />
        );
      },
    },
    {
      field: "firstname",
      headerName: "Name",
      sortable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (params) => {
        return (
          <Typography style={{ textTransform: "capitalize" }}>
            {params?.row?.firstname + " " + params?.row?.lastname}
          </Typography>
        );
      },
    },
    {
      field: "email",
      headerName: "Email",
      sortable: false,
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
      field: "sex",
      headerName: "Sex",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        const sexName = sexArr?.map((item) => {
          if (item?.id === params?.row?.sex) {
            return item?.name;
          }
        });
        return sexName;
      },
    },
    {
      field: "dob",
      headerName: "DOB",
      sortable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (params) => {
        let dob;
        if (!isNull(params?.row?.dob) || !isEmpty(params?.row?.dob)) {
          dob = moment(params?.row?.dob).format("MM-DD-YYYY");
        }
        return dob || "-";
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
          <Tooltip title="Activate/Deactivate this super-admin" arrow>
            <Switch
              checked={params?.row?.is_active === 1 ? true : false}
              onChange={() => {
                setActiveData(params?.row);
                changeStatusApi(params?.row?.id);
              }}
            />
          </Tooltip>
        );
      },
    },
    {
      field: "action",
      headerName: "Action",
      sortable: false,
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        return (
          <>
            <Tooltip title="Edit">
              <Link
                replace
                to={`/admin/super-admin?id=${EncDctFn(
                  params?.row?.id,
                  "encrypt"
                )}`}
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
          </>
        );
      },
    },
  ];

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!isEmpty(searchFilter)) {
        setSearchParams(
          {
            ...queryParams,
            page: EncDctFn(1, "encrypt"),
            search: EncDctFn(searchFilter, "encrypt"),
          },
          { replace: true }
        );
      } else {
        delete queryParams.search;
        setSearchParams({ ...queryParams }, { replace: true });
      }
    }, 500);
    // Cleanup the timeout to avoid unnecessary API calls
    return () => clearTimeout(delayDebounceFn);
  }, [searchFilter]);

  useEffect(() => {
    if (searchParams.has("tab")) {
      setChangeTab(searchParams?.get("tab"));
    } else if (searchParams.has("id")) {
      setChangeTab("edit");
    } else {
      setChangeTab("");
    }
    if (searchParams.has("page")) {
      setPageNo(Number(EncDctFn(searchParams?.get("page"), "decrypt")));
    }
    if (searchParams.has("search")) {
      setSearchFilter(EncDctFn(searchParams?.get("search"), "decrypt"));
    }
  }, [searchParams]);

  useEffect(() => {
    if (isEmpty(changeTab)) {
      AdminList(false, page, searchVal);
    }
    setEditHover(null);
  }, [searchParams, changeTab]);

  async function AdminList(bool, page, search) {
    !bool && setLoader(true);
    try {
      const response = await getApiData(
        `${Setting.endpoints.adminList}?page=${page ? page : 1}&search=${
          search ? search : ""
        }`,
        "GET",
        {}
      );
      if (response?.status) {
        if (!isEmpty(response?.data) && isObject(response?.data)) {
          setProviderList(response?.data);
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

  // API cal for change status of super admin
  async function changeStatusApi(id) {
    setSwitchLoader(true);
    try {
      const response = await getApiData(
        Setting.endpoints.changeAdminStatus,
        "POST",
        {
          id: id,
        }
      );
      if (response?.status) {
        AdminList(true, page, searchVal);
      } else {
        toast.error(response?.message);
      }
      setSwitchLoader(false);
    } catch (err) {
      setSwitchLoader(false);
      toast.error(err.toString());
      console.log("🚀 ~ changeStatusApi ~ err==========>>>>>>>>>>", err);
    }
  }

  return (
    <Grid className={classes.container}>
      {changeTab === "add" || changeTab === "edit" ? (
        <AddSuperAdmin
          handleClick={() => {
            delete queryParams.tab;
            delete queryParams.id;
            setSearchParams({ ...queryParams }, { replace: true });
          }}
        />
      ) : (
        <div className={classes.gridContainer}>
          <Grid
            item
            container
            display={"flex"}
            alignItems="center"
            justifyContent={"space-between"}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <BackBtn handleClick={() => navigate(-1)} />
              <Typography variant="title" style={{ color: color.primary }}>
                Super Admin
              </Typography>
            </div>
            <Link to={"/admin/super-admin?tab=add"} replace>
              <Button variant="contained" style={{ minWidth: 120 }}>
                Add
              </Button>
            </Link>
          </Grid>
          <Grid container item style={{ marginTop: 16 }} gap={2}>
            <TextField
              style={{ marginLeft: "auto" }}
              placeholder="Search"
              value={searchFilter}
              onChange={(e) => {
                let value = e.target.value;
                if (value.startsWith(" ")) {
                  value = value.trimStart();
                }
                setSearchFilter(value);
              }}
              className={classes.inputFieldStyle}
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
                      title="Search by ID, Name, Email and Phone No."
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
          ) : !isEmpty(ProviderList?.items) ? (
            <>
              <div style={{ margin: "16px 0px" }}>
                <DataGrid
                  columns={adminColumn}
                  rows={ProviderList?.items}
                  getRowId={ProviderList?.items?.id}
                  disableColumnMenu
                  hideFooter
                  showCellRightBorder
                  disableSelectionOnClick
                  showColumnRightBorder
                  autoHeight={true}
                  getRowHeight={() => "auto"}
                  scrollbarSize={2}
                  showCellVerticalBorder
                  disableRowSelectionOnClick
                  // hide column
                  initialState={{
                    columns: {
                      columnVisibilityModel: {},
                    },
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
                  count={Math.ceil(ProviderList?.pagination?.totalPage)}
                  defaultPage={pageNo}
                  // boundaryCount={2}
                  // siblingCount={0}
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

          <ChangedPasswordLink
            model={"sendLink"}
            from={"superAdmin"}
            handleModal={(value) => {
              if (value === "close") {
                setSendPassVisible(false);
              }
            }}
            visible={sendPassVisible}
            data={editData}
          />

          <ImagePreview image={image} handleClose={() => setImage("")} />
        </div>
      )}
    </Grid>
  );
}
