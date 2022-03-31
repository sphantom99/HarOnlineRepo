/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import axios from "axios";
import MapGL, { Source, Layer } from "react-map-gl";
import { Card, CardContent, Container, Typography, Box } from "@material-ui/core";
import { LabelImportant } from "@material-ui/icons";
const mapBoxToken =
  "pk.eyJ1IjoicmF2ZW45OXAiLCJhIjoiY2tzdDAwOHBwMHU0aTMxcG5wdWZ0OW9mMSJ9.Pnc_9xkS8B72aotWuUEoiQ";
const heatmapLayer = {
  maxzoom: 9,
  type: "heatmap",
  paint: {
    "heatmap-weight": ["interpolate", ["linear"], ["get", "mag"], 0, 0, 6, 1],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      0.9,
      "rgb(255,201,101)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 7, 1, 9, 0],
  },
};
export async function getServerSideProps(context) {
  console.log(context.query.id);
  const uniqueIps = await axios
    .post("http://localhost:3000/api/getHeatmapData", {
      username: context.query.id,
    })
    .then((response) => {
      if (response.status === 200) {
        console.log(response.data);
        return response.data;
      }
    })
    .catch((error) => {
      console.log(error.response);
    });
  return {
    props: { uniqueIps },
  };
}
export default function heatmap(props) {
  const { uniqueIps } = props;

  console.log(uniqueIps);
  const data = uniqueIps.map((item) => ({
    type: "Feature",
    properties: {
      id: "randomName",
      mag: 1.7,
    },
    geometry: {
      type: "Point",
      coordinates: [item.long, item.lat],
    },
  }));
  const format = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {},
    },
    features: data,
  };
  const [viewport, setViewport] = useState({
    latitude: 10,
    longitude: 0,
    zoom: 2,
    bearing: 0,
    pitch: 0,
  });
  return (
    <div style={{ "margin-bottom": "61px" }}>
      <Container>
        <Card>
          <CardContent>
            <Typography
              variant="h4"
              style={{ marginBottom: "4%", marginLeft: "35%" }}
            >
              Requests HeatMap
            </Typography>
            <MapGL
              {...viewport}
              width="1120px"
              height="1000px"
              onViewportChange={setViewport}
              mapboxApiAccessToken={mapBoxToken}
            >
              {format && (
                <Source type="geojson" data={format}>
                  <Layer {...heatmapLayer} />
                </Source>
              )}
            </MapGL>
            <Box display="flex" flexDirection="column" justifyContent="space-around" alignText="center">
              <Box textAlign='center' > <LabelImportant sx={{color: '#112'}} style={{marginBottom: '-.5%'}} /> 
              Here you can see all the places to which you have sent a request.
              <br /></Box>
              <Box textAlign='center'><LabelImportant sx={{color: '#112'}} style={{marginBottom: '-.5%'}} /> If the point is bright yellow, the more requests you have sent to
              that exact location.
              <br /></Box>
              <Box textAlign='center'><LabelImportant sx={{color: '#112'}} style={{marginBottom: '-.5%'}} /> If a location is faint blue, then it means it has received, just a
              few requests.
              <br /></Box>
              <Box textAlign='center'><LabelImportant sx={{color: '#112'}} style={{marginBottom: '-.5%'}} /> If you can't see many points don't worry! Just upload a few more files!
              <br /></Box>
              <Box textAlign='center'><LabelImportant sx={{color: '#112'}} style={{marginBottom: '-.5%'}} /> All intensity of the colors has be normalized, according to the
              number of requests sent that place.</Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
