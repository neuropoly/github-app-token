import { Buffer } from "node:buffer";
import { getInput, info, setFailed, setOutput, setSecret } from "@actions/core";
import { context } from "@actions/github";
import isBase64 from "is-base64";
import { fetchInstallationToken } from "./fetch-installation-token.js";

const run = async () => {
  try {
    info("Getting inputs");
    const appId = getInput("app_id", { required: true });
    const privateKeyInput = getInput("private_key", { required: true });
    info("got private key");
    const privateKey = isBase64(privateKeyInput)
      ? Buffer.from(privateKeyInput, "base64").toString("utf8")
      : privateKeyInput;
    info("converted private key to binary");

    const installationId = getInput("installation_id");
    const repositoryInput = getInput("repository");
    info("installationId = " + installationId);
    info("repositoryInput = " + repositoryInput);
    const [owner, repo] = repositoryInput
      ? repositoryInput.split("/")
      : [context.repo.owner, context.repo.repo];
    info("owner = " + owner);
    info("repo = " + repo);

    info("trying to get token");
    const installationToken = await fetchInstallationToken({
      appId,
      installationId: installationId ? Number(installationId) : undefined,
      owner,
      privateKey,
      repo,
    });
    info("got token");

    setSecret(installationToken);
    setOutput("token", installationToken);
    info("Token generated successfully!");
  } catch (error: unknown) {
    if (typeof error === "string" || error instanceof Error) {
      setFailed(error);
    } else {
      setFailed(`Caught error of unexpected type: ${typeof error}`);
    }
  }
};

void run();
