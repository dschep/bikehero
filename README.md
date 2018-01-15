# Serverless Python Template

This repo is intended as a better alternative to the built-in AWS Python
templates in [serverless](https://github.com/serverless/serverless).

## What's included?
This template includes a few of my favorite things for working with Python &
Serverless:

 * ⚡️🐍📦 [serverless-python-requirements](https://github.com/UnitedIncome/serverless-python-requirements)
 * 🐍λ✨ [lambda-decorators](http://lambda-decorators.rtfd.io)
 * ✨🍰✨ [pipenv](https://docs.pipenv.org)

It also has a tweaked `serverless.yml` file featuring:
 * A better iam example - resources needed for using SSM Parameter store!
 * Add custom secion with useful workarounds sls var limitations
 * A few other minor tweaks

## Getting started
```
$ # if you don't have them installed, ensure you have serverless & pipenv
$ npm i -g serverless ; pip install pipenv
$ # Clone the template using the
$ serverless install -u https://github.com/dschep/sls-py-tmpl -n project-name
Serverless: Downloading and installing "sls-py-tmpl"...
Serverless: Successfully installed "project-name" 
$ cd project-name
$ # Create virtualenv and install dependencies
$ pipenv install
Creating a virtualenv for this project…
Using /usr/bin/python3.6m to create virtualenv…
⠋Running virtualenv with interpreter /usr/bin/python3.6m
Using base prefix '/usr'
New python executable in /home/dschep/.local/share/virtualenvs/sls-py-tmpl-bdJKnR1O/bin/python3.6m
Also creating executable in /home/dschep/.local/share/virtualenvs/sls-py-tmpl-bdJKnR1O/bin/python
Installing setuptools, pip, wheel...done.]

Virtualenv location: /home/dschep/.local/share/virtualenvs/sls-py-tmpl-bdJKnR1O
Installing dependencies from Pipfile.lock (c44045)…
  🐍   ▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉ 1/1 — 00:00:00
To activate this project's virtualenv, run the following:
 $ pipenv shell

$ # Test the sample lambda locally (sls is an included alias for serverless)
$ pipenv run sls invoke local -f hello
{
    "statusCode": 200,
    "body": "{\"message\": \"Go Serverless v1.0! Your function executed successfully!\", \"input\": {}}"
}
$ # Deploy to AWS!
$ sls deploy
Serverless: Generating requirements.txt from Pipfile...
Serverless: Installing required Python packages with python3.6...
Serverless: Linking required Python packages...
Serverless: Packaging service...
Serverless: Excluding development dependencies...
Serverless: Unlinking required Python packages...
Serverless: Uploading CloudFormation file to S3...
Serverless: Uploading artifacts...
Serverless: Uploading service .zip file to S3 (19.72 KB)...
Serverless: Validating template...
Serverless: Updating Stack...
Serverless: Checking Stack update progress...
.........
Serverless: Stack update finished...
Service Information
service: project-name
stage: dev
region: us-east-1
stack: project-name-dev
api keys:
  None
endpoints:
  None
functions:
  hello: project-name-dev-hello
$ # Invoke!
$ sls invoke -f hello
{
    "statusCode": 200,
    "body": "{\"message\": \"Go Serverless v1.0! Your function executed successfully!\", \"input\": {}}"
}
```
