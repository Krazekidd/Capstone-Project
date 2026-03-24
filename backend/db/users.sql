CREATE DATABASE users;
USE users;

CREATE TABLE Clients(
    clientID INT AUTO_INCREMENT PRIMARY KEY,
    clientName VARCHAR[40],
    clientEmail VARCHAR[40],
    clientPhoneNumber VARCHAR[10],
    clientHeight VARCHAR[10],
    clientWeight VARCHAR[10],
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);


CREATE TABLE Trainers(
    trainerID INT AUTO_INCREMENT PRIMARY KEY,
    trainerName VARCHAR[40],
    trainerEmail VARCHAR[40],
    trainerCertification VARCHAR[20],
    trainerRating FLOAT,
    trainerLevel FLOAT,
    isSenior BOOLEAN,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

CREATE TABLE Admins(
    adminID INT AUTO_INCREMENT PRIMARY KEY,
    adminName VARCHAR[40],
    adminEmail VARCHAR[40],
    adminPhoneNumber VARCHAR[10],
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP
);

-- Test Clients
INSERT INTO Clients(clientID,clientName,clientEmail,clientPhoneNumber,clientHeight,clientWeight,createdAt,updatedAt) VALUES ('1','Joe Hanson','johandson@outlook.com','8769983264','158','189','','')
INSERT INTO Clients(clientID,clientName,clientEmail,clientPhoneNumber,clientHeight,clientWeight,createdAt,updatedAt) VALUES ('2','Peter Lincoln','plincoln@gmail.com','8769983264','193','164','','')
INSERT INTO Clients(clientID,clientName,clientEmail,clientPhoneNumber,clientHeight,clientWeight,createdAt,updatedAt) VALUES ('3','Merry Smith','smirth@icloud.com','8761157976','258','192','','')

-- Test Trainers
INSERT INTO Clients(trainerID,trainerName,trainerEmail,trainerCertification,trainerRating,trainerLevel,isSenior,createdAt,updatedAt) VALUES ('1','Sherice Myers','smyers@gmail.com','Good','3.8','2.6','FALSE','','')
INSERT INTO Clients(trainerID,trainerName,trainerEmail,trainerCertification,trainerRating,trainerLevel,isSenior,createdAt,updatedAt) VALUES ('2','Ashton Hall','ashtHall@gmail.com','Excellent','4.8','4.9','TRUE','','')

-- Test Admin
INSERT INTO Admins(adminID,adminName,adminEmail,adminPhoneNumber,createdAt.updatedAt) VALUES ('1','Chelsea Montgomery','chmontgmery@gmail.com','8769841653','','')