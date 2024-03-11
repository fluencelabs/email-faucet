import { Artifacts } from "./pages/api/faucet/artifacts";

const ARTIFACTS_ENDPOINT = '/api/faucet/artifacts'
const TOKEN_ENDPOINT = '/api/faucet/tokens'

class BackendApiServerError extends Error {}

// TODO: use in-frontend mapping instead.
export const sendGetArtifactsRq = async (): Promise<Artifacts> => {
    const response = await fetch(ARTIFACTS_ENDPOINT, {
        method: "GET",
    });
    const data = await response.json();
    console.log("Requested " + ARTIFACTS_ENDPOINT + ". Got:", data);
    if (response.status != 200) {
        throw new BackendApiServerError(`Error ${response.status}: ${data.error}`);
    }

    return data;
};

export const sendPostTokenRq = async (address: string) => {
    const response = await fetch(TOKEN_ENDPOINT + `?address=${address}`, {method: "POST"});
    let data: Record<string, any>;
    try {
      data = await response.json();
    } catch (e: any) {
        console.error(e);
        throw new BackendApiServerError("Failed to parse api response");
    }
    console.log("Requested " + TOKEN_ENDPOINT + ". Got: ", data);

    if (response.status != 200) {
        throw new BackendApiServerError(data.error);
    }

    return data;
}
