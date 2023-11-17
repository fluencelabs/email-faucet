const ARTIFACTS_ENDPOINT = '/api/faucet/artifacts'
const TOKEN_ENDPOINT = '/api/faucet/tokens'

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

export const sendPostTokenRq = async (address: string) => {
    const response = await fetch(TOKEN_ENDPOINT + `?address=${address}`, {method: "POST"});
    const data = await response.json();
    console.log("Requested " + TOKEN_ENDPOINT + ". Got: ", data);

    if (response.status != 200) {
        alert(data.error);
        throw BackendApiServerError
    }

    return data;
}
