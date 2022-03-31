import { MongoClient } from 'mongodb';
import { createSecretKey } from 'crypto';
import { jwtDecrypt } from 'jose/jwt/decrypt';

export default async function processedUpload(req, res) {
  try {
    if (req.method === 'POST') {
      // console.log('it was a post method');
      // console.log(req);
      const jwt = req.cookies.HarOnline
      console.log(jwt);
      if (jwt) {
        const secretKey = await createSecretKey(Buffer.from(process.env.JWT_KEY));
        // const secretKey = await generateSecret('HS256');
        const { payload } = await jwtDecrypt(jwt, secretKey);
        if (payload) {
          if (req.body) {
            const { contentPieFilter, ispPieFilter } = req.body;
            const client = new MongoClient(process.env.MONGO_URI);
            await client.connect();
            const db = client.db('WEB');
            const entries = db.collection('Entries');
            const typeQuery = contentPieFilter?.length !== 0 && contentPieFilter !== undefined
              ? { 'response.headers.content-type': { $in: contentPieFilter } }
              : null;

            const ispQuery = ispPieFilter?.length !== 0 && ispPieFilter !== undefined
              ? { serverISP: { $in: ispPieFilter } }
              : null;

            const filter = {
              ...typeQuery,
              ...ispQuery,
            };
            let max;
            let min;
            // console.log('this is the content type', contentType);
            // if (contentType.length === 0) console.log('no params');
            max = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'request.headers.maxStale': { $exists: true } } },
                {
                  $count: 'username',
                },
              ])
              .toArray();
            min = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'request.headers.minFresh': { $exists: true } } },
                {
                  $count: 'username',
                },
              ])
              .toArray();
            let totalCount = await entries.countDocuments();
            min = {
              count: min.username ? (min.username / totalCount) * 100 : 1,
              label: 'MinFresh',
            };
            max = {
              count: max.username ? (max.username / totalCount) * 100 : 1,
              label: 'MaxStale',
            };
            totalCount = {
              label: 'Without',
              count: totalCount - min.count - max.count,
            };
            console.log('Min', min, 'Max', max, 'TotalCount', totalCount);
            if (!min || !max || !totalCount) {
              res.status(404);
              res.json({ message: 'No results found' });
            } else {
              res.status(200);
              res.send([min, max, totalCount]);
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
