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
      console.log(jwt);
      if (jwt) {
        const secretKey = await createSecretKey(
          Buffer.from(process.env.JWT_KEY),
        );
        // const secretKey = await generateSecret('HS256');
        const { payload } = await jwtDecrypt(jwt, secretKey);
        res.json({ username: payload.username, isAdmin: payload.isAdmin });
      }
    } else {
      res.status(406);
      res.json({ message: 'User Not Found' });
    }
  } catch (err) {
    console.log(err);
    res.status(500);
    res.send();
  }
}
