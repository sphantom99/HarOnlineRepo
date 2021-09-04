/* eslint-disable dot-notation */
/* eslint-disable radix */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable no-unused-vars */
import {
  Snackbar,
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Input,
  Box,
  Typography,
  Slide,
} from '@material-ui/core';
import { CloudDownload, CloudUpload } from '@material-ui/icons';
import { FileUploader } from 'react-drag-drop-files';
import React, { useContext, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useRouter } from 'next/router';
import { authContext } from '../_app';

export default function UserHome() {
  const router = useRouter();
  const [file, setFile] = useState();
  const [fileName, setfileName] = useState();
  const [cleaned, setcleaned] = useState(false);
  const [theRef, settheRef] = useState();
  const [data, setData] = useState();
  const [uploadDisable, setuploadDisable] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const username = useContext(authContext);
  console.log('This is the context', username);

  const handleClose = (event, reason) => {
    setOpenSnackBar(false);
  };
  function handleUpload(e) {
    // e.preventDefault();
    setuploadDisable(false);
    console.log(e);
    const reader = new FileReader();
    reader.readAsText(e);
    reader.onload = async function () {
      setFile({ fileContents: reader.result.toString() });
      console.log(reader.result);
      let myfile = reader.result;
      myfile = JSON.parse(myfile);
      console.log(myfile);
      const header = ['cache-control', 'host', 'content-type', 'expires', 'pragma', 'age'];
      function headerRequest(iter) {
        const obj = {};
        iter.request.headers
          .filter((item) => header.includes(item.name.toLowerCase()))
          .map((head) => {
            // obj[head.name] = head.value;
            if (head.name === 'content-type' || head.name === 'Content-Type') {
              const type = head.value.split('/')[0];
              obj[head.name] = type;
            }
            if (head.name === 'cache-control' || head.name === 'Cache-Control') {
              head.value.split(',').map((item) => {
                if (item.includes('max-stale')) {
                  const max = item.split('=');
                  obj['maxStale'] = max[1];
                } else if (item.includes('min-fresh')) {
                  const max = item.split('=');
                  obj['minFresh'] = max[1];
                }
              });
              obj[head.name] = head.value;
            }
          });
        return obj;
      }

      function headerResponse(iter) {
        const obj = {};
        const today = new Date();
        let flagMax = false;
        iter.response.headers
          .filter((item) => header.includes(item.name.toLowerCase()))
          .map((head) => {
            if (head.name === 'content-type') {
              const type = head.value.split('/')[0];
              obj[head.name] = type;
            }
            if (head.name === 'cache-control') {
              const temp = head.value.split(',').map((item) => {
                if (item.includes('max-age')) {
                  const maxAge = item.split(/=|:| /);
                  // console.log('Before', parseInt(maxAge[1].trim()));
                  obj['maxAge'] = parseInt(maxAge[1].trim()) === 0 || parseInt(maxAge[1].trim()) === null
                    ? undefined
                    : parseInt(maxAge[1].trim());
                  flagMax = true;
                } else if (item.includes('no-store')) {
                  obj[item.trim()] = item.trim();
                } else if (item.includes('no-cache')) {
                  obj[item.trim()] = item.trim();
                } else if (item.includes('max-stale')) {
                  const max = item.split('=');
                  obj['maxStale'] = max[1];
                } else if (item.includes('min-fresh')) {
                  const max = item.split('=');
                  obj['minFresh'] = max[1];
                } else if (item.includes('private')) {
                  obj[item.trim()] = item.trim();
                } else if (item.includes('public')) {
                  obj[item.trim()] = item.trim();
                }
              });
              obj[head.name] = head.value;
            }
            if (head.name !== 'content-type' && head.name !== 'cache-control') {
              obj[head.name] = head.value;
            }
          });
        if (obj['maxAge'] === undefined && obj['expires'] && obj['last-modified']) {
          const expires = new Date(obj['expires']);
          const lastModified = new Date(obj['last-modified']);
          obj['maxAge'] = Number.isNaN(parseInt(expires - lastModified) / 1000)
            ? undefined
            : parseInt(expires - lastModified) / 1000;
        }
        return obj;
      }

      const client = await fetch(
        'http://api.ipstack.com/check?access_key=492ecef75baf8e594140fa9327af2a6c',
        {
          method: 'GET',
          credentials: 'omit',
        },
      );
      const clientResponse = await client.json();
      const isp = await fetch(`http://ip-api.com/json/${clientResponse.ip}`, {
        method: 'GET',
        credentials: 'omit',
      });
      const ispResponse = await isp.json();

      const clientIp = await fetch(
        'http://api.ipstack.com/check?access_key=492ecef75baf8e594140fa9327af2a6c',
        {
          method: 'GET',
          credentials: 'omit',
        },
      );
      const clientCoordinates = await clientIp.json();
      const coordinates = {
        latitude: clientCoordinates.latitude,
        longitude: clientCoordinates.longitude,
      };
      const cleanJSON = myfile.log.entries.map((iter) => ({
        username,
        clientIp: clientCoordinates.ip,
        clientCoordinates: coordinates,
        serverISP: ispResponse.isp,
        startedDateTime: iter.startedDateTime,
        hour: moment(iter.startedDateTime).format('HH'),
        day: moment(iter.startedDateTime, 'YYYY-MM-DD').format('dddd'),
        serverIPAddress: iter.serverIPAddress?.replace('[', '').replace(']', ''),
        timings: iter.timings.wait,
        request: {
          method: iter.request.method,
          url: iter.request.url.split('/')[2],
          headers: headerRequest(iter),
        },
        response: {
          status: iter.response.status,
          statusText: iter.response.statusText,
          headers: headerResponse(iter),
        },
      }));
      console.log(cleanJSON);
      const cleanData = JSON.stringify(cleanJSON);
      const blob = new Blob([cleanData], { type: 'text/plain;charset=utf-8' });
      const ref = URL.createObjectURL(blob);
      settheRef(ref);
      const name = 'DownloadableHar.txt';
      setData(cleanData);
      setfileName(name);
      setcleaned(true);
    };
  }
  async function handleProcessedUpload(e) {
    e.preventDefault();
    const resp = await axios.post('/api/processedUpload', { data });
    setuploadDisable(true);
    setOpenSnackBar(true);
  }
  return (
    <div>
      <Container>
        <Card>
          <CardContent>
            <Container style={{}}>
              <Box style={{ display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h4">Welcome to HAROnline</Typography>
              </Box>
              <br />
              <br />
              <br />
              <form>
                <Box style={{ display: 'flex', justifyContent: 'center' }}>
                  <FileUploader handleChange={handleUpload} name="user" style={{ color: 'red' }} />
                </Box>
                <br />
                <Input
                  style={{ display: 'none' }}
                  accept="*"
                  id="contained-button-file"
                  multiple
                  type="file"
                  onChange={handleUpload}
                />
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                <label htmlFor="contained-button-file">
                  {/* <Box style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button
                      variant="contained"
                      color="primary"
                      component="span"
                      endIcon={<Publish />}
                      style={{}}
                    >
                      Upload Your Har File...
                    </Button>
                  </Box> */}
                </label>
                <br />
                <br />
                <br />
                {cleaned ? (
                  <Box variant="span" style={{ display: 'flex', justifyContent: 'space-around' }}>
                    <Button
                      type="submit"
                      onClick={handleProcessedUpload}
                      endIcon={<CloudUpload />}
                      disabled={uploadDisable}
                    >
                      Upload Processed
                    </Button>
                    <Snackbar
                      severity="success"
                      TransitionComponent={Slide}
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                      open={openSnackBar}
                      autoHideDuration={6000}
                      onClose={handleClose}
                    >
                      <Alert onClose={handleClose} severity="success">
                        File Successfully Uploaded!
                      </Alert>
                    </Snackbar>
                    <Button
                      type="submit"
                      href={theRef}
                      download={fileName}
                      endIcon={<CloudDownload />}
                    >
                      Download the processed file
                    </Button>
                  </Box>
                ) : null}
              </form>
              {cleaned ? (
                <Button
                  onClick={() => router.push(`/user/${username}/heatmap`)}
                  fullWidth
                  variant="contained"
                >
                  Visualise Your Data
                </Button>
              ) : null}
            </Container>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
