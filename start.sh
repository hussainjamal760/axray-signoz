#!/bin/bash
set -e

echo "====================================================="
echo "   🚀 AXRAY + SigNoz: Zero-Friction Startup Script   "
echo "====================================================="

# 1. Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH."
    echo "Please install Docker Desktop and start it, then try again."
    exit 1
fi

# 2. Check for .env files
if [ ! -f "apps/server/.env" ]; then
    echo "⚠️  apps/server/.env not found! Creating from example if exists..."
    if [ -f "apps/server/.env.example" ]; then
        cp apps/server/.env.example apps/server/.env
        # Auto-inject MONGO_URI if it's missing or empty
        if ! grep -q "MONGO_URI=" "apps/server/.env"; then
            echo "MONGO_URI=mongodb://localhost:27017/axray" >> apps/server/.env
        else
            sed -i 's|^MONGO_URI=.*|MONGO_URI=mongodb://localhost:27017/axray|' apps/server/.env
        fi
        echo "✅ Created apps/server/.env and set MONGO_URI. PLEASE EDIT IT and add your GROQ_API_KEY before running this script again."
        exit 1
    else
        echo "❌ .env.example not found. Please create apps/server/.env with GROQ_API_KEY and MONGO_URI."
        exit 1
    fi
fi

if ! grep -q "GROQ_API_KEY" "apps/server/.env" || grep -q "your_groq_api_key" "apps/server/.env"; then
    echo "❌ GROQ_API_KEY is not set in apps/server/.env. Please add a valid key."
    exit 1
fi

if [ ! -f "apps/web/.env.local" ]; then
    echo "⚠️  apps/web/.env.local not found! Creating default..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > apps/web/.env.local
    echo "NEXT_PUBLIC_SIGNOZ_URL=http://localhost:8080" >> apps/web/.env.local
    echo "✅ Created apps/web/.env.local"
fi

# 3. Start MongoDB if not running (AXRAY requires MongoDB)
echo "-----------------------------------------------------"
echo "🗄️  Starting MongoDB for AXRAY Data Store..."
if ! docker ps | grep -q axray-mongo; then
    docker run -d -p 27017:27017 --name axray-mongo mongo:latest > /dev/null 2>&1 || true
    docker start axray-mongo > /dev/null 2>&1 || true
    echo "✅ MongoDB is running on port 27017."
else
    echo "✅ MongoDB is already running."
fi

# 4. Install Foundryctl (SigNoz Manager)
echo "-----------------------------------------------------"
echo "⚙️  Checking SigNoz Foundry..."
if ! command -v foundryctl &> /dev/null; then
    echo "Downloading and installing foundryctl..."
    curl -fsSL https://signoz.io/foundry.sh | bash
    # Source the profile so it's available in this script
    export PATH="$HOME/.local/bin:$PATH"
fi
echo "✅ foundryctl is ready."

# 5. Deploy SigNoz
echo "-----------------------------------------------------"
echo "🛰️  Deploying SigNoz via Foundry..."
foundryctl cast --file deploy/casting.yaml

# Wait for SigNoz to be healthy
echo "⏳ Waiting for SigNoz to come up on localhost:8080 (this may take a few minutes)..."
until curl -s -o /dev/null http://localhost:8080; do
    printf "."
    sleep 5
done
echo -e "\n✅ SigNoz is UP and running!"

# 6. Install PNPM dependencies
echo "-----------------------------------------------------"
echo "📦 Installing AXRAY Dependencies (pnpm)..."
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm
fi
pnpm install

# 7. Inject Dashboards and Alerts
echo "-----------------------------------------------------"
echo "💉 Injecting AXRAY Dashboards & Alert Rules into SigNoz..."
node deploy/import-signoz-local.js

# 8. Start AXRAY
echo "-----------------------------------------------------"
echo "🚀 Starting AXRAY Frontend & Backend..."
echo "Dashboard will be available at: http://localhost:3000"
echo "SigNoz UI is available at:      http://localhost:8080"
echo "====================================================="
pnpm dev
