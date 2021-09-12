/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
import LocationOnIcon from "@material-ui/icons/LocationOn";
import TimelineIcon from "@material-ui/icons/Timeline";
import { Card, CardContent, Container, Typography } from "@material-ui/core";
import ReactMapGL, { Source, Layer, SVGOverlay } from "react-map-gl";

import axios from "axios";

const normalize = require("normalize-number");

const mapBoxToken =
  "pk.eyJ1IjoicmF2ZW45OXAiLCJhIjoiY2tzdDAwOHBwMHU0aTMxcG5wdWZ0OW9mMSJ9.Pnc_9xkS8B72aotWuUEoiQ";

export async function getServerSideProps() {
  const info = await axios
    .get("http://localhost:3000/api/getLineMapData")
    .then((response) => {
      if (response.status === 200) {
        return response.data;
      }
    })
    .catch((error) => {
      console.log(error.response);
    });
  return {
    props: {
      info,
    },
  };
}

export default function MapChart(props) {
  const { countWithIps, ipCoordinates } = props.info;

  countWithIps.map((client) =>
    client.ipCount.map((item) => {
      const { latitude, longitude } = ipCoordinates.filter(
        (ipIter) => ipIter.ip === item.ip
      )[0];
      item.coordinates = { latitude, longitude };
      item.width = normalize([0, 100], item.count);
    })
  );

  const [viewport, setViewport] = React.useState({
    latitude: 10,
    longitude: 0,
    zoom: 2,
  });
  const lineArray = [];
  countWithIps.map((clientItter) => {
    clientItter.ipCount.map((item) => {
      lineArray.push({
        type: "Feature",
        properties: {
          id: clientItter.latitude,
          value: clientItter.latitude,
          lineWidth: item.width,
        },
        geometry: {
          type: "LineString",
          coordinates: [
            [clientItter.client.longitude, clientItter.client.latitude],
            [item.coordinates.longitude, item.coordinates.latitude],
          ],
        },
      });
    });
  });
  console.log(lineArray);
  const multipleLines = {
    type: "FeatureCollection",
    features: lineArray,
  };
  return (
    <div style={{ "margin-bottom": "61px" }}>
      <Container>
        <Card>
          <CardContent>
            <Typography
              variant="h4"
              style={{ marginBottom: "4%", marginLeft: "35%" }}
            >
              Welcome to ArcMap
            </Typography>
            <ReactMapGL
              {...viewport}
              id="map"
              width="1120px"
              height="1000px"
              onViewportChange={setViewport}
              mapboxApiAccessToken={mapBoxToken}
            >
              <Source id="polylineLayer" type="geojson" data={multipleLines}>
                <Layer
                  id="lineLayer"
                  type="line"
                  source="polylineLayer"
                  layout={{
                    "line-join": "round",
                    "line-cap": "round",
                  }}
                  paint={{
                    "line-color": "rgba(3, 170, 238, 0.5)",
                    "line-width": ["get", "lineWidth"],
                  }}
                />
              </Source>
            </ReactMapGL>
            <p>
              <LocationOnIcon />
              Here you can see all the places to which you have sent a request.
              <br />
              <TimelineIcon />
              The thicker the arc, the more requests you have sent to that
              location.
            </p>
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}
