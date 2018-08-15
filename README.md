# DynamoDB data mover

Move(copy and delete) data for DynamoDB.

## Environment variables

* ``PROFILE``: AWS Account profile name (Enable if specified)
* ``FROM_REGION`` : Origin DynamoDB region.
* ``FROM_TABLE`` : Origin DynamoDB table name.
* ``TO_REGION`` : Target DynamoDB region.
* ``TO_TABLE`` : Target DynamoDB table name.

## Write your own copy code

* ``pickupFromTableKey()`` Pick up the key for delete FROM_TABLE for deletion.
* ``convertData()`` Write here convertion if you need within copying.

## Run (local)

```
npm run execlocal
```

## Deploy and run (e.g. Lambda)

```
npm run make
aws s3 cp ./build/Release/dynamodb-data-move.zip s3://[YOUR_S3_BUCKET]/
aws lambda update-function-code --function-name [YOUR_LAMBDA_FUNCTION_NAME] --s3-bucket [YOUR_S3_BUCKET] --s3-key dynamodb-data-move.zip --publish
```
