echo  -e " 
 ___  _ __   ___ _ __  
 / _ \| '_ \ / _ \ '_ \ 
| (_) | |_) |  __/ | | |
 \___/| .__/ \___|_| |_|
      |_|               

open source project installer
"

echo "Checking if pnpm is installed..."

if ! command -v pnpm &> /dev/null
then
    echo "[ ! ] pnpm is not installed, trying installation"

    if ! command -v node &> /dev/null
    then
        echo "[ X ] nodejs is not installed. please install nodejs first"
        exit 1
    fi

    npm install -g pnpm

    if command -v pnpm &> /dev/null
    then
        echo "[✅] pnpm installed successfully"
    else
        echo "[ X ] Failed to install pnpm."
        exit 1
    fi
else
    echo '[✅] pnpm already installed'
fi
# Import dependencies
echo "Importing dependencies..."
pnpm import

# Install dependencies
echo "Installing dependencies..."
pnpm install



echo "Script finished. Press any key to exit..."
read -n 1 -s -r -p ""
exit 0