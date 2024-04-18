# Apollo's Arcade
This is the public repository for [Apollo's Arcade](https://www.apollosarcade.com). Please find instructions to install and run website locally below.

## Dependencies
- [Python 3.X](https://www.python.org/downloads/)
- [Node.js](https://nodejs.org/en/download)

## Download and Install
Please clone this repository to your local machine and open a terminal.

Change directory to local repo:

`$ cd <path-to-local-repository>/apollosarcade/`

*We want to use this path as the root of our project*

Create a virtual environment:

`$ python3 -m venv venv`

*This will create a virtual environment to run the application out of*

Activate environment:

- Windows

    `$ venv\Scripts\activate`

- Unix or macOS:

    `$ source venv/bin/activate`

*Depending on operating system, we use this command to activate or 'login' to our virtual environment*

Install Python dependencies (including Django):

`$ pip install -r requirements.txt`

*Once we're in the virtual environment, let's install all of the different libraries needed to run the application. These include Django, Channels, server releated dependencies, and much more. Take a look at 'requirements.txt' for the extensive list*

Install Node dependencies

`$ npm install`

*This will install primarily, two Node libraries: Typescript and Webpack*

# Run

If needed, prep the shell script 'build_start.sh' so it may be executable

`$ chmod +x ./build_start.sh`

*This command will allow the script to be ran*

Run the script:

`$ ./build_start.sh`

*This script kicks off a series of commands that will run a Node build `npm run build` to compile Typescript via Webpack and arrange bundles as described in the 'webpack-config.js' file. Once that finishes, we then collect all static files for service and run the server*

# Check it out
Go to [localhost](localhost:8000/) and see the application running!