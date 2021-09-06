/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import React, { useState } from "react";
import axios from "axios";
import MapGL, { Source, Layer } from "react-map-gl";
import { Card, CardContent, Container, Typography } from "@material-ui/core";
import AlbumIcon from "@material-ui/icons/Album";
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

  const test = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84",
      },
    },
    features: [
      {
        type: "Feature",
        properties: {
          id: "ak16994521",
          mag: 2.3,
        },
        geometry: {
          type: "Point",
          coordinates: [-151.5129, 63.1016],
        },
      },
      {
        type: "Feature",
        properties: {
          id: "ak16994519",
          mag: 1.7,
        },
        geometry: {
          type: "Point",
          coordinates: [-150.4048, 63.1224],
        },
      },
    ],
  };
  console.log(uniqueIps);
  const data = uniqueIps.map((item) => ({
    type: "Feature",
    properties: {
      id: "paulihno",
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
    latitude: 40,
    longitude: -100,
    zoom: 3,
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
              Welcome to HeatMap
            </Typography>
            <MapGL
              {...viewport}
              width="1120px"
              height="1000px"
              // mapStyle="mapbox://styles/mapbox/dark-v9"
              onViewportChange={setViewport}
              mapboxApiAccessToken={mapBoxToken}
            >
              {format && (
                <Source type="geojson" data={format}>
                  <Layer {...heatmapLayer} />
                </Source>
              )}
            </MapGL>
            <p>
              <AlbumIcon />
              Here you can see all the places to which you have sent a request.
              <br />
              <AlbumIcon />
              The more yellow is a point, the more requests you have sent to
              that exact location.
              <br />
              <AlbumIcon />
              If a location is faint blue, then it means it has received, just a
              few requests.
              <br />
              <AlbumIcon />
              All intensity of the colors has be normalized, according to the
              number of requests sent that place.
            </p>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
