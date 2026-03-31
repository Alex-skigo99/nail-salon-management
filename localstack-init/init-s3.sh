#!/bin/bash
set -euo pipefail

BUCKET="nail-salon-images-development"

# Create the bucket (ignore if already exists)
awslocal s3 mb "s3://$BUCKET" 2>/dev/null || true

# Apply CORS configuration
awslocal s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration '{
  "CORSRules": [
    {
      "AllowedOrigins": ["http://localhost:3000", "http://127.0.0.1:3000"],
      "AllowedMethods": ["GET", "PUT", "POST", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3600
    }
  ]
}'

echo "S3 bucket '$BUCKET' created with CORS policy"
