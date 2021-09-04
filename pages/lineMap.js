/* eslint-disable consistent-return */
/* eslint-disable no-unused-vars */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
/* eslint-disable array-callback-return */
/* eslint-disable react/jsx-props-no-spreading */
import React from "react";
// import ReactDOM from 'react-dom';

import ReactMapGL, { Source, Layer, SVGOverlay } from "react-map-gl";
/* eslint-disable react/prefer-stateless-function */
// import dynamic from 'next/dynamic';
import axios from "axios";

const normalize = require("normalize-number");

const mapBoxToken =
  "pk.eyJ1IjoicmF2ZW45OXAiLCJhIjoiY2tzdDAwOHBwMHU0aTMxcG5wdWZ0OW9mMSJ9.Pnc_9xkS8B72aotWuUEoiQ";

export async function getServerSideProps() {
  const info = await axios
    .get("http://localhost:3000/api/getLineMapData")
    .then((response) => {
      if (response.status === 200) {
        // console.log(response.data);
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
  // console.log('this is ip count', countWithIps);

  // console.log('clear coo', clearCoordinates);
  countWithIps.map((client) =>
    client.ipCount.map((item) => {
      const { latitude, longitude } = ipCoordinates.filter(
        (ipIter) => ipIter.ip === item.ip
      )[0];
      item.coordinates = { latitude, longitude };
      item.width = normalize([0, 100], item.count);
    })
  );

  // console.log(countWithIps);
  const [viewport, setViewport] = React.useState({
    latitude: 21.823189401709563,
    longitude: 38.31372289601443,
    zoom: 2,
  });
  // const myGeoJSONData = makeGeoJSON(countWithIps);
  // console.log(myGeoJSONData);
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
            [clientItter.client.long, clientItter.client.lat],
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
  // const temp = countWithIps[0].map((client) => {
  //   client.ipCount.map((item) => ({
  //     type: 'Feature',
  //     properties: {
  //       id: client.ip,
  //       value: client.ip,
  //       lineWidth: item.width,
  //     },
  //     geometry: {
  //       type: 'LineString',
  //       coordinates: [
  //         [client.long, client.lat],
  //         [item.coordinates.long, item.coordinates.lat],
  //       ],
  //     },
  //   }));
  // });
  // console.log(temp);
  return (
    <ReactMapGL
      {...viewport}
      id="map"
      width="1300px"
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
  );
}
