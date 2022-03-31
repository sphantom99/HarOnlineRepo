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
            const {
              dayFilter, contentTypeFilter, methodFilter, ispFilter,
            } = req.body;
            const client = new MongoClient(process.env.MONGO_URI);
            await client.connect();
            const db = client.db('WEB');
            const entries = db.collection('Entries');
            const typeQuery = contentTypeFilter?.length !== 0 && contentTypeFilter !== null
              ? { 'response.headers.content-type': { $in: contentTypeFilter } }
              : null;
            const dayQuery = dayFilter?.length !== 0
            && dayFilter !== null ? { day: { $in: dayFilter } } : null;
            const methodQuery = methodFilter?.length !== 0 && methodFilter !== null
              ? { 'request.method': { $in: methodFilter } }
              : null;
            const ispQuery = ispFilter?.length !== 0 && ispFilter !== null
              ? { serverISP: { $in: ispFilter } }
              : null;
            const filter = {
              ...typeQuery,
              ...dayQuery,
              ...methodQuery,
              ...ispQuery,
            };
            console.log(filter);
            const result = await entries
              .aggregate([
                { $match: filter },
                {
                  $group: {
                    _id: '$hour',
                    averageTime: { $avg: '$timings' },
                  },
                },
              ])
              .toArray();
            console.log(result);
            if (!result) {
              res.status(404);
              res.json({ message: 'No results found' });
            } else {
              //   console.log(result);
              res.status(200);
              res.send(result);
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
