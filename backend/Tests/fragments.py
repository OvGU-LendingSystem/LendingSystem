fragment_physicalobject = '''
    fragment physicalobject on PhysicalObject{
        physId
        invNumInternal
        invNumExternal
        deposit
        storageLocation
        faults
        name
        description
        pictures{
            edges{
                node{
                    path
                }
            }
        }
        tags {
            edges {
                node {
                    name
                }
            }
        }
        orders{
            edges{
                node{
                    orderId
                }
            }
        }
        groups{
            edges{
                node{
                    name
                }
            }
        }
        organizations{
            edges{
                node{
                    name
                }
            }
        }
    }'''

fragment_tag = '''
    fragment tag on Tag{
        name
        physicalobjects{
            edges{
                node{
                    name
                }
            }
        }
    }'''