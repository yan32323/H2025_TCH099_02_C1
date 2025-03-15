USE tch056_labo_forum;

CREATE TABLE IF NOT EXISTS usagers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifiant VARCHAR(50) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL
);

INSERT INTO usagers (id, identifiant, mot_de_passe) VALUES
    (1, 'Balfour', '$2a$12$htf9tR5T8RnIp5x3H9i1BOLiuJi/eD/HD5ySVc70ZGOPlz1o76ur6'),             -- Balfour:             Password1
    (2, 'LeagueNations', '$2a$12$tEscx6jhxQIGZL4Zm4P2E.H0uNr9An7M3f9NvDNjmNYVlV01FRB5a'),       -- LeagueNations:       Password2
    (3, 'UNGeneralAssembly', '$2a$12$UQYyYkY8yy96q.cAa3IX5ej2A5OppM3LNNFJaG.R32OrWGWNwAUoy'),   -- UNGeneralAssembly:   Password3
    (4, 'GreatBritain', '$2a$12$eOlQNnALYiDtTfUvk6ohzOIMfeQ.UfbiyGxSv5lM7SuMUhZts7iES'),        -- GreatBritain:        Password4
    (5, 'UNGA', '$2a$12$tm.XRIszaTWTMJLv7gxTFOj7QkY7glNWPjY.BzYS/XFrQ7PSuEY.K'),                -- UNGA:                Password5
    (6, 'SixDayWar', '$2a$12$l6A6/BfvCFVtS5kfSxGrdeqWwnaBoURz1e7Z3YnMQc4sMW4YZ1QaW'),           -- SixDayWar:           Password6
    (7, 'ArabLeague', '$2a$12$YUvOQfLUNOUY0kQ1BKsFJu5Y8yvJLNpMft2Qs8DTgytsBxX4M0w.K'),          -- ArabLeague:          Password7
    (8, 'PalestinianCouncil', '$2a$12$/R474EWi0OLfun1v8DJffeeKqVhC5RwaISDTclo0SEJNDYztm0fy6'),  -- PalestinianCouncil:  Password8
    (9, 'UNSecurityCouncil', '$2a$12$9kElD7qN50Gfcgi1vN0fuO3lQ90EOVBpxQoXmtxuDGSSr0tE6Z/Xe'),   -- UNSecurityCouncil:   Password9
    (10, 'SouthAfrica', '$2a$12$4WB7SIIPB7wDgu8.EKl1R.tvzHNuKcFHk3l11Yh1Kj03LUZcncg8O');        -- SouthAfrica:         Password10

SELECT * FROM usagers;