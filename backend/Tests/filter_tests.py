from Tests.fragments import *
from Tests.utils import to_std_dicts

#
#  Test Tag Filter
#
def test_tag_filter(client, test_db):

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
        filterTags(tagId: "00000000-0000-0000-0000-000000000000"){
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
        filterTags(physicalobjects: "00000000-0000-0000-0000-000000000006"){
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
        filterTags(tagId: "00000000-0000-0000-0000-000000000000", name: "Game", physicalobjects: "00000000-0000-0000-0000-000000000006"){
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000015',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000026',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000030'}}]},
                    'groups': {'edges': []},
                    'organizations': {'edges': []}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000029',
                    'invNumInternal': 2,
                    'invNumExternal': 2,
                    'deposit': 10,
                    'storageLocation': 'Regal 2',
                    'faults': 'Nein',
                    'name': 'Kaffeemaschine',
                    'description': 'Eine Kaffeemaschine',
                    'pictures': {'edges': [{'node': {'path': 'Kaffeemaschine.jpg'}}, {'node': {'path': 'Kaffeemaschine2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000030'}}]},
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
        filterPhysicalObjects(physId: "00000000-0000-0000-0000-000000000006"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000026',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000030'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000026',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 7,
                    'storageLocation': 'Regal 1',
                    'faults': 'Vielleicht',
                    'name': 'Wasserkocher',
                    'description': 'Ein Wasserkocher',
                    'pictures': {'edges': [{'node': {'path': 'Wasserkocher.jpg'}}, {'node': {'path': 'Wasserkocher2.jpg'}}]},
                    'tags': {'edges': []},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000030'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000015',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
        filterPhysicalObjects(pictures: "00000000-0000-0000-0000-000000000005"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
        filterPhysicalObjects(tags: "00000000-0000-0000-0000-000000000002"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000015',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
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
        filterPhysicalObjects(orders: "00000000-0000-0000-0000-000000000022"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
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
        filterPhysicalObjects(groups: "00000000-0000-0000-0000-000000000019"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000015',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
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
        filterPhysicalObjects(organizations: "00000000-0000-0000-0000-000000000003"){
            ...physicalobject
        }
    }''' + fragment_physicalobject)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterPhysicalObjects': [
                {
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000007',
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
                    'physId': '00000000-0000-0000-0000-000000000009',
                    'invNumInternal': 1,
                    'invNumExternal': 3,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Cables',
                    'description': 'A bunch of cables',
                    'pictures': {'edges': [{'node': {'path': 'Cables.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000012',
                    'invNumInternal': 4,
                    'invNumExternal': 4,
                    'deposit': 0,
                    'storageLocation': 'Shelf 2',
                    'faults': 'none',
                    'name': 'Boxes',
                    'description': 'A bunch of boxes',
                    'pictures': {'edges': [{'node': {'path': 'Boxes.jpg'}}, {'node': {'path': 'Boxes2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
                    'groups': {'edges': [{'node': {'name': 'Music System'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                },
                {
                    'physId': '00000000-0000-0000-0000-000000000015',
                    'invNumInternal': 5,
                    'invNumExternal': 5,
                    'deposit': 10,
                    'storageLocation': 'Shelf 3',
                    'faults': 'none',
                    'name': 'Amplifier',
                    'description': 'An amplifier',
                    'pictures': {'edges': [{'node': {'path': 'Amplifier.jpg'}}, {'node': {'path': 'Amplifier2.jpg'}}]},
                    'tags': {'edges': [{'node': {'name': 'Hardware'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000023'}}]},
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
                    'physId': '00000000-0000-0000-0000-000000000006',
                    'invNumInternal': 1,
                    'invNumExternal': 1,
                    'deposit': 5,
                    'storageLocation': 'Shelf 1',
                    'faults': 'none',
                    'name': 'Uno',
                    'description': 'A card game for 2-10 players',
                    'pictures': {'edges': []},
                    'tags': {'edges': [{'node': {'name': 'Game'}}]},
                    'orders': {'edges': [{'node': {'orderId': '00000000-0000-0000-0000-000000000022'}}]},
                    'groups': {'edges': [{'node': {'name': 'Uno1'}}]},
                    'organizations': {'edges': [{'node': {'name': 'Stark Industries'}}]}
                }
            ]
        }
    }
    msg = "PhysicalObject Filter with multiple Input params failed"
    assert(result == expected), msg

def test_order_filter(client, test_db):

    # Test Order Filter with NO Input params
    executed = client.execute('''
    query	filterOrder{
        filterOrders{
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-01-01T10:00:00',
                    'tillDate': '2019-01-02T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': '2019-01-02T12:00:00',
                                    'physicalobject': {'name': 'Uno'}
                                }
                            }
                        ]
                    }
                },
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                },
                {
                    'fromDate': '2024-05-20T11:00:00',
                    'tillDate': '2024-05-22T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Wasserkocher'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Kaffeemaschine'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }

    msg = "Order Filter with no Input params failed"
    assert(result == expected), msg

    # Test Order Filter with ORDER_ID Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(orderId: "00000000-0000-0000-0000-000000000022"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-01-01T10:00:00',
                    'tillDate': '2019-01-02T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': '2019-01-02T12:00:00',
                                    'physicalobject': {'name': 'Uno'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only ORDER_ID Input param failed"
    assert(result == expected), msg

    # Test Order Filter with FROM_DATE Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(fromDate: "2019-05-01T10:20:00"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only FROM_DATE Input param failed"
    assert(result == expected), msg

    # Test Order Filter with TILL_DATE Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(tillDate: "2019-09-02T12:30:00"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only TILL_DATE Input param failed"
    assert(result == expected), msg

    # Test Order Filter with RETURN_DATE Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(returnDate: "2020-01-02T12:00:00"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-01-01T10:00:00',
                    'tillDate': '2019-01-02T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': '2019-01-02T12:00:00',
                                    'physicalobject': {'name': 'Uno'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only RETURN_DATE Input param failed"
    assert(result == expected), msg

    # Test Order Filter with ORDER_STATUS Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(orderStatus: "PENDING"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-01-01T10:00:00',
                    'tillDate': '2019-01-02T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': '2019-01-02T12:00:00',
                                    'physicalobject': {'name': 'Uno'}
                                }
                            }
                        ]
                    }
                },
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                },
                {
                    'fromDate': '2024-05-20T11:00:00',
                    'tillDate': '2024-05-22T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Wasserkocher'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Kaffeemaschine'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only ORDER_STATUS Input param failed"
    assert(result == expected), msg

    # Test Order Filter with PHYSICALOBJECTS Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(physicalobjects: "00000000-0000-0000-0000-000000000009"){
            ...order
        }
    }''' + fragment_order)
    
    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only PHYSICALOBJECTS Input param failed"
    assert(result == expected), msg

    # Test Order Filter with USERS Input param
    executed = client.execute('''
    query	filterOrder{
        filterOrders(users: "00000000-0000-0000-0000-000000000016"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-01-01T10:00:00',
                    'tillDate': '2019-01-02T12:00:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': '2019-01-02T12:00:00',
                                    'physicalobject': {'name': 'Uno'}
                                }
                            }
                        ]
                    }
                },
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with only USERS Input param failed"
    assert(result == expected), msg

    # Test Order Filter with multiple Input params
    executed = client.execute('''
    query	filterOrder{
        filterOrders(fromDate: "2019-05-01T10:20:00", tillDate: "2019-09-02T12:30:00", orderStatus: "PENDING"){
            ...order
        }
    }''' + fragment_order)

    result = to_std_dicts(executed)
    expected = {
        'data': {
            'filterOrders': [
                {
                    'fromDate': '2019-05-01T10:20:00',
                    'tillDate': '2019-09-02T12:30:00',
                    'physicalobjects': {
                        'edges': [
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Amplifier'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Boxes'}
                                }
                            },
                            {
                                'node': {
                                    'orderStatus': 'PENDING',
                                    'returnDate': None,
                                    'physicalobject': {'name': 'Cables'}
                                }
                            }
                        ]
                    }
                }
            ]
        }
    }
    msg = "Order Filter with multiple Input params failed"
    assert(result == expected), msg