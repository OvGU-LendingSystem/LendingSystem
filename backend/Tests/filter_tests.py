from Tests.fragments import *
from Tests.db_test_setups import testDB_1
from Tests.utils import to_std_dicts

def test_tag_filter(client, test_db):
    testDB_1(test_db)

    # Test Filter WITHOUT Input params
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

    msg = "Filter with NO Input params failed"
    assert(result == expected), msg

    # Test Filter with ID Input param
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

    # Test Filter with NAME Input param
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
    msg = "Filter with only NAME Input param failed"
    assert(result == expected), msg

    # Test Filter with PHYSICALOBJECTS Input param
    executed = client.execute('''
    query	filterTag{
        filterTags(physicalobjects: "Uno"){
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
    msg = "Filter with only PHYSICALOBJECTS Input param failed"
    assert(result == expected), msg

    # Test Filter with ALL Input params
    executed = client.execute('''
    query	filterTag{
        filterTags(tagId: 1, name: "Game", physicalobjects: "Uno"){
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
    msg = "Filter with ALL Input params failed"
    assert(result == expected), msg

def test_physicalobject_filter(client, test_db):
    testDB_1(test_db)
    assert(False), "Not implemented yet"