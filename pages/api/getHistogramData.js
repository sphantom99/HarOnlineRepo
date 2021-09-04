/* eslint-disable no-param-reassign */
/* eslint-disable array-callback-return */
/* eslint-disable radix */
import { MongoClient } from 'mongodb';
import { createSecretKey } from 'crypto';
import Cookies from 'Cookies';
import { jwtDecrypt } from 'jose/jwt/decrypt';

export default async function processedUpload(req, res) {
  try {
    if (req.method === 'POST') {
      // console.log('it was a post method');
      // console.log(req);
      const cookies = Cookies(req, res);
      const jwt = cookies.get('HarOnline');
      console.log(jwt);
      if (jwt) {
        const secretKey = await createSecretKey(Buffer.from(process.env.JWT_KEY));
        // const secretKey = await generateSecret('HS256');
        const { payload } = await jwtDecrypt(jwt, secretKey);
        if (payload) {
          if (req.body) {
            const { contentHistogramFilter, ispHistogramFilter } = req.body;
            const client = new MongoClient(process.env.MONGO_URI);
            await client.connect();
            const db = client.db('WEB');
            const entries = db.collection('Entries');
            const typeQuery = contentHistogramFilter?.length !== 0
            && contentHistogramFilter !== undefined
              ? { 'response.headers.content-type': { $in: contentHistogramFilter } }
              : null;

            const ispQuery = ispHistogramFilter?.length !== 0 && ispHistogramFilter !== undefined
              ? { serverISP: { $in: ispHistogramFilter } }
              : null;

            const filter = {
              ...typeQuery,
              ...ispQuery,
            };
            const result = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'response.headers.maxAge': { $exists: true } } },
                { $project: { maxAge: '$response.headers.maxAge', _id: 0 } },
              ])
              .sort({ maxAge: -1 })
              .toArray();
            let bucketSize = 0;
            let bucketRange = [];
            let bucketLabel = [];
            let bucketData = [];
            const maxAges = result.map((entry) => entry.maxAge);
            if (maxAges.length !== 0) {
              bucketSize = (maxAges[0] - maxAges[maxAges.length - 1]) / 10;
              bucketRange = [{ low: 0, high: 0, count: 0 }];
              bucketLabel = [];
              for (let i = 0; i < 10; i += 1) {
                const temp = parseInt(bucketRange[i].high);
                const curr = parseInt(temp + bucketSize);
                bucketRange.push({ low: temp, high: curr, count: 0 });
                bucketLabel.push(`${temp}-${curr}`);
              }
              bucketRange.shift();
              bucketData = [];
              maxAges.map((item) => {
                const maxAge = item;
                bucketRange.map((buck) => {
                  if (maxAge >= buck.low && maxAge < buck.high) {
                    buck.count += 1;
                  }
                });
              });
              bucketRange.map((item) => {
                bucketData.push(item.count);
              });
            }
            console.log(bucketLabel);
            console.log(bucketData);
            if (bucketData.length !== 0 && bucketLabel !== 0) {
              const resultData = bucketLabel.map((label, index) => ({
                label,
                count: bucketData[index],
              }));
              console.log(resultData);
              if (!result) {
                res.status(404);
                res.json({ message: 'No results found' });
              } else {
                res.status(200);
                res.send(resultData);
              }
            } else {
              res.status(404);
              res.send('no data found');
            }
          } else {
            res.status(400);
            res.send();
          }
        } else {
          res.status(400);
          res.send();
        }
      }
    } else {
      res.status(405);
      res.json({ message: 'Unacceptable method' });
    }
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json({ message: 'error occured' });
  }
}
