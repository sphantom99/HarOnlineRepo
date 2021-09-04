import { MongoClient } from 'mongodb';
import { createSecretKey } from 'crypto';
import Cookies from 'Cookies';
import { jwtDecrypt } from 'jose/jwt/decrypt';

export default async function getUserStatistics(req, res) {
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
            console.log("payload", payload.username, "body", req.body.username);
            if (payload.username === req.body?.username) {
              const client = new MongoClient(process.env.MONGO_URI);
              await client.connect();
              const db = client.db('WEB');
              const users = db.collection('Users');
              const result = await users.findOne({ username: payload.username });
              console.log(result);

              if (!result) {
                res.status(404);
                res.json({ message: 'No results found' });
              } else {
                res.status(200);
                res.json({
                  lastUploadDate: result.lastUploadDate,
                  totalUploads: result.TotalUploads,
                  firstName: result.firstName,
                  lastName: result.lastName,
                  email: result.email,
                });
              }
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
