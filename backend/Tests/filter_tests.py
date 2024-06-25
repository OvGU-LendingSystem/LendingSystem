from Tests.fragments import *
from Tests.db_test_setups import testDB_1
from Tests.utils import to_std_dicts

#
#  Test Tag Filter
#
def test_tag_filter(client, test_db):
    testDB_1(test_db)

    # Test Tag Filter WITHOUT Input params
    executed = client.execute('''
    query{
        filterTags{
            ...tag
        }
    }''' + fragment_tag)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterTags': [
                {
                    'name': 'Cooking',
                    'physicalobjects': {'edges': []}
                },
                {
                    'name': 'Game',
                    'physicalobjects': {
                        'edges': [{'node': {'name': 'Uno'}}, {'node': {'name': 'Uno'}}]
                    }
                },
                {
                    'name': 'Hardware',
                    'physicalobjects': {'edges':[
                        {'node': {'name': 'Amplifier'}},
                        {'node': {'name': 'Boxes'}},
                        {'node': {'name': 'Cables'}}
                    ]}
                }
            ]
        }
    }

    msg = "Tag Filter with NO Input params failed"
    assert(result == expected), msg

    # Test Tag Filter with ID Input param
    executed = client.execute('''
    query	filterTag{
        filterTags(tagId: 1){
            ...tag
        }
    }''' + fragment_tag)
    expected = {
        'data': {
            'filterTags': [
                {
                    'name': 'Game',
                    'physicalobjects': {
                        'edges': [{'node': {'name': 'Uno'}}, {'node': {'name': 'Uno'}}]
                    }
                }
            ]
        }
    }
    result = to_std_dicts(executed)
    msg = "Filter with only ID Input param failed"
    assert(result == expected), msg

    # Test Tag Filter with NAME Input param
    executed = client.execute('''
    query	filterTag{
        filterTags(name: "Game"){
            ...tag
        }
    }''' + fragment_tag)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterTags': [
                {
                    'name': 'Game',
                    'physicalobjects': {'edges': [
                        {'node': {'name': 'Uno'}},
                        {'node': {'name': 'Uno'}}
                    ]}
                }
            ]
        }
    }
    msg = "Tag Filter with only NAME Input param failed"
    assert(result == expected), msg

    # Test Tag Filter with PHYSICALOBJECTS Input param
    executed = client.execute('''
    query	filterTag{
        filterTags(physicalobjects: 1){
            ...tag
        }
    }''' + fragment_tag)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterTags': [
                {
                    'name': 'Game',
                    'physicalobjects': {'edges': [
                        {'node': {'name': 'Uno'}},
                        {'node': {'name': 'Uno'}}
                    ]}
                }
            ]
        }
    }
    msg = "Tag Filter with only PHYSICALOBJECTS Input param failed"
    assert(result == expected), msg

    # Test Tag Filter with ALL Input params
    executed = client.execute('''
    query	filterTag{
        filterTags(tagId: 1, name: "Game", physicalobjects: 1){
            ...tag
        }
    }''' + fragment_tag)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterTags': [
                {
                    'name': 'Game',
                    'physicalobjects': {'edges': [
                        {'node': {'name': 'Uno'}},
                        {'node': {'name': 'Uno'}}
                    ]}
                }
            ]
        }
    }
    msg = "Tag Filter with ALL Input params failed"
    assert(result == expected), msg

#
#   Test PhysicalObject Filter
#
def test_physicalobject_filter(client, test_db):
    testDB_1(test_db)
    # Test PhysicalObject Filter WITHOUT Input params
    executed = client.execute('''
    query{
        filterPhysicalObjects{
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '5',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '6',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '3'}}]},
                    'groups': {'edges': []},
                    'organizations': {'edges': []}
                },
                {
                    'physId': '7',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 10,
                    'storageLocation': 'Regal 2',
                    'faults': 'Nein',
                    'name': 'Kaffeemaschine',
                    'description': 'Eine Kaffeemaschine',
                    'pictures': {'edges': [{'node': {'path': 'Kaffeemaschine.jpg'}}, {'node': {'path': 'Kaffeemaschine2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '3'}}]},
                    'groups': {'edges': []},
                    'organizations': {'edges': []}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with NO Input params failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with phys_ID Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(physId: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "Filter with only phys_ID Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with NAME Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(name: "Uno"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only NAME Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with INVNUMINTERNAL Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(invNumInternal: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '6',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '3'}}]},
                    'groups': {'edges': []},
                    'organizations': {'edges': []}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only INVNUMINTERNAL Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with INVNUMEXTERNAL Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(invNumExternal: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '6',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '3'}}]},
                    'groups': {'edges': []},
                    'organizations': {'edges': []}
                }
            ]
        }
    }

    msg = "PhysicalObject Filter with only INVNUMEXTERNAL Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with DEPOSIT Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(deposit: 5){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only DEPOSIT Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with MAX_DEPOSIT Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(maxDeposit: 5){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only MAX_DEPOSIT Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with STORAGELOCATION Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(storageLocation: "Shelf 1"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only STORAGELOCATION Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with FAULTS Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(faults: "none"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '5',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only FAULTS Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with DESCRIPTION Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(objDescription: "A card game for 2-10 players"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)	
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only DESCRIPTION Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with PICTURES Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(pictures: 2){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only PICTURES Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with TAGS Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(tags: 3){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '5',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only TAGS Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with ORDERS Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(orders: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only ORDERS Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with GROUPS Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(groups: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '5',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only GROUPS Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with ORGANIZATIONS Input param
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(organizations: 1){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '2',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'Kapuuuut',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': [{'node': {'path': 'Uno.jpg'}}, {'node': {'path': 'Uno2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': []},
                    'groups': {'edges': [{'node': {'name': 'Uno2'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '3',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '4',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '5',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '2'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with only ORGANIZATIONS Input param failed"
    assert(result == expected), msg

    # Test PhysicalObject Filter with multiple Input params
    executed = client.execute('''
    query	filterPhysicalObject{
        filterPhysicalObjects(name: "Uno", storageLocation: "Shelf 1", faults: "none"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '1',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '1'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with multiple Input params failed"
    assert(result == expected), msg