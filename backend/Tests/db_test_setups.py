from models import *
from datetime import datetime

def testDB_1(db):
    game_tag        = Tag(name = "Game")
    cooking_tag     = Tag(name = "Cooking")
    hardware_tag    = Tag(name = "Hardware")

    db.add(game_tag)
    db.add(cooking_tag)
    db.add(hardware_tag)

    Organization1 = Organization(name = "Stark Industries", 
                                 location = "New York")

    db.add(Organization1)

    unopic1 = Picture(path = "Uno.jpg")
    unopic2 = Picture(path = "Uno2.jpg")
    uno1 = PhysicalObject(  inv_num_internal = 1, 
                            inv_num_external = 1,
                            pictures = [unopic1], 
                            organizations = [Organization1], 
                            deposit = 5, 
                            storage_location = "Shelf 1", 
                            faults = "none", 
                            name = "Uno", 
                            description = "A card game for 2-10 players")
    uno1.tags.append(game_tag)

    uno2 = PhysicalObject(  inv_num_internal = 2,
                            inv_num_external = 2,
                            pictures = [unopic1, unopic2],
                            organizations = [Organization1], 
                            deposit = 5,
                            storage_location = "Shelf 1",
                            faults = "Kapuuuut",
                            name = "Uno",
                            description = "A card game for 2-10 players")
    uno2.tags.append(game_tag)

    cablespic1 = Picture(path = "Cables.jpg")
    cables = PhysicalObject(    inv_num_internal = 1,
                                inv_num_external = 3,
                                pictures = [cablespic1],
                                organizations = [Organization1], 
                                deposit = 0,
                                storage_location = "Shelf 2",
                                faults = "none",
                                name = "Cables",
                                description = "A bunch of cables")
    cables.tags.append(hardware_tag)

    boxespic1 = Picture(path = "Boxes.jpg")
    boxespic2 = Picture(path = "Boxes2.jpg")
    boxes = PhysicalObject(  inv_num_internal = 4,
                            inv_num_external = 4,
                            pictures = [boxespic1, boxespic2],
                            organizations = [Organization1], 
                            deposit = 0,
                            storage_location = "Shelf 2",
                            faults = "none",
                            name = "Boxes",
                            description = "A bunch of boxes")
    boxes.tags.append(hardware_tag)

    amplifierpic1 = Picture(path = "Amplifier.jpg")
    amplifierpic2 = Picture(path = "Amplifier2.jpg")
    amplifier = PhysicalObject(  inv_num_internal = 5,
                                inv_num_external = 5,
                                pictures = [amplifierpic1, amplifierpic2],
                                organizations = [Organization1], 
                                deposit = 10,
                                storage_location = "Shelf 3",
                                faults = "none",
                                name = "Amplifier",
                                description = "An amplifier")
    amplifier.tags.append(hardware_tag)

    db.add(uno1)
    db.add(uno2)
    db.add(cables)
    db.add(boxes)
    db.add(amplifier)

    person1 = User(     first_name = "Peter",
                        last_name = "Parker",
                        email = "peter.parker@gmail.com",
                        password_hash = "$2b$12$Rz15qP9U7cR3JVVZg2uTCu2CghfqpHNqqaw4Abe7uQKdpNIYOfRzu")

    person2 = User(     first_name = "Tony",
                        last_name = "Stark",
                        email = "tony.stark@gmail.com",
                        password_hash = "$2b$12$T79qNs7Z2HklCfChLBn28e47Ow55eeesOKU8pBNWJ/O0fH.u16ZkS")

    person3 = User(     first_name = "Max",
                        last_name = "Mustermann",
                        email = "max@mustermann.de",
                        password_hash = "$2b$12$NIiwz9bxK9lXoYH.bzi66eo67LgzuA6/LaJVetxhA5Co4ZblX5ZKy")

    db.add(person1)
    db.add(person2)
    db.add(person3)
    Organization1.addUser(person2)

    music_system = Group(   name = "Music System")

    music_system.physicalobjects.append(amplifier)
    music_system.physicalobjects.append(boxes)
    music_system.physicalobjects.append(cables)

    uno1_group = Group( name = "Uno1")
    uno1_group.physicalobjects.append(uno1)

    uno2_group = Group( name = "Uno2")
    uno2_group.physicalobjects.append(uno2)

    db.add(uno1_group)
    db.add(uno2_group)
    db.add(music_system)

    uno_order = Order(from_date = datetime.strptime("2019-01-01 10:00:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2019-01-02 12:00:00", "%Y-%m-%d %H:%M:%S"))
    uno_order.users.append(person1)
    uno_order.addPhysicalObject(uno1)

    music_order = Order(from_date = datetime.strptime("2019-05-01 10:20:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2019-09-02 12:30:00", "%Y-%m-%d %H:%M:%S"))
    music_order.users.append(person1)
    music_order.addPhysicalObject(amplifier)
    music_order.addPhysicalObject(boxes)
    music_order.addPhysicalObject(cables)

    db.add(uno_order)
    db.add(music_order)

    db.commit()
    wasserkocherpic1 = Picture(path = "Wasserkocher.jpg")
    wasserkocherpic2 = Picture(path = "Wasserkocher2.jpg")
    Wasserkocher = PhysicalObject(  inv_num_internal = 1,
                                    inv_num_external = 1,
                                    deposit = 7,
                                    pictures = [wasserkocherpic1, wasserkocherpic2],
                                    storage_location = "Regal 1",
                                    faults = "Vielleicht",
                                    name = "Wasserkocher",
                                    description = "Ein Wasserkocher")
    Wasserkocher.pictures.append(wasserkocherpic1)
    Wasserkocher.pictures.append(wasserkocherpic2)

    kaffeemaschinepic1 = Picture(path = "Kaffeemaschine.jpg")
    kaffeemaschinepic2 = Picture(path = "Kaffeemaschine2.jpg")
    Kaffeemaschine = PhysicalObject( inv_num_internal = 2,
                                    inv_num_external = 2,
                                    pictures = [kaffeemaschinepic1, kaffeemaschinepic2],
                                    deposit = 10,
                                    storage_location = "Regal 2",
                                    faults = "Nein",
                                    name = "Kaffeemaschine",
                                    description = "Eine Kaffeemaschine")
    Kaffeemaschine.pictures.append(kaffeemaschinepic1)
    Kaffeemaschine.pictures.append(kaffeemaschinepic2)

    db.add(Wasserkocher)
    db.add(Kaffeemaschine)

    order1 = Order(from_date = datetime.strptime("2024-05-20 11:00:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2024-05-22 12:00:00", "%Y-%m-%d %H:%M:%S"))
    order1.addPhysicalObject(Wasserkocher)
    order1.addPhysicalObject(Kaffeemaschine)

    db.add(order1)

    db.commit()