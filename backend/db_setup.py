from datetime import datetime
from config import engine, db
from models import *

Base.metadata.create_all(bind = engine)

game_tag        = Tag(name = "Game")
cooking_tag     = Tag(name = "Cooking")
hardware_tag    = Tag(name = "Hardware")

db.add(game_tag)
db.add(cooking_tag)
db.add(hardware_tag)

Organization1 = Organization(name = "Stark Industries", 
                             location = "New York")

db.add(Organization1)

uno1 = PhysicalObject(  inv_num_internal = 1, 
                        inv_num_external = 1,
                        pic_path = "uno.jpg", 
                        organizations = [Organization1], 
                        deposit = 5, 
                        storage_location = "Shelf 1", 
                        faults = "none", 
                        name = "Uno", 
                        description = "A card game for 2-10 players")
                        # tag = (game_tag))
uno1.tags.append(game_tag)

uno2 = PhysicalObject(  inv_num_internal = 2,
                        inv_num_external = 2,
                        pic_path = "uno2.jpg",
                        organizations = [Organization1], 
                        deposit = 5,
                        storage_location = "Shelf 1",
                        faults = "Kapuuuut",
                        name = "Uno",
                        description = "A card game for 2-10 players")
uno2.tags.append(game_tag)

cables = PhysicalObject(    inv_num_internal = 1,
                            inv_num_external = 3,
                            pic_path = "cables.jpg",
                            organizations = [Organization1], 
                            deposit = 0,
                            storage_location = "Shelf 2",
                            faults = "none",
                            name = "Cables",
                            description = "A bunch of cables")
cables.tags.append(hardware_tag)

boxes = PhysicalObject(  inv_num_internal = 4,
                        inv_num_external = 4,
                        pic_path = "boxes.jpg",
                        organizations = [Organization1], 
                        deposit = 0,
                        storage_location = "Shelf 2",
                        faults = "none",
                        name = "Boxes",
                        description = "A bunch of boxes")
boxes.tags.append(hardware_tag)

amplifier = PhysicalObject(  inv_num_internal = 5,
                            inv_num_external = 5,
                            pic_path = "amplifier.jpg",
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
                    password_hash = "password")

person2 = User(     first_name = "Tony",
                    last_name = "Stark",
                    email = "tony.stark@gmail.com",
                    password_hash = "password1")

db.add(person1)
db.add(person2)

# Organization1.members.append(person2)

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
# uno_order.borrowers.append(person1)
uno_order.physicalobjects.append(uno1)

music_order = Order(from_date = datetime.strptime("2019-05-01 10:20:00", "%Y-%m-%d %H:%M:%S"), till_date = datetime.strptime("2019-09-02 12:30:00", "%Y-%m-%d %H:%M:%S"))
# music_order.borrowers.append(person1)
music_order.physicalobjects.append(amplifier)
music_order.physicalobjects.append(boxes)
music_order.physicalobjects.append(cables)

db.add(uno_order)
db.add(music_order)

db.commit()

# der_austronaut = Book(title = "Der Astronaut")
# der_marsianer = Book(title = "Der Marsianer")
# Hyperoion = Book(title = "Die Hyperion Gesänge")
# db.add(der_austronaut)
# db.add(der_marsianer)
# db.add(Hyperoion)
# andy = Author(first_name = "Andy", last_name = "Weir", books = [der_austronaut, der_marsianer])
# dan = Author(first_name = "Dan", last_name = "Simons", books = [Hyperoion, der_marsianer])
# db.add(andy)
# db.add(dan)

# db.commit()

# Fill the tables with some data
# engineering = Department(name='Engineering')
# db.add(engineering)
# hr = Department(name='Human Resources')
# db.add(hr)

# peter = Employee(name='Peter', department=engineering)
# db.add(peter)
# roy = Employee(name='Roy', department=engineering)
# db.add(roy)
# tracy = Employee(name='Tracy', department=hr)
# db.add(tracy)
# db.commit()