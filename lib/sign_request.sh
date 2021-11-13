set -euo pipefail

echo -n $1 | openssl dgst -sha256 -sign ~/.ssh/ynabunq/ynabunq.pem | base64
