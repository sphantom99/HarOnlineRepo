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
            const { pie2ContentFilter, pie2IspFilter } = req.body;
            const client = new MongoClient(process.env.MONGO_URI);
            await client.connect();
            const db = client.db('WEB');
            const entries = db.collection('Entries');
            const typeQuery = pie2ContentFilter?.length !== 0 && pie2ContentFilter !== undefined
              ? { 'response.headers.content-type': { $in: pie2ContentFilter } }
              : null;

            const ispQuery = pie2IspFilter?.length !== 0 && pie2IspFilter !== undefined
              ? { serverISP: { $in: pie2IspFilter } }
              : null;

            const filter = {
              ...typeQuery,
              ...ispQuery,
            };
            let publicCache;
            let privateCache;
            let noCache;
            let noStore;
            // console.log('this is the content type', contentType);
            // if (contentType.length === 0) console.log('no params');
            publicCache = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'response.headers.public': { $exists: true } } },
              ])
              .toArray();
            privateCache = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'response.headers.private': { $exists: true } } },
              ])
              .toArray();
            noCache = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'response.headers.no-cache': { $exists: true } } },
              ])
              .toArray();
            noStore = await entries
              .aggregate([
                {
                  $match: filter,
                },
                { $match: { 'response.headers.no-store': { $exists: true } } },
              ])
              .toArray();
            publicCache = {
              label: 'Public',
              count: publicCache.length,
            };
            privateCache = {
              label: 'Private',
              count: privateCache.length,
            };
            noCache = {
              label: 'No-Cache',
              count: noCache.length,
            };
            noStore = {
              label: 'No-Store',
              count: noStore.length,
            };
            const result = [publicCache, privateCache, noStore, noCache];
            if (!result) {
              res.status(404);
              res.json({ message: 'No results found' });
            } else {
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
