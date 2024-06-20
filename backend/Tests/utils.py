#https://github.com/graphql-python/graphene-sqlalchemy/blob/master/graphene_sqlalchemy/tests/utils.py

# ONLY USE FOR TESTING QUERIES ETC. WHERE YOU KNOW THAT IF THERE ARE NESTED DICTS AND LISTS THEY HAVE THE SAME KEYs

def to_std_dicts(value):
    """Convert nested ordered dicts to normal dicts for better comparison.\n
    Sorts Lists in a deterministic manner.\n
    ONLY USE FOR TESTING QUERIES ETC. WHERE YOU KNOW THAT IF THERE ARE NESTED DICTS AND LISTS THEY HAVE THE SAME KEYs
    """
    if isinstance(value, dict):
        return {k: to_std_dicts(v) for k, v in value.items()}
    elif isinstance(value, list):
        return my_sorted([to_std_dicts(v) for v in value])
    else:
        return value
    
def my_sorted(val):
    if len(val) == 0:
        return val
    if isinstance(val[0], dict):
        sortby = find_key_to_sort(val)
        if sortby == None:
            sortby = find_key_to_sort(val[0])
            return sorted(val, key = lambda x: x['node'][sortby])
        return sorted(val, key = lambda x: x[sortby])
    return sorted(val)

def find_key_to_sort(val):
    sortby = None
    if isinstance(val, list):
        tmp = val[0]
    if isinstance(val, dict):
        tmp = val['node']
    for k in tmp.keys():
        if not isinstance(tmp[k], (dict, list)):
            sortby = k
            break
    return sortby