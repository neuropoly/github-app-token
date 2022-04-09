import { env } from "node:process";
import { getInput, info, setFailed, setOutput, setSecret } from "@actions/core";
import { getOctokit } from "@actions/github";
import { createAppAuth } from "@octokit/auth-app";
import { request } from "@octokit/request";

export const fetchInstallationToken = async ({
  appId,
  installationId,
  owner,
  privateKey,
  repo,
}: Readonly<{
  appId: string;
  installationId?: number;
  owner: string;
  privateKey: string;
  repo: string;
}>): Promise<string> => {
  info("env.GITHUB_API_URL = " + env.GITHUB_API_URL);
  info("calling createAppAuth()");
  const app = createAppAuth({
    appId,
    privateKey,
    request: request.defaults({
      // GITHUB_API_URL is part of GitHub Actions' built-in environment variables.
      // See https://docs.github.com/en/actions/reference/environment-variables#default-environment-variables.
      baseUrl: env.GITHUB_API_URL,
    }),
  });
  info("Got app back: " + app);

  if (installationId === undefined) {
    info("call app() with type app");
    const authApp = await app({ type: "app" });
    info("call getOctokit()");
    const octokit = getOctokit(authApp.token);
    info("call getRepoInstallation(" + owner + "," + repo + ")");
    ({
      data: { id: installationId },
    } = await octokit.rest.apps.getRepoInstallation({ owner, repo }));
  }

  info("call app() again, with " + installationId)
  const installation = await app({ installationId, type: "installation" });
  return installation.token;
};
