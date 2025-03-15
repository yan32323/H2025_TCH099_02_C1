USE tch056_labo_forum;

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usager INT NOT NULL,
    date_soumission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    contenu TEXT NOT NULL,
    FOREIGN KEY (id_usager) REFERENCES usagers(id)
);

INSERT INTO messages (id, id_usager, date_soumission, contenu) VALUES
    (1, 1, '1917-11-02 14:30:00', '1917: The Balfour Declaration promises a “national home for the Jewish people in Palestine”.'),
    (2, 2, '1922-07-24 08:15:00', '1922: The League of Nations grants mandate over former Ottoman territory Palestine to UK, including terms of the Balfour Declaration.'),
    (3, 3, '1947-11-29 17:00:00', '1947: The UN General Assembly adopts resolution 181(II) which called to divide Palestine into an un-named “Jewish State” and an un-named “Arab State.”'),
    (4, 4, '1948-05-14 12:45:00', '1948: Great Britain terminates the Mandate over Palestine and Israel declares independence on 15 May.'),
    (5, 5, '1949-05-11 22:00:00', '1949: UNGA adopts Resolution 273 (III) admitting Israel as UN member.'),
    (6, 6, '1967-06-05 06:00:00', '1967: Six-day war: Israel occupies West Bank, including East Jerusalem, Gaza, Golan Heights, and Sinai Peninsula.'),
    (7, 7, '1974-11-22 02:15:00', '1974: The UN General Assembly recognizes the PLO as the sole legitimate representative of the Palestinian people.'),
    (8, 8, '1988-11-15 19:30:00', '1988: In Algiers, the Palestinian National Council adopts declaration of independence of the State of Palestine.'),
    (9, 9, '2002-03-28 15:00:00', '2002: The UN Security Council passes resolution 1397 affirming vision of a two-State solution to the conflict.'),
    (10, 10, '2023-10-07 09:45:00', '2023: Israel launches Gaza war following Hamas attack. South Africa initiates a genocide case against Israel at ICJ.');


SELECT * FROM messages;