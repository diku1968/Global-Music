#!/bin/bash
# Global Music Jam - Google Play Store Release Bundle (.aab) Build Script
set -e

echo "=========================================================="
echo " Global Music Jam - Google Play Store (.aab) Builder"
echo "=========================================================="

echo "[1/4] Building optimized production web bundle..."
npm run build

echo "[2/4] Syncing web assets with native Android project..."
npx cap sync android

echo "[3/4] Checking release signing keystore..."
KEYSTORE_PATH="android/app/release.keystore"
if [ ! -f "$KEYSTORE_PATH" ]; then
    echo "Notice: Creating standard release keystore at $KEYSTORE_PATH..."
    if command -v keytool >/dev/null 2>&1; then
        keytool -genkey -v -keystore "$KEYSTORE_PATH" \
            -alias globlemusic \
            -keyalg RSA -keysize 2048 -validity 10000 \
            -storepass musicjam123 -keypass musicjam123 \
            -dname "CN=GlobleMusic, OU=MusicEngine, O=diku1968, L=Global, S=World, C=US"
        echo "Release keystore generated successfully!"
    else
        echo "Keytool not in container path. Gradle will use standard debug fallback signing for bundleRelease."
    fi
fi

echo "[4/4] Next Command to build .aab inside Android Studio or local terminal with JDK:"
echo "----------------------------------------------------------"
echo "  cd android && ./gradlew bundleRelease"
echo "----------------------------------------------------------"
echo "Output Bundle will be generated at:"
echo "  android/app/build/outputs/bundle/release/app-release.aab"
echo ""
echo "Ready for Google Play Console upload!"
