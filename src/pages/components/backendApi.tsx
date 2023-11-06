// TODO: relocate all api calls to the module.
const ARTIFACTS_ENDPOINT = '/api/faucet/artifacts'

class BackendApiServerError extends Error {}

// TODO: use in-frontend mapping instead.
export const sendGetArtifactsRq = async () => {
    const response = await fetch(ARTIFACTS_ENDPOINT, {
      method: "GET",
    });
    const data = await response.json();
    console.log("Requested " + ARTIFACTS_ENDPOINT + ". Got:", data);
    if (response.status != 200) {
      throw BackendApiServerError
    }

    return data;
};
