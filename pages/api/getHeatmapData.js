/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
import { MongoClient } from "mongodb";
import axios from "axios";

export default async function getHeatmapData(req, res) {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("WEB");
    const collection = db.collection("Entries");
    const uniqueIps = await collection.distinct("serverIPAddress", {
      username: req.body.username,
    });
    console.log(req.body.username);
    console.log(uniqueIps.length);
    // const ipCoordinates = await axios
    //   .post('http://ip-api.com/batch', uniqueIps, {
    //     headers: {
    //       'Access-Control-Allow-Origin': '*',
    //     },
    //   })
    //   .then((response) => {
    //     if (response.status === 200) {
    //       return response.data;
    //     }
    //   })
    //   .catch((error) => {
    //     console.log(error.response);
    //   });
    let ipCoordinates = [];
    const clearUniqueIps = [];
    if (uniqueIps.length <= 100) {
      uniqueIps.map((item) => {
        if (item !== "") {
          clearUniqueIps.push(item);
        }
      });
      await axios
        .post("http://ip-api.com/batch", clearUniqueIps, {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.data);
            ipCoordinates = ipCoordinates.concat(response.data);
            return response.data;
          }
        })
        .catch((error) => {
          console.log(error.response);
        });
    } else if (uniqueIps.length > 100) {
      uniqueIps.map((item) => {
        if (item !== "") {
          clearUniqueIps.push(item);
        }
      });

      // console.log('unique ips without []::', clearUniqueIps);
      const rounds = Math.ceil(uniqueIps.length / 100);
      console.log("rounds::", rounds);
      let i;

      for (i = 0; i < rounds; i++) {
        if (i !== rounds - 1) {
          console.log(`slice(${i * 100}, ${(i + 1) * 100})`);
          await axios
            .post(
              "http://ip-api.com/batch",
              clearUniqueIps.slice(i * 100, (i + 1) * 100),
              {
                headers: {
                  "Access-Control-Allow-Origin": "*",
                },
              }
            )
            .then((response) => {
              if (response.status === 200) {
                // console.log(response.data);
                ipCoordinates = ipCoordinates.concat(response.data);
                return response.data;
              }
            });
        } else {
          // console.log(`slice(${i * 100})`);
          await axios
            .post("http://ip-api.com/batch", clearUniqueIps.slice(i * 100), {
              headers: {
                "Access-Control-Allow-Origin": "*",
              },
            })
            .then((response) => {
              if (response.status === 200) {
                // console.log(response.data);
                ipCoordinates = ipCoordinates.concat(response.data);
                return response.data;
              }
            });
        }
      }
    }
    const ipList = ipCoordinates.map((item) => ({
      lat: item.lat,
      long: item.lon,
    }));
    res.json(ipList);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send();
  }
}
