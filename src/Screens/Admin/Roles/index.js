import { useNavigate } from "react-router-dom";
import { Grid, Tooltip, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { color } from "../../../Config/theme";
import styles from "./styles";
import BackBtn from "../../../Components/BackBtn";
import { roleArr } from "../../../Config/Static_Data";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { isArray, isEmpty } from "lodash";
import UserPermission from "../../../Components/UserPermission";

export default function Roles() {
  const classes = styles();
  const navigate = useNavigate();
  const { userType } = useSelector((state) => state.auth);
  const [roleData, setRoleData] = useState([]);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const roleColumn = [
    {
      field: "id",
      headerName: "ID",
      width: 80,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => {
        const ind =
          params?.api?.getRowIndexRelativeToVisibleRows(params?.row?.id) + 1;
        return <Typography>{ind}</Typography>;
      },
    },
    {
      field: "name",
      headerName: "Role",
      width: 300,
      sortable: false,
      flex: 1,
      renderCell: (params) => {
        const txt =
          params?.row?.id === 2
            ? "Comprehensive access to manage and oversee the entire organization. This includes handling organization parameters, user accounts, roles, practitioners, patients, data management, and utilizing reporting and analytics tools to make informed decisions."
            : params?.row?.id === 3
            ? "Authority over the operational management of the organization entails control over aggregate user management, allowing for the creation, updating, and editing of user accounts, as well as overseeing practitioners and patients within your operational domain. Additionally, it involves data management and the utilization of reporting and analytics tools to optimize operational efficiency"
            : params?.row?.id === 4
            ? "Specialized access for patient management to create, update, and maintain patient records. This includes utilizing reporting and analytics tools to monitor patient outcomes and improve care delivery."
            : params?.row?.id === 5
            ? "Specialized access for patient management, to ensure accurate and up-to-date records. This includes utilizing reporting and analytics tools to assist in tracking patient progress and supporting healthcare professionals."
            : params?.row?.id === 6
            ? "Specialized access for patient management responsibilities, ensuring precise record-keeping. This includes utilizing reporting and analytics tools to evaluate and assess patient data, supporting the overall quality of healthcare services."
            : "";
        return (
          <Tooltip title={txt} placement="right" arrow>
            <Typography>{params?.row?.name}</Typography>
          </Tooltip>
        );
      },
    },
  ];

  useEffect(() => {
    if (!isEmpty(roleArr) && isArray(roleArr)) {
      if (userType === "org_admin") {
        let dummy_Arr = roleArr?.filter((item) => {
          return item?.id !== 1 && item?.id !== 7;
        });
        setRoleData(dummy_Arr);
      } else {
        setRoleData(roleArr);
      }
    }
  }, []);

  return (
    <>
      <Grid className={classes.container}>
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
                Roles
              </Typography>
            </div>
          </Grid>

          <div style={{ margin: "16px 0px" }}>
            <DataGrid
              rows={roleData}
              columns={roleColumn}
              disableColumnMenu
              hideFooter
              showCellRightBorder
              disableSelectionOnClick
              showColumnRightBorder
              autoHeight={true}
              getRowHeight={() => "auto"}
              scrollbarSize={2}
              showCellVerticalBorder
              onCellClick={(params) => {
                if (
                  userType === "org_admin" &&
                  params?.row?.id !== 2 &&
                  params?.row?.id !== 7
                ) {
                  setData(params?.row);
                  setVisible(true);
                }
              }}
            />
          </div>
        </div>
      </Grid>
      {/* pemission modal component */}
      {userType === "org_admin" && (
        <UserPermission
          handleClick={(type) => {
            if (type === "close") {
              setVisible(false);
            }
          }}
          data={data}
          visible={visible}
        />
      )}
    </>
  );
}
