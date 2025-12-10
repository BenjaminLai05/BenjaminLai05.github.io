# Template Repository for COMP SCI 2207/7207 Web & Database Computing (2023 Semester 1)

Contains environment files for WDC 2023. Copy this template for a general sandbox.

Auto commit/push/sync to Github is disabled by default in this template repository.
Enable the GitDoc extension to use this fucntionality (either in your VSCode settings, or in the Dev Container settings)

To load Database;
mysql < webapp_database.sql

Login detail for nodeMailer emails; <br/>
Username: alliumnotifications@gmail.com <br/>
Password: WDCwebapp2024@

Used libraries; <br/>
npm install express cookie-parser morgan express-session validator multer express-slow-down

Notes;
Passwords are case-sensitive, everything else is not.
If you want to test NodeMailer you will need to sign up with a valid email, subscribe to an organization and post as a manager in said organization (Admins are automatically managers for every organization)

If landing_page.html displays loading... for too long restart the server, 
(unreproducible bug, varies from system to system, tried to mitigate this by adding delays in responses, but slower computers still suffer)

Important Logins;

## ADMIN LOGIN; <br/>
Username: admin <br/>
Password: AdminPassword0 


## MANAGER LOGIN; (There are Others) <br/>
Username: georgew <br/>
Password: password7


# Features <br/>
## Guest;

  -Can view organizations and public events and sign up.
  
  -Can view managers of an organization.
    
## Users;

  -Can do everything a Guest can.
  
  -Can join/leave organizations.
  
  -Can attend events, and recieve emails from specific organizations on the creation of a new event/update.
  
  -Can edit/delete their profile (Differing options for Google Users).

## Managers;

  -Can do everything a User can.
  
  -**If** they are a manager of an organization (assigned by admins)
  
  -They can make events/updates (Public or Member Only)
    
  -Delete and edit events/updates
    
  -Remove members
    
  -View members who are attending Events

## Admins;

  -Can do everything a Manager can (for all organizations)
  
  -Edit/Delete All Users (includes making them managers/admins and making them managers of specific organizations)
  
  -Can Edit/Delete/Manage Organizations
  
  -Can create Organizations
    

