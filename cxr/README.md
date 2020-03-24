Create a bucket (e.g. with the console https://console.cloud.google.com/storage)

Convert keras model to tfjs:
```
/sr/python-install/bin/tensorflowjs_converter --input_format keras ./CheXNet_acil_model.h5 ./tfjs_model
```

Upload to the bucket
```
gsutil -m rsync -r modeltest-003-0.894167-0.769167.tfjs/ gs://cxr-models/modeltest-003-0.894167-0.769167.tfjs
```

## be sure to set CORS on the bucket
```
gsutil cors set cors-json-policy.json gs://cxr-models
```

where cors-json-policy.json is:

```
[{"maxAgeSeconds": 3600, "method": ["GET", "HEAD"], "origin": ["*"], "responseHeader": ["Content-Type"]}]
```
