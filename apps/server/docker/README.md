# AXRAY Universal Workspace Docker Image

This Dockerfile builds the universal, runtime-agnostic base container image (`axray-workspace:latest`) used for provisioning session workspaces.

---

## Included Utilities

- **Source Control & Shell**: `git`, `bash`, `openssh-client`
- **Networking & Data**: `curl`, `wget`, `ca-certificates`, `jq`
- **Developer Runtimes**: `nodejs`, `npm`, `python3`, `py3-pip`, `make`, `g++`

---

## Build Image

Run from the repository root:

```bash
docker build -t axray-workspace -f apps/server/docker/workspace.Dockerfile .
```

---

## Verify Installation

Check that the image is available in local Docker:

```bash
docker images axray-workspace
```

Output should show `axray-workspace` with tag `latest`.
