/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable no-underscore-dangle */
import {
  Button,
  Card,
  CardContent,
  Container,
  Box,
  Typography,
  Table,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Divider,
  TableHead,
  Autocomplete,
  TextField,
} from "@material-ui/core";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useRouter } from "next/router";
import getAdminStats from "../../src/lib/getAdminStatistics";
import SwipeableViews from "react-swipeable-views";
import { makeStyles, useTheme } from "@material-ui/styles";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
export async function getServerSideProps() {
  const adminBasicData = await getAdminStats();
  console.log(adminBasicData);
  return { props: { adminBasicData } };
}

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    // backgroundColor: theme.palette.background.paper,
    width: 500,
  },
}));

export default function UserHome({ adminBasicData }) {
  const classes = useStyles();
  const theme = useTheme();

  const router = useRouter();
  const [dayFilter, setdayFilter] = useState([]);
  const [contentTypeFilter, setContentTypeFilter] = useState([]);
  const [methodFilter, setMethodFilter] = useState([]);
  const [ispFilter, setIspFilter] = useState([]);
  const [diagramData, setDiagramData] = useState();
  const [histogramData, setHistogramData] = useState();
  const [contentHistogramFilter, setContentHistogramFilter] = useState([]);
  const [ispHistogramFilter, setIspHistogramFilter] = useState([]);
  const [contentPieFilter, setContentPieFilter] = useState([]);
  const [ispPieFilter, setIspPieFilter] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [pie2ContentFilter, setPie2ContentFilter] = useState([]);
  const [pie2IspFilter, setPie2IspFilter] = useState([]);
  const [pie2Data, setPie2Data] = useState([]);
  const [value, setValue] = useState(0);
  useEffect(async () => {
    const dataReq = await axios.post("/api/getDiagramData", {
      dayFilter,
      contentTypeFilter,
      methodFilter,
      ispFilter,
    });
    console.log(dayFilter, contentTypeFilter, methodFilter, ispFilter);
    setDiagramData(dataReq.data);
  }, [dayFilter, contentTypeFilter, methodFilter, ispFilter]);

  useEffect(async () => {
    try {
      const result = await axios.post("/api/getHistogramData", {
        contentHistogramFilter,
        ispHistogramFilter,
      });
      setHistogramData(result.data);
    } catch (err) {
      setHistogramData(null);
    }
  }, [contentHistogramFilter, ispHistogramFilter]);

  useEffect(async () => {
    try {
      const result = await axios.post("/api/getMinMax", {
        contentPieFilter,
        ispPieFilter,
      });
      setPieData(result.data);
      console.log(pieData);
    } catch (err) {
      setPieData(null);
    }
  }, [contentPieFilter, ispPieFilter]);

  useEffect(async () => {
    try {
      const result = await axios.post("/api/getCacheStatistics", {
        pie2ContentFilter,
        pie2IspFilter,
      });
      setPie2Data(result.data);
      console.log(pie2Data);
    } catch (err) {
      setPie2Data(null);
    }
  }, [pie2ContentFilter, pie2IspFilter]);
  const daysOfTheWeek = [
    { label: "Monday" },
    { label: "Tuesday" },
    { label: "Wednesday" },
    { label: "Thursday" },
    { label: "Friday" },
    { label: "Saturday" },
    { label: "Sunday" },
  ];
  const contentTypes = adminBasicData.averageTiming.map(
    (status) => status._id ?? "unknown"
  );

  const methods = adminBasicData.entryPerMethod.map((entry) => entry._id);
  const isps = adminBasicData.distinctIsps.unique;

  const COLORS = ["#4f2e8c", "#b438c7", "#2da1c4"];

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };
  return (
    <div style={{ "marginBottom": "61px" }}>
      <Container>
        <Card style={{ "borderRadius": "25px" }}>
          <CardContent>
            <Box
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography variant="h4" style={{ marginBottom: "5%" }}>
                Welcome Admin
              </Typography>
            </Box>
            <Tabs
              value={value}
              onChange={handleChange}
              indicatorColor="primary"
              textColor="primary"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="Overview" {...a11yProps(0)} />
              <Tab label="Requests By Status" {...a11yProps(1)} />
              <Tab label="Requests By Method" {...a11yProps(2)} />
              <Tab label="Mean Age By Content-Type" {...a11yProps(3)} />
            </Tabs>
            <SwipeableViews
              axis={"x"}
              index={value}
              onChangeIndex={handleChangeIndex}
            >
              <TabPanel value={value} index={0}>
                <Table>
                  <TableRow>
                    <TableCell> Total Users</TableCell>
                    <TableCell>{adminBasicData.usersCount}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell> Total Unique Isps&apos;</TableCell>
                    <TableCell>{adminBasicData.distinctIsps.count}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell> Total Unique Domains</TableCell>
                    <TableCell>{adminBasicData.distinctDomains}</TableCell>
                  </TableRow>
                </Table>
              </TabPanel>
              <TabPanel value={value} index={1}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableCell>Status:</TableCell>
                      {adminBasicData.entryPerStatus.map((status) => (
                        <TableCell>{status._id ?? "unknown"}</TableCell>
                      ))}
                    </TableHead>
                    <TableBody>
                      <TableCell>Amount:</TableCell>
                      {adminBasicData.entryPerStatus.map((status) => (
                        <TableCell>{status.count}</TableCell>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel value={value} index={2}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableCell>Status:</TableCell>
                      {adminBasicData.entryPerMethod.map((status) => (
                        <TableCell>{status._id ?? "unknown"}</TableCell>
                      ))}
                    </TableHead>
                    <TableBody>
                      <TableCell>Amount:</TableCell>
                      {adminBasicData.entryPerMethod.map((status) => (
                        <TableCell>{status.count}</TableCell>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel value={value} index={3}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableCell>Status:</TableCell>
                      {adminBasicData.averageTiming.map((status) => (
                        <TableCell>{status._id ?? "unknown"}</TableCell>
                      ))}
                    </TableHead>
                    <TableBody>
                      <TableCell>Amount:</TableCell>
                      {adminBasicData.averageTiming.map((status) => (
                        <TableCell>{status.averageTime}</TableCell>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
            </SwipeableViews>

            <Divider style={{ marginBottom: "5%" }} />
            {console.log(diagramData)}
            <Typography variant="h6" style={{ paddingLeft: "1%" }}>
              Average Timings Graph
            </Typography>
            <Divider style={{ marginBottom: "5%" }} />
            <ResponsiveContainer minWidth={200} minHeight={200}>
              <BarChart data={diagramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageTime" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="daysDiag"
                options={daysOfTheWeek.map((day)=>day.label)}
                onChange={(_, newValue) =>
                  setdayFilter(newValue.map((node) => node))
                }
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Day" />
                )}
              />
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="contentDiag"
                options={contentTypes}
                onChange={(_, newValue) => setContentTypeFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Content" />
                )}
              />
            </Box>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="methodsDiag"
                options={methods}
                onChange={(_, newValue) => setMethodFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Method" />
                )}
              />
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="isp"
                options={isps}
                onChange={(_, newValue) => setIspFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Isp" />
                )}
              />
            </Box>
            <Typography variant="h6" style={{ paddingLeft: "1%" }}>
              MaxAge Histogram
            </Typography>
            <Divider style={{ marginBottom: "5%" }} />
            <ResponsiveContainer minWidth={200} minHeight={200}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="contentHist"
                options={contentTypes}
                onChange={(_, newValue) => setContentHistogramFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Content" />
                )}
              />
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="IspsHist"
                options={isps}
                onChange={(_, newValue) => setIspHistogramFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Isps" />
                )}
              />
            </Box>
            <Typography variant="h6" style={{ paddingLeft: "1%" }}>
              Min-Fresh, Max-Age Percentages
            </Typography>
            <Divider style={{ marginBottom: "5%" }} />
            <ResponsiveContainer minWidth={200} minHeight={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="ContentPie"
                options={contentTypes}
                onChange={(_, newValue) => setContentPieFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Content" />
                )}
              />
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="IspsPie"
                options={isps}
                onChange={(_, newValue) => setIspPieFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Isps" />
                )}
              />
            </Box>
            <Typography variant="h6" style={{ paddingLeft: "1%" }}>
              Cacheability Percentages
            </Typography>
            <Divider style={{ marginBottom: "5%" }} />
            <ResponsiveContainer minWidth={200} minHeight={200}>
              <PieChart>
                <Pie
                  data={pie2Data}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <Box style={{ display: "flex", justifyContent: "space-around" }}>
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="ContentPie2"
                options={contentTypes}
                onChange={(_, newValue) => setPie2ContentFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Content" />
                )}
              />
              <Autocomplete
                filterSelectedOptions
                multiple
                style={{ minWidth: "20%", marginBottom: "5%" }}
                disableCloseOnSelect
                id="IspsPie2"
                options={isps}
                onChange={(_, newValue) => setPie2IspFilter(newValue)}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField {...params} variant="standard" label="Isps" />
                )}
              />
            </Box>
            <Box
              style={{
                display: "flex",
                justifyItems: "center",
                flexDirection: "column",
              }}
            >
              <Button
                onClick={() => router.push("/lineMap")}
                variant="contained"
              >
                Visualise
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
