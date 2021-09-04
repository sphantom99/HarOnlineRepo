import { createSecretKey } from 'crypto';
import Cookies from 'Cookies';
import { jwtDecrypt } from 'jose/jwt/decrypt';

export default async function login(req, res) {
  try {
    if (req.method === 'POST') {
      // console.log('it was a post method');
      // console.log(req);

      const cookies = Cookies(req, res);
      const jwt = cookies.get('HarOnline');
      // validate
      if (jwt) {
        const secretKey = await createSecretKey(Buffer.from(process.env.JWT_KEY));
        // const secretKey = await generateSecret('HS256');
        const { payload } = await jwtDecrypt(jwt, secretKey);
        if (payload.username) {
          cookies.set('HarOnline', '', { expires: Date.now() });
          res.status(200);
          res.json({ message: 'ok' });
        } else {
          res.status(400);
          res.json({ message: 'Invalid Cookie Format' });
        }
      } else {
        res.status(401);
        res.json({ message: 'Not Authorized' });
      }
    } else {
      res.status(406);
      res.json({ message: 'Bad Method' });
    }
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json({ message: 'error occured' });
  }
}
