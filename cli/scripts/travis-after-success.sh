# Fail the build if this step fails
set -e

# Necessary to stop pull requests from forks from running outside of Savage
# Build the library.
if [[ "$TRAVIS_SECURE_ENV_VARS" == "true" && -n "$TRAVIS_TAG" ]]; then
  skyux release
  cd dist
fi
