
# CECS 543 - Project: Version Control System

## Team PSA
- Sotheanith Sok
- Anthony Martinez
- Chandandeep Thind 
- Prateechi Singh
- Yashua Ovando

## Intro
This is the second iteration of the version control system build by Team PSA. The goal of this iteration is to build upon the strong foundation used in the first iteration. As such, the current version of this system now offers users the ability to create a new repository, commit changes to a repository, check-in any changes made from external folders, check-out changes to an external folder, and label manifest files in repositories using unique identifiers. The new product offers a greater user experience in order to interact with the system.  

### External Requirements:
- Node JS (10.15.1)
- Express (4.16.4) 
- Browserify (16.2.3)
- Check-Types(8.0.2)
- Requests(2.88.0)


### Setup and Installation:
1. Manually install Node JS
2. Run “npm install” to install all necessary dependencies
3. Run “node index.js” to start the application

### Sample Invocation and Results
- Invocation 1 - Initialize the project and open repository
  -  Start the application by running “node inde.js” from a command line
  -  Open your favorite browsers
  -  Go to: http://localhost:3000/
  -  Enter the directory in the field provided
  -  Press “Open folder”
- Invocation 1- Result:  a hidden folder name “.PSA” will be created inside the source directory. This folder will contain artifacts, folder structure of the source directory, and the manifest file.  Then the user will be directed to a controller pages

- Invocation 2 - Commit changes to an existing repository
  -  Start the application by running “node inde.js” from a command line
  -  Open your favorite browsers
  -  Go to: http://localhost:3000/
  -  Enter the directory in the field provided
  -  Press “Open folder”
  -  Hover over the “Action” drop-down menu
  -  Click “Commit”
- Invocation 2 - Result: The artifacts, folder structures, and the manifest file, in the “.PSA” folder,” will be updated to reflect the latest change in the source directory. Also, a new commit manifest will be created.  

- Invocation 3 - Checkout
  -  Start the application by running “node inde.js” from a command line
  -  Open your favorite browsers
  -  Go to: http://localhost:3000/
  -  Enter the directory in the field provided
  -  Press “Open folder”
  -  Hover over the “Action” drop-down menu
  -  Click “Checkout”
  -  Provide a target directory in the field provided
  -  Click “Checkout”
- Invocation 3 - Result: Everything in the source directory will be copied to the target directory. A checkout manifest will be created in the source directory. Then the target directory will get initialized. 

- Invocation 4 - Checkin
  -  Start the application by running “node inde.js” from a command line
  -  Open your favorite browsers
  -  Go to: http://localhost:3000/
  -  Enter the directory in the field provided
  -  Press “Open folder”
  -  Hover over the “Action” drop-down menu
  -  Click “Checkin”
  -  Provide a source directory in the field provided
  -  Click “Checkin”

- Invocation 4 - Result: Everything in the source directory will be copied to the current directory. A check-in manifest and a commit manifest will be created in the current directory.

- Invocation 5 - Edit label
  - Start the application by running “node inde.js” from a command line
  - Open your favorite browsers
  - Go to: http://localhost:3000/
  - Enter the directory in the field provided
  - Press “Open folder”
  - Press the “fas fa-pen” button next to the manifest that you want to edit its tag
  - Provide a new tag in the field provided
- Invocation 5 - Result: A manifest will be updated to its new label.  

# Included
  - Create a new repository
  - Commit a new iteration to the repository
  - Branching system
  - Collaboration system
  - Contribution history of collaborators
  - Support for different file formats


## Known Issues
None

## Original Project Setup 
https://github.com/sotheanith/CECS-543-VCS
