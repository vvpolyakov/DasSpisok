create table user (
    id	int primary key auto_increment,
    name	text,
    login	text,
    password	text
);

create table session(
    sid text,
    user int
);

create table spisok (
    id	int primary key auto_increment,
    user 	int,
    name	text,
    data	text,
    dt		timestamp
);
