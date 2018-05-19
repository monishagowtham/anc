# /config
 This folder contains a script that sets up the local environment variables. This allows system-wide configuration that persists when you update the code, but still allows development environments to have separate configuration from production. The script is a bash script, so if you're on Windows, you should run it inside a bash terminal, like Git Bash.

# /doc
This folder contains documentation for the program. (Meta, huh?)

# /src
This folder contains all the source code for the Website

  ## /src/api
  This folder contains node.js files pertaining to the API.

    ### /src/api/helpers.js
    This file contains helper functions to be used in the API actions.

    ### /src/api/index.js
    This file contains all api actions exposed by the Express server. It also creates the Express server, but that should probably be refactored out into ../index.js.

    ### /src/api/neo4j.js
    This file provides an abstraction layer for the conection to the Neo4J database to decrease clutter in ./index.js.

  ## /src/app
  This folder contains the frontend AngularJS application.

    ### /src/app/scripts
    This folder contains all of the scripts for the AngularJS application.

      #### /src/app/scripts/______Controller.js
      Controllers for views in the AngularJS application.

      #### /src/app/scripts/app.js
      Defines the main AngularJS app module used throughout the application.

      #### /src/app/scripts/expressFactory.js
      AngularJS service used to create API calls in the AngularJS controllers. It simplifies code in the controllers in order to allow different addresses on development and production servers.

      #### /src/app/scripts/loginFactory.js
      AngularJS service used to maintain login state and functions across multiple controllers.

      #### /src/app/scripts/routes.js
      Defines frontend routes to determine which view to place in template.html.

      #### /src/app/scripts/titleService.js
      AngularJS service to help with setting the page title for different routes.

    ### /src/app/styles
    CSS for the frontend is placed here.

    ### /src/app/views
    Frontend views. Partial HTML files to be inserted into template.html to create webpages.

    ### /src/app/favicon.ico
    The favicon for the website.

    ### /src/app/template.html
    Template html page for the website. When any non-API page is loaded, this page is loaded with the current view inserted into its .main-content div.

  ## /src/assets
  The internal file structure of this folder is exposed directly on the website. Place images, sounds, videos, and other assets in this folder to be able to access them on the frontend.

  ## /src/node_modules
  This is where npm puts all the packages you install with it. The backend route maps some of these packages to the frontend whenever third-party libraries are needed.

    ### /src/node_modules/bcrypt
    This is the package we use for encrypting passwords. It has a bug that means it must be reinstalled fresh if the repository is moved to a different OS or architecture, so we exclude it using our .gitignore. If you copy and paste the code from elsewhere and it is crashing because of bcrypt, delete the bcrypt repository, and run `npm install` to reinstall all dependencies. If you clone the repository to a computer, bcrypt won't be included, so run `npm install` from inside /src to install all missing dependencies.

  ## /src/.env
  This is where your local configuration is stored if you run the setup script. If you don't run the setup script, default values will be used. This file is ignored by git (it's in the .gitignore), so you can safely experiment with different settings on your development server without affecting production.

  ## /src/.gitignore
  This is a file containing a list of patterns. Each file in this directory or its subdirectories matching the pattern will be ignored from the repository.

  ## /src/index.js
  This is the main entry point for the server. Backend routes other than API routes are defined here. These map URLs entered by users to files stored on the backend. This allows the backend to contain code that is not visible by website users. Ideally, the Express server should be refactored to be created here, and the routes should be refactored to be created in a separate file. It also contains the code to listen over http or https. If it listens over https, it also listens over http to redirect to https.

  ## /src/package-lock.json
  This file is used by npm to avoid breaking itself. Sometimes you'll have to delete this file if you do something wrong and break something with npm. Usually you can just disregard this file, though.

  ## /src/package.json
  This file is used bby npm to track dependencies for the project. This is how it knows what packages to install if we delete some packages from node_modules and run `npm install` to reinstall them.  Usually you can disregard this file.

# /.gitignore
This is a file containing a list of patterns. Each file in this directory or its subdirectories matching the pattern will be ignored from the repository.

# /README.md
This file provides a brief description of the repository.

# /test
This directory contains all tests for the application. (There are currently none, but if you write any, put them there)
