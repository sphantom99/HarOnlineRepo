import { createSecretKey } from "crypto";
import Cookies from "Cookies";
import { jwtDecrypt } from "jose/jwt/decrypt";
import { MongoClient } from "mongodb";
import moment from "moment";

export default async function processedUpload(req, res) {
  try {
    if (req.method === "POST") {
      // console.log('it was a post method');
      // console.log(req);

      const jwt = req.cookies.HarOnline
      console.log(jwt);
      if (jwt) {
        const secretKey = await createSecretKey(
          Buffer.from(process.env.JWT_KEY)
        );
        // const secretKey = await generateSecret('HS256');
        const { payload } = await jwtDecrypt(jwt, secretKey);
        if (payload.username) {
          const client = new MongoClient(process.env.MONGO_URI);
          await client.connect();
          const db = client.db("WEB");
          const entries = db.collection("Entries");
          const users = db.collection("Users");
          if (req.body.data) {
            const result = await entries.bulkWrite(
              // eslint-disable-next-line no-eval
              eval(req.body.data).map((entry) => ({
                insertOne: { document: { ...entry } },
              }))
            );
            // eslint-disable-next-line no-unused-vars
            const resultUpdateUser = await users.updateOne(
              { username: payload.username },
              {
                $set: { lastUploadDate: moment().format("DD/MM/YYYY") },
                $inc: { TotalUploads: 1 },
              }
            );
            if (result.ok) {
              res.status(200);
              res.json({ message: "OK" });
            } else {
              res.status(500);
              res.json({ message: "Error" });
            }
          }
        }
        res.status(406);
        res.json({ message: "User Not Found" });
      }
    } else {
      res.status(500);
      res.json({ message: "Error" });
    }
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send();
  }
}
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "250mb",
    },
  },
};
