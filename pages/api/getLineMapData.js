/* eslint-disable no-loop-func */
/* eslint-disable no-await-in-loop */
/* eslint-disable consistent-return */
import { MongoClient } from "mongodb";
import axios from "axios";

export default async function getLineMapData(req, res) {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db("WEB");
    const collection = db.collection("Entries");
    let ipsPerUser = await collection
      .aggregate([
        {
          $group: {
            _id: "$clientCoordinates",
            ips: { $addToSet: "$serverIPAddress" },
          },
        },
        { $sort: { serverIPAddress: 1 } },
        {
          $project: {
            _id: 0,
            client: "$_id",
            ips: "$ips",
          },
        },
      ])
      .toArray();
    const countPerIp = await collection
      .aggregate([
        {
          $group: {
            _id: "$serverIPAddress",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: 1 } },
        {
          $project: {
            _id: 0,
            ip: "$_id",
            count: 1,
            sum: 1,
          },
        },
      ])
      .toArray();
    const uniqueIps = await collection.distinct("serverIPAddress");
    // countPerIp = countPerIp.map((item) => ({
    //   count: item.count,
    //   ip: item.ip?.replace('[', '').replace(']', ''),
    // }));
    ipsPerUser = ipsPerUser.map((item) => ({
      client: item.client,
      ips: item.ips.filter((countIp) => countIp !== ""),
    }));
    const countWithIps = ipsPerUser.map((item) => ({
      client: item.client,
      ipCount: item.ips.map(
        (ip) => countPerIp.filter((countIp) => countIp.ip === ip)[0]
      ),
    }));

    let ipCoordinates = [];
    const clearUniqueIps = [];
    if (uniqueIps.length <= 100) {
      await axios
        .post("http://ip-api.com/batch", uniqueIps, {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        })
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.data);
            ipCoordinates = ipCoordinates.concat(
              response.data.map((item) => ({
                ip: item.query,
                latitude: item.lat,
                longitude: item.lon,
              }))
            );
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
      // console.log('rounds::', rounds);
      let i;

      for (i = 0; i < rounds; i++) {
        if (i !== rounds - 1) {
          // console.log(`slice(${i * 100}, ${(i + 1) * 100})`);
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
                ipCoordinates = ipCoordinates.concat(
                  response.data.map((item) => ({
                    ip: item.query,
                    latitude: item.lat,
                    longitude: item.lon,
                  }))
                );
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
                ipCoordinates = ipCoordinates.concat(
                  response.data.map((item) => ({
                    ip: item.query,
                    latitude: item.lat,
                    longitude: item.lon,
                  }))
                );
                return response.data;
              }
            });
        }
      }
    }
    console.log(ipsPerUser);
    res.json({ countWithIps, ipCoordinates, ipsPerUser });
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send();
  }
}
