/* eslint-disable consistent-return */
import { MongoClient } from 'mongodb';

export default async function getAdminStats() {
  const client = await MongoClient.connect(process.env.MONGO_URI, { useNewUrlParser: true }).catch(
    (err) => {
      console.log(err);
    },
  );

  if (!client) {
    return;
  }
  // a. Το πλήθος των εγγεγραμμένων χρηστών
  // b. Το πλήθος των εγγραφών στη βάση ανά τύπο (μέθοδο) αίτησης
  // c. Το πλήθος των εγγραφών στη βάση ανά κωδικό (status) απόκρισης
  // d. Το πλήθος των μοναδικών domains που υπάρχουν στη βάση
  // e. Το πλήθος των μοναδικών παρόχων συνδεσιμότητας που υπάρχουν στη βάση
  // f. Τη μέση ηλικία των ιστοαντικειμένων τη στιγμή που ανακτήθηκαν, ανά CONTENT-TYPE
  try {
    const db = client.db('WEB');
    const collection = db.collection('Entries');
    const collectionUsers = db.collection('Users');

    const disDom = await collection.distinct('request.url');
    const disIsp = await collection.distinct('serverISP');
    console.log(disDom, disIsp);
    const distinctDomains = disDom.length;
    const distinctIsps = { count: disIsp.length, unique: disIsp };
    const entryPerMethod = await collection
      .aggregate([
        {
          $group: {
            _id: '$request.method',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const entryPerStatus = await collection
      .aggregate([
        {
          $group: {
            _id: '$response.status',
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();
    const usersCount = await collectionUsers.find().count();
    const averageTiming = await collection
      .aggregate([
        {
          $group: {
            _id: '$response.headers.content-type',
            requests: { $sum: 1 },
            averageTime: { $avg: '$timings' },
          },
        },
      ])
      .toArray();
    console.log(usersCount);
    console.log(averageTiming);
    return {
      entryPerMethod,
      entryPerStatus,
      distinctDomains,
      distinctIsps,
      usersCount,
      averageTiming,
    };
  } catch (err) {
    console.log(err);
  }
}
