echo "generating protos..."

if ! command -v pbjs  &> /dev/null
then
    echo "[ ! ] pbjs is not installed, trying installation"
    npm install -g protobufjs
    if command -v pbjs  &> /dev/null
    then
        echo "[✅] pbjs installed successfully"
    else
        echo "[ X ] Failed to install pbjs."
        exit 1
    fi
fi

pbjs -t static-module -o database.js database.proto
pbts -o database.d.ts database.js

echo "[✅] protos generated successfully"
exit 0