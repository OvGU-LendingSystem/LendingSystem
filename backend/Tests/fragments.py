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

fragment_order = '''
    fragment order on Order{
        fromDate
        tillDate
        physicalobjects{
            edges{
                node{
                    orderStatus
                    returnDate
                    physicalobject{
                        name
                    }
                }
            }
        }
    }'''

fragment_user = '''
    fragment user on User{
        email
        firstName
        lastName
        organizations{
            edges{
                node{
                    organizationId
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
    }'''

fragment_group = '''
    fragment group on Group{
        name
        physicalobjects{
            edges{
                node{
                    name
                }
            }
        }
        pictures{
            edges{
                node{
                    path
                }
            }
        }
    }'''

fragment_organization = '''
    fragment organization on Organization{
        name
        location
        agb{
            edges{
                node{
                    path
                }
            }
        }
  			users{
          edges{
            node{
              rights
            }
          }
        }
        physicalobjects{
            edges{
                node{
                    name
                }
            }
        }
    }'''