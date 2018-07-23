const AWS = require('aws-sdk');

// To specify profile (if you need, e.g. devlocal)
// AWS.config.credentials = new AWS.SharedIniFileCredentials({ profile: process.env.PROFILE });

const { FROM_REGION } = process.env;
const { FROM_TABLE } = process.env;
const { TO_REGION } = process.env;
const { TO_TABLE } = process.env;

const DynamoFrom = new AWS.DynamoDB.DocumentClient({ region: FROM_REGION });
const DynamoTo = new AWS.DynamoDB.DocumentClient({ region: TO_REGION });

// ----------------------------------------

/**
 * Pick up the key for delete FROM_TABLE.
 * @param {object} item - Your data
 * @return {object} For deletion.
 */
const pickupFromTableKey = item => {
  // Sample
  datetime: item.datetime
};

/**
 * Convert your own data from FROM_TABLE to TO_TABLE.
 * @param {object} item - Your data
 * @return {object} Your converted data.
 */
const convertData = (item) => {
  // Sample-----
  const huDatetime = item.datetime;
  const teDatetime = item.datetime;
  return {
    // device: 'Remo1',
    datetime: item.datetime,
    huDatetime,
    humidity: item.humidity,
    teDatetime,
    temperature: item.temperature,
  };
  // -----Sample
};

// ----------------------------------------

/** Dynamo.get(). */
// const dynamoGet = async (TableName, Key) => (await DynamoFrom.get({ TableName, Key }).promise()).Item;

/** Dynamo.query(). */
// const dynamoQuery = async params => DynamoFrom.query(params).promise();

/** Dynamo.scan(). */
const dynamoScan = async params => DynamoFrom.scan(params).promise();

/** Dynamo.batchWrite(). */
const dynamoBatchWrite = async (params) => {
  // Wrap.
  const paramArray = params.map(p => ({ PutRequest: { Item: p } }));
  // Batch write.
  return DynamoTo.batchWrite({
    RequestItems: {
      [TO_TABLE]: paramArray,
    },
  }).promise();
};

/** Dynamo.delete(). */
const dynamoDelete = async (TableName, Key) => DynamoFrom.delete({ TableName, Key }).promise();

/** main */
exports.handler = async (event) => {
  // console.log(JSON.stringify(event));

  let lastEvaluatedKey;
  do {
    // Scan
    const scanned = await dynamoScan({
      TableName: FROM_TABLE,
      Limit: 25, // Dynamo batchWrite limit
      ExclusiveStartKey: lastEvaluatedKey,
    });
    // console.log(scanned);

    // Check
    if (scanned.ScannedCount === 0) {
      break;
    } else {
      lastEvaluatedKey = scanned.LastEvaluatedKey;
    }
    // console.log(`lastEvaluatedKey ${lastEvaluatedKey}`);

    // Convert
    const convertedArray = Array.from(scanned.Items).map(elem => convertData(elem));
    // console.log(convertedArray);

    // Write
    await dynamoBatchWrite(convertedArray);
    // console.log('Write done');

    // Delete
    await Promise.all(convertedArray.map(d => dynamoDelete(FROM_TABLE, pickupFromTableKey(d))));
    // console.log('Delete done');
  } while (true);
};
