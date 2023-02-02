# Localstack POC


## Dev Environment Setup

Commands for passing ssh keys for yarn install.

**Steps:**

1. Create a folder ```.ssh``` in the root of the repo (this is already .gitignored so don't worry)
2. Copy your bitbucket keys from ```%USERPROFILE%/.ssh``` (windows) or ```$HOME/.ssh``` (*nix) folder (2 files: ```id_rsa``` and ```id_rsa.pub```) to the newly created ```.ssh``` folder in repo root in previous step.
3. Get access to ```dev``` container (container name: ```serverless```) defined in [docker-compose.yml](docker-compose.yml) file.
4. In the interactive terminal run the following commands.

```bash
ssh-keyscan -H bitbucket.org >> ~/.ssh/known_hosts
chmod 700 ~/.ssh/id_rsa
chmod 700 ~/.ssh/id_rsa.pub
```

### Cleanup of Dev Environment (when things get messy)

The beauty of ephemeral environments is that they are expandable (you can get rid of the them and recreate them as many times as you like). In order to cleanup we just need to do the following.

1. Run ```docker-compose down``` from repo root to clean up all the networks and containers.
2. Delete the ```.ssh``` folder from repo root.
3. Follow the steps defined in Dev Environment Setup.