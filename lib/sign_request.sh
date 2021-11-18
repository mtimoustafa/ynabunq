set -euo pipefail

openssl dgst -sha256 data.txt > hash
openssl rsautl -sign -inkey ~/.ssh/ynabunq/ynabunq.pem -keyform PEM -in hash > signature
base64 signature
