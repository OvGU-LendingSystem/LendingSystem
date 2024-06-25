from models import *
from datetime import datetime

def testDB_base(db):
    game_tag        = Tag(tag_id = "00000000-0000-0000-0000-000000000000", name = "Game")
    cooking_tag     = Tag(tag_id = "00000000-0000-0000-0000-000000000001", name = "Cooking")
    hardware_tag    = Tag(tag_id = "00000000-0000-0000-0000-000000000002", name = "Hardware")

    db.add(game_tag)
    db.add(cooking_tag)
    db.add(hardware_tag)

    Organization1 = Organization(   organization_id = "00000000-0000-0000-0000-000000000003",
                                    name = "Stark Industries", 
                                    location = "New York")

    db.add(Organization1)

    unopic1 = File(file_id = "00000000-0000-0000-0000-000000000004", path = "Uno.jpg", file_type = "picture")
    unopic2 = File(file_id = "00000000-0000-0000-0000-000000000005", path = "Uno2.jpg", file_type = "picture")
    uno1 = PhysicalObject(  phys_id = "00000000-0000-0000-0000-000000000006",
                            inv_num_internal = 1, 
                            inv_num_external = 1,
                            pictures = [unopic1], 
                            organizations = [Organization1], 
                            deposit = 5, 
                            storage_location = "Shelf 1", 
                            faults = "none", 
                            name = "Uno", 
                            description = "A card game for 2-10 players")
    uno1.tags.append(game_tag)

    uno2 = PhysicalObject(  phys_id = "00000000-0000-0000-0000-000000000007",
                            inv_num_internal = 2,
                            inv_num_external = 2,
                            pictures = [unopic1, unopic2],
                            organizations = [Organization1], 
                            deposit = 5,
                            storage_location = "Shelf 1",
                            faults = "Kapuuuut",
                            name = "Uno",
                            description = "A card game for 2-10 players")
    uno2.tags.append(game_tag)

    cablespic1 = File(file_id = "00000000-0000-0000-0000-000000000008", path = "Cables.jpg", file_type = "picture")
    cables = PhysicalObject(    phys_id = "00000000-0000-0000-0000-000000000009",
                                inv_num_internal = 1,
                                inv_num_external = 3,
                                pictures = [cablespic1],
                                organizations = [Organization1], 
                                deposit = 0,
                                storage_location = "Shelf 2",
                                faults = "none",
                                name = "Cables",
                                description = "A bunch of cables")
    cables.tags.append(hardware_tag)

    boxespic1 = File(file_id = "00000000-0000-0000-0000-000000000010", path = "Boxes.jpg", file_type = "picture")
    boxespic2 = File(file_id = "00000000-0000-0000-0000-000000000011", path = "Boxes2.jpg", file_type = "picture")
    boxes = PhysicalObject(  phys_id = "00000000-0000-0000-0000-000000000012",
                            inv_num_internal = 4,
                            inv_num_external = 4,
                            pictures = [boxespic1, boxespic2],
                            organizations = [Organization1], 
                            deposit = 0,
                            storage_location = "Shelf 2",
                            faults = "none",
                            name = "Boxes",
                            description = "A bunch of boxes")
    boxes.tags.append(hardware_tag)

    amplifierpic1 = File(file_id = "00000000-0000-0000-0000-000000000013", path = "Amplifier.jpg", file_type = "picture")
    amplifierpic2 = File(file_id = "00000000-0000-0000-0000-000000000014", path = "Amplifier2.jpg", file_type = "picture")
    amplifier = PhysicalObject(  phys_id = "00000000-0000-0000-0000-000000000015",
                                inv_num_internal = 5,
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

    person1 = User(     user_id = "00000000-0000-0000-0000-000000000016",
                        first_name = "Peter",
                        last_name = "Parker",
                        email = "peter.parker@gmail.com",
                        password_hash = "$2b$12$Rz15qP9U7cR3JVVZg2uTCu2CghfqpHNqqaw4Abe7uQKdpNIYOfRzu")

    person2 = User(     user_id = "00000000-0000-0000-0000-000000000017",
                        first_name = "Tony",
                        last_name = "Stark",
                        email = "tony.stark@gmail.com",
                        password_hash = "$2b$12$T79qNs7Z2HklCfChLBn28e47Ow55eeesOKU8pBNWJ/O0fH.u16ZkS")

    person3 = User(     user_id = "00000000-0000-0000-0000-000000000018",
                        first_name = "Max",
                        last_name = "Mustermann",
                        email = "max@mustermann.de",
                        password_hash = "$2b$12$NIiwz9bxK9lXoYH.bzi66eo67LgzuA6/LaJVetxhA5Co4ZblX5ZKy")

    db.add(person1)
    db.add(person2)
    db.add(person3)
    Organization1.addUser(person2)

    music_system = Group(   group_id = "00000000-0000-0000-0000-000000000019",
                            name = "Music System")

    music_system.physicalobjects.append(amplifier)
    music_system.physicalobjects.append(boxes)
    music_system.physicalobjects.append(cables)

    uno1_group = Group(     group_id = "00000000-0000-0000-0000-000000000020",
                            name = "Uno1")
    uno1_group.physicalobjects.append(uno1)

    uno2_group = Group(     group_id = "00000000-0000-0000-0000-000000000021",
                            name = "Uno2")
    uno2_group.physicalobjects.append(uno2)

    db.add(uno1_group)
    db.add(uno2_group)
    db.add(music_system)

    uno_order = Order(order_id = "00000000-0000-0000-0000-000000000022", from_date = datetime.strptime("2019-01-01 10:00:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2019-01-02 12:00:00", "%Y-%m-%d %H:%M:%S"))
    uno_order.users.append(person1)
    uno_order.addPhysicalObject(uno1)

    music_order = Order(order_id = "00000000-0000-0000-0000-000000000023", from_date = datetime.strptime("2019-05-01 10:20:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2019-09-02 12:30:00", "%Y-%m-%d %H:%M:%S"))
    music_order.users.append(person1)
    music_order.addPhysicalObject(amplifier)
    music_order.addPhysicalObject(boxes)
    music_order.addPhysicalObject(cables)

    db.add(uno_order)
    db.add(music_order)

    wasserkocherpic1 = File(file_id = "00000000-0000-0000-0000-000000000024", path = "Wasserkocher.jpg", file_type = "picture")
    wasserkocherpic2 = File(file_id = "00000000-0000-0000-0000-000000000025", path = "Wasserkocher2.jpg", file_type = "picture")
    Wasserkocher = PhysicalObject(  phys_id = "00000000-0000-0000-0000-000000000026",
                                    inv_num_internal = 1,
                                    inv_num_external = 1,
                                    deposit = 7,
                                    pictures = [wasserkocherpic1, wasserkocherpic2],
                                    storage_location = "Regal 1",
                                    faults = "Vielleicht",
                                    name = "Wasserkocher",
                                    description = "Ein Wasserkocher")
    Wasserkocher.pictures.append(wasserkocherpic1)
    Wasserkocher.pictures.append(wasserkocherpic2)

    kaffeemaschinepic1 = File(file_id = "00000000-0000-0000-0000-000000000027", path = "Kaffeemaschine.jpg", file_type = "picture")
    kaffeemaschinepic2 = File(file_id = "00000000-0000-0000-0000-000000000028", path = "Kaffeemaschine2.jpg", file_type = "picture")
    Kaffeemaschine = PhysicalObject( phys_id = "00000000-0000-0000-0000-000000000029",
                                    inv_num_internal = 2,
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

    order1 = Order(order_id = "00000000-0000-0000-0000-000000000030", from_date = datetime.strptime("2024-05-20 11:00:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2024-05-22 12:00:00", "%Y-%m-%d %H:%M:%S"))
    order1.addPhysicalObject(Wasserkocher)
    order1.addPhysicalObject(Kaffeemaschine)

    db.add(order1)

    db.commit()